#!/usr/bin/env python3
"""Conservative weekly update from official rugby sources.
Keeps the previous verified values when source structure is ambiguous.
"""
import datetime, json, re, sys
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"data"/"season.json"
RESULTS="https://www.canon-eagles.jp/gameinfo/2026-2027/"
STANDINGS="https://league-one.jp/standings/?t1=1&year=2026"
UA={"User-Agent":"Mozilla/5.0 (compatible; EaglesFanTours/1.0)"}

def soup(url):
    r=requests.get(url,headers=UA,timeout=30)
    r.raise_for_status()
    return BeautifulSoup(r.text,"html.parser")

def clean(s):
    return re.sub(r"\\s+"," ",s or "").strip()

def standings(s):
    for t in s.select("table"):
        plain=clean(t.get_text(" ",strip=True))
        if "横浜キヤノンイーグルス" not in plain or "勝点" not in plain: continue
        records=[]
        for tr in t.select("tr"):
            v=[clean(c.get_text(" ",strip=True)) for c in tr.find_all("td",recursive=False)]
            if len(v)<8:continue
            idx=next((i for i,x in enumerate(v) if any(z in x for z in ("イーグルス","ブルーレヴズ","スピアーズ","サンゴリアス","ワイルドナイツ","ブラックラムズ","D-Rocks","ヴェルブリッツ","ダイナボアーズ","ホンダヒート","スティーラーズ","ブレイブルーパス"))),None)
            if idx is None:continue
            nums=v[idx+1:]
            if len(nums)<7 or not all(re.fullmatch(r"-?\\d+",x) for x in nums[:7]):continue
            rank=v[0]
            if rank!="-" and not rank.isdecimal():continue
            records.append({"rank":rank,"team":v[idx],"played":int(nums[0]),"points":int(nums[1]),"wins":int(nums[2]),"draws":int(nums[3]),"losses":int(nums[4]),"diff":int(nums[7]) if len(nums)>7 and re.fullmatch(r"-?\\d+",nums[7]) else None})
        if len(records)==12 and len({r["team"] for r in records})==12:return records
    return None

def scores(s):
    """Only accept cards with explicit round, team and clear FULL TIME score.
    Avoid inferring home/away ordering from uncertain markup."""
    verified={}
    for card in s.select("article,.game-card,.game-card-wrapper,.match-card"):
        txt=clean(card.get_text(" ",strip=True))
        if "FULL TIME" not in txt or "横浜キヤノン" not in txt:continue
        round_match=re.search(r"第\\s*(\\d{1,2})\\s*節",txt)
        if not round_match:continue
        score=re.search(r"(?<!\\d)(\\d{1,3})\\s*FULL\\s*TIME\\s*(\\d{1,3})(?!\\d)",txt,re.I)
        if not score:continue
        # Score orientation is not proven by page text alone. Do not publish guesses.
        print("Round",round_match.group(1),"has a full-time score; manual orientation verification required")
    return verified

def main():
    d=json.loads(DATA.read_text(encoding="utf-8"))
    warnings=[]
    try:
        sc=scores(soup(RESULTS))
        if sc:d.setdefault("scores",{}).update(sc)
        else:warnings.append("試合結果の自動検証が未完了")
    except Exception as exc:warnings.append("結果参照に失敗: "+str(exc))
    try:
        st=standings(soup(STANDINGS))
        if st:d["standings"]=st
        else:warnings.append("公式順位表を確実に解釈できませんでした")
    except Exception as exc:warnings.append("順位参照に失敗: "+str(exc))
    today=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d")
    d["last_checked_at"]=today
    if not warnings:
        d["updated_at"]=today
        d["status"]="公式データを確認済み"
    else:
        d["status"]="一部確認待ち：未確認データは公式リンクを参照してください"
    d["update_warnings"]=warnings
    DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\\n",encoding="utf-8")
    print(d["status"],warnings,file=sys.stderr)
if __name__=="__main__":main()
