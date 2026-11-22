#!/usr/bin/env python3
"""Rev.12: reproduce the 3,098 safe-link legacy bridge and 4,921-item manual queue.
Do not modify original 8,019 hospital rows or promote review candidates.
"""
from __future__ import annotations
import argparse, json
from collections import Counter
from pathlib import Path
import pandas as pd
from match_navi_20260601 import DATA, fetch_zip, OFFICIAL_ZIP_SHA256, AS_OF
from build_official_websites import normalize_url

BRIDGE = "legacy-official-site-links-20260601.csv"
QUEUE = "remaining-website-review-20260601.csv"
AUDIT = "remaining-website-review-audit-20260601.json"
BRIDGE_COLS = ["facility_uid","source_row_no","prefecture","facility_name","address","website_url","navi_facility_id_confirmed","source_data_as_of"]
QUEUE_COLS = ["facility_uid","source_row_no","prefecture","facility_name","address",
              "identity_match_status","match_method","website_review_bucket","review_priority",
              "candidate_navi_id","candidate_official_homepage","required_confirmation",
              "review_status","evidence_source_as_of"]
REASON = {
 "identity_caution_or_conflict": "ID競合・名称差あり（施設同一性確認）",
 "shared_url_manual_review": "複数病院で同一URL（個別ページ確認）",
 "empty": "医療情報ネットにURL未記載",
 "invalid_scheme": "URL形式不備（http・https候補の安全確認）",
 "invalid_host": "ホスト形式不備",
 "invalid_characters": "URLに不正文字",
 "invalid_url": "URL解析不能",
 "third_party_or_local": "第三者・ローカルサイト",
 "nonpublic_ip": "非公開IPアドレス",
 "nonstandard_port": "非標準ポート"
}
PRIO = {
 "ID競合・名称差あり（施設同一性確認）": 1,
 "複数病院で同一URL（個別ページ確認）": 2,
 "URL形式不備（http・https候補の安全確認）": 3,
 "ホスト形式不備": 3, "URLに不正文字": 3, "URL解析不能": 3,
 "第三者・ローカルサイト": 3, "非公開IPアドレス": 3, "非標準ポート": 3,
 "医療情報ネットにURL未記載": 4,
 "名称一致・住所差あり（移転・同一施設確認）": 5,
 "住所一致・名称差あり（別施設リスク確認）": 6,
 "名称住所の類似候補（原典照合）": 7,
 "候補複数（原典照合）": 8,
 "公式スナップショット未一致（閉院とは限らない）": 9
}


def read(name):
    return pd.read_csv(DATA / name, dtype=str, keep_default_na=False, encoding="utf-8-sig")


