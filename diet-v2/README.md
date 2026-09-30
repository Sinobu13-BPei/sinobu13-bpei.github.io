# SHINOBU HEALTH 25 Ver.2

GitHub Pages front-end + Supabase Auth/DB/Storage + Supabase Edge Function + OpenAI Responses API.

## Current tracking
- 体重 / 腹囲 / 歩数 / 水分 / 睡眠時間
- 食事・飲み物（写真/手入力、推定kcal）
- 出張・会食・学会などの予定
- 7日サマリー（平均体重・歩数・水分・睡眠）
- GPT相談用コンテキストに睡眠も含める

## Cloud setup
1. Supabase projectを作成/選択。
2. `supabase/schema.sql` をSQL Editorで実行。
3. `supabase/functions/diet-coach/index.ts` を `diet-coach` Edge Functionとしてデプロイ。
4. Edge Function Secretに `OPENAI_API_KEY` を登録。
5. Auth Redirect URLへGitHub PagesのURLを追加。
6. `config.js` にSupabase Project URLとPublishable/anon keyを設定。
7. ログイン後、daily_logs / plans / meal_photos と非公開Storageへ同期。

OpenAI APIキーやservice_role keyはGitHub Pagesへ置かないこと。
