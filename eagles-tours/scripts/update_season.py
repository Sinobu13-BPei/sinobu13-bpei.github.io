#!/usr/bin/env python3
"""Verify Eagles league results and Division 1 standings from official sites.
Only publish final scores when round, date and home/away orientation all match.
"""
import datetime
import json
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "season.json"
RESULTS = "https://www.canon-eagles.jp/gameinfo/2026-2027/"
STANDINGS = "https://league-one.jp/standings/?t1=1&year=2026"
JST = datetime.timezone(datetime.timedelta(hours=9))
UA = {"User-Agent": "Mozilla/5.0 (EaglesFanTours/1.0; weekly results checker)"}

# Match dates and home/visitor role checked against published 2026–27 fixture list.
FIXTURES = [
 ("2026.12.13", "A"), ("2026.12.20", "H"), ("2026.12.27", "A"),
 ("2027.1.9", "H"), ("2027.1.16", "A"), ("2027.1.23", "H"),
 ("2027.2.6", "A"), ("2027.2.13", "H"), ("2027.2.20", "A"),
 ("2027.2.28", "H"), ("2027.3.12", "A"), ("2027.3.20", "H"),
 ("2027.3.28", "A"), ("2027.4.4", "H"), ("2027.4.17", "A"),
 ("2027.4.24", "H"), ("2027.5.1", "A"), ("2027.5.9", "H")
]

def clean(s):
    return re.sub(r"\s+", " ", s or "").strip()

def soup(url):
    response = requests.get(url, headers=UA, timeout=35)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")

def to_date_token(s):
    return ".".join(str(int(n)) if i else n for i, n in enumerate(s.split(".")))

def official_scores(page):
    """Read scorecards by date with score position verified against team order.

    The official club page shows 'TEAM A 27 FULL TIME 39 TEAM B'.
    Match results are not read from training matches or future cards.
    """
    official_part = page
    for heading in page.find_all(["h3", "h4"]):
        if "練習試合" in clean(heading.get_text(" ", strip=True)):
            # The document contains a separate practice-match section.
            practice = heading
            official_part = page  # We still guard by 18 known dates below.
            break
    text = clean(official_part.get_text(" ", strip=True))
    blocks = re.split(r"(?=20(?:26|27)\.\d{1,2}\.\d{1,2}(?!\d))", text)
    verified = {}
    for block in blocks:
        day_match = re.match(r"(20(?:26|27)\.\d{1,2}\.\d{1,2})(?!\d)", block)
        if not day_match:
            continue
        day = to_date_token(day_match.group(1))
        possible = [i + 1 for i, (fixture_day, _) in enumerate(FIXTURES) if to_date_token(fixture_day) == day]
        if len(possible) != 1:
            continue
        rnd = possible[0]
        score = re.search(r"(?<!\d)(\d{1,3})\s+FULL\s+TIME\s+(\d{1,3})(?!\d)", block, re.I)
        if not score:
            continue
        round_match = re.search(r"NTTリーグワン2026-27\s+第\s*(\d{1,2})\s*節", block)
        if not round_match or int(round_match.group(1)) != rnd:
            continue
        before, after = block[:score.start()], block[score.end():]
        first_is_eagles = "横浜キヤノン" in before
        second_is_eagles = "横浜キヤノン" in after
        # Refuse anything ambiguous: results must have exactly one side identified.
        if first_is_eagles == second_is_eagles:
            continue
        role = FIXTURES[rnd - 1][1]
        if (role == "H") != first_is_eagles:
            continue
        one, two = int(score.group(1)), int(score.group(2))
        if one > 150 or two > 150:
            continue
        eagles, opponent = (one, two) if first_is_eagles else (two, one)
        verified[str(rnd)] = {
            "for": eagles, "against": opponent, "verified": True,
            "source": RESULTS, "source_status": "FULL TIME"
        }
    return verified

def standings(page):
    for table in page.select("table"):
        heading = clean(table.get_text(" ", strip=True))
        if "横浜キヤノンイーグルス" not in heading or "勝点" not in heading:
            continue
        rows = []
        for tr in table.select("tr"):
            cells = [clean(c.get_text(" ", strip=True)) for c in tr.find_all("td", recursive=False)]
            if len(cells) < 8:
                continue
            name_idx = next((i for i, cell in enumerate(cells)
                if any(name in cell for name in (
                  "イーグルス", "ブルーレヴズ", "スピアーズ",
                  "サンゴリアス", "ワイルドナイツ", "ブラックラムズ",
                  "D-Rocks", "ヴェルブリッツ", "ダイナボアーズ",
                  "ホンダヒート", "スティーラーズ", "ブレイブルーパス"
                ))), None)
            if name_idx is None:
                continue
            nums = cells[name_idx + 1:]
            if len(nums) < 5 or not all(re.fullmatch(r"\d+", n) for n in nums[:5]):
                continue
            rank = cells[0]
            if not re.fullmatch(r"(?:\d+|-)", rank):
                continue
            rows.append({
                "rank": rank, "team": cells[name_idx],
                "played": int(nums[0]), "points": int(nums[1]),
                "wins": int(nums[2]), "draws": int(nums[3]),
                "losses": int(nums[4])
            })
        if len(rows) == 12 and len({r["team"] for r in rows}) == 12:
            return rows
    return None

def main():
    state = json.loads(DATA.read_text(encoding="utf-8"))
    now = datetime.datetime.now(JST)
    checked_at = now.isoformat(timespec="minutes")
    warnings = []
    scores_changed = False
    standings_changed = False
    try:
        fresh = official_scores(soup(RESULTS))
        original = state.get("scores") or {}
        # Keep previously verified scores if the official page is temporarily unavailable.
        combined = dict(original)
        combined.update(fresh)
        if combined != original:
            state["scores"] = combined
            scores_changed = True
    except Exception as error:
        warnings.append("公式試合結果の照会に失敗: " + str(error))
    try:
        fresh_ranking = standings(soup(STANDINGS))
        if fresh_ranking is not None:
            if fresh_ranking != state.get("standings", []):
                state["standings"] = fresh_ranking
                standings_changed = True
        else:
            warnings.append("公式順位の表構造が判定できませんでした")
    except Exception as error:
        warnings.append("公式順位の照会に失敗: " + str(error))
    state["last_checked_at"] = checked_at
    if scores_changed or standings_changed:
        state["updated_at"] = now.date().isoformat()
    state["status"] = ("試合結果・順位の自動確認を実施（確認済みデータのみ掲載）"
                       if not warnings else "一部確認待ち。最新情報は公式サイトをご確認ください")
    state["update_warnings"] = warnings
    DATA.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "checked_at": checked_at, "verified_scores": len(state.get("scores", {})),
        "scores_changed": scores_changed, "standings_changed": standings_changed,
        "warnings": warnings
    }, ensure_ascii=False), file=sys.stdout)

if __name__ == "__main__":
    main()