def build():
    master, matched, safe = (read(x) for x in (
        "legacy-hospitals-20261122.csv","identity-navi-20260601.csv",
        "official-websites-navi-20260601.csv"))
    official, sha = fetch_zip()
    if sha != OFFICIAL_ZIP_SHA256 or len(master) != len(matched) != 8019:
        raise ValueError("Official source or legacy baseline changed")
    if len(master)!=8019 or len(safe)!=3098 or not master.facility_uid.is_unique:
        raise ValueError("Original counts changed")
    if master.facility_uid.tolist()!=matched.facility_uid.tolist():
        raise ValueError("Facility UID order mismatch")
    if not safe.facility_uid.is_unique:
        raise ValueError("Published links are not unique by hospital")
    verified = matched.set_index("facility_uid",verify_integrity=True)
    if any(verified.at[uid,"match_status"]!="確定一致" for uid in safe.facility_uid):
        raise ValueError("A review or unmatched URL was published")
    published = set(safe.facility_uid)
    bridge = master.loc[master.facility_uid.isin(published),[
        "facility_uid","source_row_no","prefecture","facility_name","address"
    ]].merge(safe[["facility_uid","website_url","navi_facility_id_confirmed"]],
             on="facility_uid",validate="one_to_one",sort=False)
    bridge["source_data_as_of"] = AS_OF
    bridge = bridge[BRIDGE_COLS].sort_values("source_row_no",key=lambda x:x.astype(int)).reset_index(drop=True)
    if len(bridge)!=3098 or not bridge.source_row_no.is_unique:
        raise ValueError("The 3,098 links did not map to distinct source rows")
    homepage = official.set_index("ID",verify_integrity=True)["案内用ホームページアドレス"].to_dict()
    caution = read("identity-confirmed-caution-20260601.csv")
    conflict = read("identity-conflict-review-20260601.csv")
    held_uid = set(caution.facility_uid)
    held_id = set(conflict.navi_facility_id_candidate)-{""}
    # Reconstruct the original conservative link filter to categorize withheld 355.
    eligible = matched[(matched.match_status=="確定一致")
                      & ~matched.facility_uid.isin(held_uid)
                      & ~matched.navi_facility_id_confirmed.isin(held_id)].copy()
    valid_url = {row.facility_uid: normalize_url(homepage.get(row.navi_facility_id_confirmed,""))[0]
                 for row in eligible.itertuples(index=False)}
    url_freq = Counter(u.rstrip("/").casefold() for u in valid_url.values() if u)
    methods = {
        "県・名称完全一致":"名称一致・住所差あり（移転・同一施設確認）",
        "県・住所完全一致":"住所一致・名称差あり（別施設リスク確認）",
        "県内名称・住所類似":"名称住所の類似候補（原典照合）",
        "複数候補":"候補複数（原典照合）"
    }
    queued = []
    for old, row in zip(master.itertuples(index=False),matched.itertuples(index=False)):
        if old.facility_uid in published:continue
        candidate_id = (row.navi_facility_id_confirmed or row.navi_facility_id_candidate)
        source_homepage = homepage.get(candidate_id,"")
        link, urlerr = normalize_url(source_homepage)
        if row.match_status=="確定一致":
            if old.facility_uid in held_uid or candidate_id in held_id:
                label = REASON["identity_caution_or_conflict"]
            elif not link:label = REASON.get(urlerr, "URL形式・出典再確認")
            elif url_freq.get(link.rstrip("/").casefold(),0)>1:
                label = REASON["shared_url_manual_review"]
            else:raise ValueError("Unpublished confirmed hospital with safe unique URL: "+old.facility_uid)
            action = "病院公式ページ・医療情報ネットの名称/住所/ID/ドメインを人手で突合する。"
        elif row.match_status=="要確認":
            label = methods.get(row.match_method,"候補複数（原典照合）")
            action = "病院の現行名称・住所・開設者・施設IDを2つ以上の独立原典で照合する。候補URLは未承認。"
        else:
            label = "公式スナップショット未一致（閉院とは限らない）"
            action = "自治体・病院・公的病院名簿で開設/改称/移転/統合を確認し、閉院を自動判定しない。"
        queued.append({
            "facility_uid":old.facility_uid,
            "source_row_no":old.source_row_no,
            "prefecture":old.prefecture,
            "facility_name":old.facility_name,
            "address":old.address,
            "identity_match_status":row.match_status,
            "match_method":row.match_method,
            "website_review_bucket":label,
            "review_priority":str(PRIO.get(label,9)),
            "candidate_navi_id":candidate_id,
            "candidate_official_homepage":link,
            "required_confirmation":action,
            "review_status":"未検証・自動リンク禁止",
            "evidence_source_as_of":AS_OF
        })
    review = pd.DataFrame(queued, columns=QUEUE_COLS)
    review = review.sort_values(["review_priority","prefecture","source_row_no"],
                  key=lambda col:col.astype(int) if col.name in ("review_priority","source_row_no") else col).reset_index(drop=True)
    if len(review)!=4921 or len(set(review.facility_uid)&published):
        raise ValueError("The remaining 4,921 rows are not disjoint from published 3,098")
    if len(review.facility_uid.unique())!=4921:
        raise ValueError("Review queue duplicate facility")
    if len(review)+len(bridge)!=8019:
        raise ValueError("Original 8,019 hospitals not partitioned completely")
    by_status = review.identity_match_status.value_counts().to_dict()
    if by_status!={"要確認":3435,"未一致":1131,"確定一致":355}:
        raise ValueError("Remaining match statuses changed: "+str(by_status))
    valid_pending = review[(review.identity_match_status=="要確認") &
                           review.candidate_official_homepage.ne("")]
    # This is an unapproved SOURCE candidate, never a confirmed link.
    report={
      "stage":"rev12-remaining-hospital-web-review-v1",
      "official_source_as_of":AS_OF,
      "official_source_sha256":OFFICIAL_ZIP_SHA256,
      "legacy_original_rows":8019,
      "linked_exact_match_rows":3098,
      "unlinked_review_queue_rows":4921,
      "remaining_match_status":by_status,
      "pending_with_syntactically_valid_source_url":len(valid_pending),
      "review_by_bucket":review.website_review_bucket.value_counts().to_dict(),
      "source_row_no_unique_bridge":True,
      "review_candidate_urls_not_clickable":True,
      "not_assumed_closed":True,
      "verified_official_website_live_or_ownership":False,
      "note":"Public reported homepage fields are candidates only until hospital identity and current domain ownership are reviewed."
    }
    return bridge,review,report


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--check",action="store_true")
    args=ap.parse_args()
    bridge,review,report=build()
    if args.check:
        assert bridge.equals(read(BRIDGE)), "Legacy-site website bridge differs"
        assert review.equals(read(QUEUE)), "Review queue differs"
        assert report==json.loads((DATA/AUDIT).read_text(encoding="utf-8"))
    else:
        bridge.to_csv(DATA/BRIDGE,index=False,encoding="utf-8-sig")
        review.to_csv(DATA/QUEUE,index=False,encoding="utf-8-sig")
        (DATA/AUDIT).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False))


if __name__=="__main__":main()
