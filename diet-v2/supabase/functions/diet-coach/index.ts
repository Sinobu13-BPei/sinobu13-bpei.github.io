import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) throw new Error("OPENAI_API_KEY is not configured");

    const { action, payload } = await req.json();

    const healthContext =
      "54歳男性。身長173cm。減量支援では極端な絶食・脱水を避け、単日の体重変化に過剰反応しない。医療診断は行わず、体調不良や強い症状は医療機関相談を勧める。";

    let requestBody: Record<string, unknown>;

    if (action === "meal_estimate") {
      if (!payload?.image) throw new Error("image is required");

      requestBody = {
        model: "gpt-5.6-luna",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "日本人向けの食事記録アシスタント。写真から料理名、見える量、推定カロリー、PFCを概算する。断定せず必ず推定幅と確信度を返す。" +
                  healthContext,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "分類:" +
                  (payload.kind || "未指定") +
                  " 補足:" +
                  (payload.note || "なし") +
                  '\n次のJSONだけを返してください: {"summary":"","kcal":650,"range":"550〜780 kcal","protein_g":30,"carbs_g":80,"fat_g":20,"confidence":"中"}',
              },
              { type: "input_image", image_url: payload.image },
            ],
          },
        ],
      };
    } else if (action === "daily_coach") {
      requestBody = {
        model: "gpt-5.6-luna",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "減量行動コーチ。体重、食事、水分、歩数、睡眠、行動チェック、今後の出張・会食予定を横断して、短く具体的に助言する。" +
                  healthContext,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  JSON.stringify(payload) +
                  "\n今日の評価、良かった点、明日の最重要3点、出張・会食があれば先回り対策を300〜500字で日本語で。",
              },
            ],
          },
        ],
      };
    } else {
      throw new Error("Unknown action");
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || "OpenAI API error");

    const text =
      j.output_text ||
      j.output?.flatMap((x: any) => x.content || []).map((x: any) => x.text || "").join("") ||
      "";

    if (action === "meal_estimate") {
      const cleaned = String(text).replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
      return json(JSON.parse(cleaned));
    }

    return json({ text });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 400);
  }
});
