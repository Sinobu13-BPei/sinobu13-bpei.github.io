#!/usr/bin/env python3
"""Match legacy 8,019 hospitals with MHLW Navi 2026-06-01 official hospital facility data.

Evidence policy: a deterministic one-to-one exact match on prefecture,
normalized full hospital name, and full location is called '確定一致' (machine).
Similar name/address is ONLY '要確認'; no guessed official code is written.
This official Navi ID is not the medical-institution billing code.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import sys
import unicodedata
import urllib.request
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from rapidfuzz import fuzz, process

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
LEGACY = DATA / "legacy-hospitals-20261122.csv"
OFFICIAL_URL = "https://www.mhlw.go.jp/content/11121000/01-1_hospital_facility_info_20260601.csv.zip"
OFFICIAL_PAGE = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html"
OFFICIAL_ZIP_SHA256 = "b416472ec52a151455e1c91438e0dec5b471e19eafe70e3e2ee1bb22544efe87"
AS_OF = "2026-06-01"
PREFS = "北海道 青森 岩手 宮城 秋田 山形 福島 茨城 栃木 群馬 埼玉 千葉 東京 神奈川 新潟 富山 石川 福井 山梨 長野 岐阜 静岡 愛知 三重 滋賀 京都 大阪 兵庫 奈良 和歌山 鳥取 島根 岡山 広島 山口 徳島 香川 愛媛 高知 福岡 佐賀 長崎 熊本 大分 宮崎 鹿児島 沖縄".split()
PREF_CODE = {f"{i:02d}": p for i, p in enumerate(PREFS, start=1)}
SUFFIXES = {p: p + ("都" if p == "東京" else "府" if p in ("大阪", "京都") else "県") for p in PREFS if p != "北海道"}
PREF_FULL = sorted(["北海道"] + list(SUFFIXES.values()), key=len, reverse=True)
COLS_REQUIRED = ["ID", "正式名称", "機関区分", "都道府県コード", "市区町村コード", "所在地",
                 "所在地座標（緯度）", "所在地座標（経度）", "合計病床数"]
OUT_COLS = ["facility_uid", "legacy_prefecture", "legacy_name", "legacy_address", "match_status",
            "match_method", "navi_facility_id_confirmed", "navi_facility_id_candidate",
            "navi_name_candidate", "navi_address_candidate", "navi_prefecture_code_candidate",
            "navi_city_code_candidate", "navi_latitude_candidate", "navi_longitude_candidate",
            "navi_beds_candidate", "name_similarity", "address_similarity", "review_reason",
            "source_data_as_of", "source_url", "source_zip_sha256", "checked_at_utc"]

def value(v):
    if pd.isna(v):
        return ""
    return str(v).strip()

def prefixless(s):
    for p in PREF_FULL:
        if s.startswith(p):
            return s[len(p):]
    return s

def pref(s):
    s = unicodedata.normalize("NFKC", value(s)).strip()
    if s == "北海道":
        return s
    for suffix in ("都", "府", "県"):
        if s.endswith(suffix):
            s = s[:-1]
            break
    return s

def name_key(s):
    s = unicodedata.normalize("NFKC", value(s)).lower()
    return re.sub(r"[\s・･,，、。．./／\-\(\)（）\[\]「」『』【】]", "", s)

def address_key(s):
    s = unicodedata.normalize("NFKC", value(s)).lower().strip()
    s = re.sub(r"^〒?\s*\d{3}-?\d{4}\s*", "", s)
    s = prefixless(s)
    s = s.translate(str.maketrans({"−":"-", "―":"-", "‐":"-", "–":"-", "ー":"-", "－":"-"}))
    s = re.sub(r"\s+|,|，|、|。", "", s)
    s = re.sub(r"(\d+)\s*丁目", r"\1-", s)
    s = re.sub(r"(\d+)\s*番地(?:の)?", r"\1-", s)
    s = re.sub(r"(\d+)\s*番", r"\1-", s)
    s = re.sub(r"(\d+)\s*号", r"\1", s)
    s = re.sub(r"-+", "-", s).rstrip("-")
    return s

def fetch_zip(filename=None):
    if filename:
        raw = Path(filename).read_bytes()
    else:
        req = urllib.request.Request(OFFICIAL_URL, headers={"User-Agent": "Mozilla/5.0 (public data study)"})
        with urllib.request.urlopen(req, timeout=90) as resp:
            if resp.status != 200:
                raise RuntimeError(f"Official HTTP status {resp.status}")
            raw = resp.read()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != OFFICIAL_ZIP_SHA256:
        raise ValueError(f"Official 2026-06-01 ZIP digest changed: {digest}, expected {OFFICIAL_ZIP_SHA256}; manual review required")
    with zipfile.ZipFile(io.BytesIO(raw)) as arc:
        names = [n for n in arc.namelist() if n.endswith(".csv")]
        if len(names) != 1:
            raise ValueError(f"Expected exactly one hospital CSV: {names}")
        with arc.open(names[0]) as stream:
            df = pd.read_csv(stream, dtype=str, encoding="utf-8-sig", keep_default_na=False)
    if len(df.columns) != 65 or any(c not in df.columns for c in COLS_REQUIRED):
        raise ValueError(f"Official format changed; headers={list(df.columns)}")
    return df, digest

def build(legacy, official, digest):
    if len(legacy) != 8019 or legacy.facility_uid.duplicated().any():
        raise ValueError("Legacy baseline integrity failed")
    if not (6000 <= len(official) <= 10000):
        raise ValueError(f"Unexpected official record count {len(official)}")
    if official["ID"].eq("").any() or official["ID"].duplicated().any():
        raise ValueError("Official Navi IDs are missing or duplicated")
    official = official.copy().reset_index(drop=True)
    official["_p"] = official["都道府県コード"].map(PREF_CODE)
    if official["_p"].isna().any():
        raise ValueError("Invalid prefecture code")
    official["_n"] = official["正式名称"].map(name_key)
    official["_a"] = official["所在地"].map(address_key)
    legacy = legacy.copy().reset_index(drop=True)
    legacy["_p"] = legacy["prefecture"].map(pref)
    legacy["_n"] = legacy["facility_name"].map(name_key)
    legacy["_a"] = legacy["address"].map(address_key)
    if legacy["_p"].isna().any() or legacy["_p"].eq("").any():
        raise ValueError("Legacy prefecture missing")
    groups_exact, groups_name, groups_addr, per_pref = defaultdict(list), defaultdict(list), defaultdict(list), defaultdict(list)
    for i, o in official.iterrows():
        p, n, a = o["_p"], o["_n"], o["_a"]
        groups_exact[(p, n, a)].append(i)
        groups_name[(p, n)].append(i)
        groups_addr[(p, a)].append(i)
        per_pref[p].append(i)
    legacy_keys = Counter(zip(legacy["_p"], legacy["_n"], legacy["_a"]))
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    output = []
    confirmed_official_used = Counter()
    for _, old in legacy.iterrows():
        p, n, a = old["_p"], old["_n"], old["_a"]
        key = p, n, a
        exact = groups_exact.get(key, [])
        status, method, reason, cand = "未一致", "none", "照合候補なし", None
        if len(exact) == 1 and legacy_keys[key] == 1 and n and a:
            status, method, reason, cand = "確定一致", "県・正式名称・所在地の正規化完全一致（双方一意）", "機械照合。法人・保険医療機関コードの照合ではない", exact[0]
            confirmed_official_used[str(official.at[cand, "ID"])] += 1
        elif len(exact) > 1 or legacy_keys[key] > 1:
            status, method, reason = "要確認", "候補重複", f"候補{len(exact)}件 / 旧台帳同一キー{legacy_keys[key]}件"
            cand = exact[0] if len(exact) == 1 else None
        else:
            nc = groups_name.get((p, n), [])
            ac = groups_addr.get((p, a), [])
            if len(nc) == 1 and n:
                cand, status, method, reason = nc[0], "要確認", "県・名称完全一致", "所在地差異。移転・改称・原票旧版の可能性"
            elif len(ac) == 1 and a:
                cand, status, method, reason = ac[0], "要確認", "県・住所完全一致", "名称差異。改称・同所在地の別施設の可能性"
            elif len(nc) > 1 or len(ac) > 1:
                status, method, reason = "要確認", "複数候補", f"名称候補{len(nc)}件/住所候補{len(ac)}件"
            else:
                candidates = per_pref.get(p, [])
                if n and candidates:
                    choices = [official.at[j, "_n"] for j in candidates]
                    possible = process.extract(n, choices, scorer=fuzz.ratio, limit=4)
                    pool = []
                    for _, score, local_i in possible:
                        j = candidates[local_i]
                        addr_score = fuzz.ratio(a, official.at[j, "_a"])
                        if score >= 87 and addr_score >= 70:
                            pool.append((score * .6 + addr_score * .4, j))
                    pool.sort(reverse=True)
                    if pool:
                        cand, status, method, reason = pool[0][1], "要確認", "県内名称・住所類似", "類似候補。人による原典確認が必要"
        o = official.iloc[cand] if cand is not None else None
        is_ok = status == "確定一致"
        record = {
            "facility_uid": old["facility_uid"], "legacy_prefecture": old["prefecture"],
            "legacy_name": old["facility_name"], "legacy_address": old["address"],
            "match_status": status, "match_method": method,
            "navi_facility_id_confirmed": value(o["ID"]) if is_ok else "",
            "navi_facility_id_candidate": value(o["ID"]) if o is not None and not is_ok else "",
            "navi_name_candidate": value(o["正式名称"]) if o is not None else "",
            "navi_address_candidate": value(o["所在地"]) if o is not None else "",
            "navi_prefecture_code_candidate": value(o["都道府県コード"]) if o is not None else "",
            "navi_city_code_candidate": value(o["市区町村コード"]) if o is not None else "",
            "navi_latitude_candidate": value(o["所在地座標（緯度）"]) if o is not None else "",
            "navi_longitude_candidate": value(o["所在地座標（経度）"]) if o is not None else "",
            "navi_beds_candidate": value(o["合計病床数"]) if o is not None else "",
            "name_similarity": f"{fuzz.ratio(n, o['_n']):.1f}" if o is not None else "",
            "address_similarity": f"{fuzz.ratio(a, o['_a']):.1f}" if o is not None else "",
            "review_reason": reason, "source_data_as_of": AS_OF, "source_url": OFFICIAL_PAGE,
            "source_zip_sha256": digest, "checked_at_utc": generated_at,
        }
        output.append(record)
    if any(n > 1 for n in confirmed_official_used.values()):
        raise ValueError("A confirmed Navi ID matched multiple legacy rows")
    result = pd.DataFrame(output, columns=OUT_COLS).fillna("")
    counts = result.match_status.value_counts().to_dict()
    if set(counts) - {"確定一致", "要確認", "未一致"} or len(result) != len(legacy):
        raise ValueError("Invalid status labels or row counts")
    if counts.get("確定一致", 0) < 10:
        raise ValueError("Too few exact matches; review normalization and input sources")
    by_pref = []
    for p, grp in result.groupby("legacy_prefecture", sort=True):
        cs = grp.match_status.value_counts().to_dict()
        by_pref.append({"prefecture":p,"legacy_count":len(grp),"confirmed":cs.get("確定一致",0),
                        "review":cs.get("要確認",0),"unmatched":cs.get("未一致",0)})
    summary = {
        "stage":"1-identity-match","legacy_hospitals":len(legacy),"official_navi_hospitals":len(official),
        "match_counts":{"confirmed":counts.get("確定一致",0),"review":counts.get("要確認",0),"unmatched":counts.get("未一致",0)},
        "confirmed_rate_pct":round(100*counts.get("確定一致",0)/len(legacy),2),
        "official_source_url":OFFICIAL_URL,"official_listing_url":OFFICIAL_PAGE,
        "official_as_of":AS_OF,"official_zip_sha256":digest,"executed_at_utc":generated_at,
        "matching_rule":"Exact unique normalized prefecture, hospital formal name and full address. No fuzzy match is auto-confirmed.",
        "identity_caveat":"Navi ID is NOT the official insurance medical institution code or corporate number.",
        "official_columns_verified":COLS_REQUIRED,
        "unavailable_in_official_facility_csv":["開設者","法人番号","保険医療機関コード"],
        "by_prefecture":by_pref,
    }
    return result, summary

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--official-zip", help="Optional local official ZIP for reproducible offline testing")
    parser.add_argument("--output-dir", type=Path, default=DATA)
    args=parser.parse_args()
    legacy=pd.read_csv(LEGACY, dtype=str, encoding="utf-8-sig", keep_default_na=False)
    official, digest=fetch_zip(args.official_zip)
    result, summary=build(legacy, official, digest)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    result.to_csv(args.output_dir/"identity-navi-20260601.csv", index=False, encoding="utf-8-sig")
    result[result.match_status=="要確認"].to_csv(args.output_dir/"identity-review-20260601.csv",index=False,encoding="utf-8-sig")
    result[result.match_status=="確定一致"][["facility_uid","navi_facility_id_confirmed","source_data_as_of","source_url","source_zip_sha256"]].to_csv(
        args.output_dir/"identity-crosswalk-verified-navi-20260601.csv",index=False,encoding="utf-8-sig")
    (args.output_dir/"identity-summary-20260601.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:summary[k] for k in ["legacy_hospitals","official_navi_hospitals","match_counts","confirmed_rate_pct","official_zip_sha256"]},ensure_ascii=False))
    for row in result[result.match_status=="確定一致"].head(3).itertuples():
        print("VERIFIED_EXAMPLE",row.legacy_prefecture,row.legacy_name,row.navi_facility_id_confirmed)
    if summary["official_navi_hospitals"] < summary["match_counts"]["confirmed"]:
        raise RuntimeError("Impossible matching counts")
if __name__=="__main__":
    main()
