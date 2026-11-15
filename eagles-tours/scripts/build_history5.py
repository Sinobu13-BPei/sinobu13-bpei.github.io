#!/usr/bin/env python3
"""Build verified Eagles D1 league match history from the club's official archives.

This script does not publish partial/ambiguous match classification. Only matches
with matching season totals and mutually consistent match metadata are accepted.
"""
import datetime
import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "history5.json"
UA = {"User-Agent": "Mozilla/5.0 (EaglesFanTours/1.0; historical league audit)"}
JST = datetime.timezone(datetime.timedelta(hours=9))
DATE = re.compile(r"(?<!\d)(?:(?:20\d{2})[./])?\d{1,2}[./]\d{1,2}(?:\s*\([月火水木金土日]\)|\s+(?:MON|TUE|WED|THU|FRI|SAT|SUN))?", re.I)
SCORE = re.compile(r"(?<!\d)(\d{1,3})\s+FULL\s+TIME\s+(\d{1,3})(?!\d)", re.I)
ROUND = re.compile(r"NTTリーグワン(?:20\d{2}(?:-\d{2})?)\s+第\s*(\d{1,2})\s*節\s+(.+?)\s+NTTリーグワン", re.S)
SHORT_CODE = re.compile(r"\s+(?:横浜E|静岡BR|埼玉WK|神戸S|S東京ベイ|東京SG|BL東京|BR東京|相模原DB|浦安DR|三重H|トヨタV|GR東葛|NTTコム)\s*$")

def normalize(x):
    return re.sub(r"\s+", " ", x or "").strip()

def iso_date(token, season):
    start = int(season[:4])
    digits = re.findall(r"\d+", token)
    if len(digits) >= 3 and len(digits[0]) == 4:
        year, month, day = map(int, digits[:3])
    else:
        if len(digits) < 2:
            raise ValueError("missing month/day: " + token)
        month, day = map(int, digits[:2])
        year = start if month >= 7 else start + 1
    if season == "2021-22" and year == 2021:
        raise ValueError("2021-22 inaugural league match cannot be in 2021")
    return datetime.date(year, month, day).isoformat()

def extract_season(season_data):
    season = season_data["season"]
    url = season_data["fixture"]
    response = requests.get(url, headers=UA, timeout=35)
    response.raise_for_status()
    response.encoding = "utf-8"  # Official Japanese page sends UTF-8 without reliable charset header.
    page = BeautifulSoup(response.text, "html.parser")
    text = normalize(page.get_text(" ", strip=True))
    print(f"DIAG {season}: page chars={len(text)}, score_tokens={len(SCORE.findall(text))}, full_times={text.count('FULL TIME')}, rounds={len(re.findall(r'第\\s*\\d+\\s*節', text))}, sample={text[100:250]!r}")
    hits = {}
    for score in SCORE.finditer(text):
        before = text[max(0, score.start() - 370):score.start()]
        dates = list(DATE.finditer(before))
        if not dates:
            continue
        day = dates[-1]
        after = text[score.end():score.end() + 580]
        round_match = ROUND.search(after)
        if not round_match:
            continue  # Excludes practice matches, play-offs and other competitions.
        rnd = int(round_match.group(1))
        if rnd < 1 or rnd > season_data["expected"]:
            continue
        first_side = before[day.end():]
        second_side = after[:round_match.start()]
        first_eagles = "横浜キヤノン" in first_side
        second_eagles = "横浜キヤノン" in second_side
        if first_eagles == second_eagles:
            continue
        for_pts, against = (int(score.group(1)), int(score.group(2)))
        if for_pts > 150 or against > 150:
            continue
        if not first_eagles:
            for_pts, against = against, for_pts
        try:
            date = iso_date(day.group(0), season)
        except ValueError:
            continue
        if date[:4] not in (season[:4], str(int(season[:4]) + 1)):
            continue
        venue = normalize(round_match.group(2)).split(" マッチレポート")[0]
        # Trim optional event names after the stadium; preserve source-verbatim venue.
        venue = venue[:160]
        opponent_raw = second_side if first_eagles else first_side
        opponent_raw = SHORT_CODE.sub("", normalize(opponent_raw))
        opponent_raw = opponent_raw.replace("横浜キヤノン イーグルス", "").strip()
        if not opponent_raw:
            opponent_raw = "相手チーム名未特定"
        record = {
            "season": season, "round": rnd, "date": date,
            "role": "H" if first_eagles else "A",
            "scored": for_pts, "conceded": against,
            "opponent": opponent_raw[:100],
            "venue": venue,
            "source": url,
        }
        if rnd in hits and hits[rnd] != record:
            raise ValueError(f"{season} round {rnd}: conflicting source cards")
        hits[rnd] = record
    result = [hits[i] for i in sorted(hits)]
    wins = sum(g["scored"] > g["conceded"] for g in result)
    draws = sum(g["scored"] == g["conceded"] for g in result)
    losses = sum(g["scored"] < g["conceded"] for g in result)
    actual = (len(result), wins, draws, losses)
    target = (season_data["expected"], season_data["wins"], season_data["draws"], season_data["losses"])
    if actual != target:
        raise ValueError(f"{season}: did not pass official history cross-check, got={actual}, expected={target}; no unverified data published")
    return result

def main():
    state = json.loads(DATA.read_text(encoding="utf-8"))
    warnings = []
    all_games = []
    for season in state["seasons"]:
        try:
            games = extract_season(season)
            all_games.extend(games)
            print(f"verified {season['season']}: {len(games)} league games")
        except Exception as exc:
            warnings.append(str(exc))
    expected = sum(s["expected"] for s in state["seasons"])
    if warnings or len(all_games) != expected:
        print("Historical detail not published until all five seasons pass validation.")
        print("\n".join(warnings))
        # Keep previously verified detailed records, if already available.
        if not state.get("verified_games"):
            state["status"] = "シーズン別の公式集計は確認済み。個別試合の精査中（ホーム／アウェー・月別は暫定値を出しません）。"
            state["warnings"] = warnings
            DATA.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return
    all_games.sort(key=lambda g: (g["date"], g["season"], g["round"]))
    state["verified_games"] = True
    state["games"] = all_games
    state["warnings"] = []
    state["updated_at"] = datetime.datetime.now(JST).date().isoformat()
    state["status"] = "公式5シーズンの全リーグ戦84試合を照合済み（練習試合・プレーオフ・中止を除外）。"
    DATA.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Verified all", len(all_games), "league games.")

if __name__ == "__main__":
    main()
