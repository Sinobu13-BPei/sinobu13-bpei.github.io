#!/usr/bin/env python3
"""Read-only quality audit for Rev.10 hospital identity matches.
This validates a generated crosswalk without promoting any candidate to verified.
"""
from __future__ import annotations
import argparse
from collections import Counter
from datetime import datetime, timezone
from difflib import SequenceMatcher
import hashlib
import json
from pathlib import Path
import re
import pandas as pd

HERE=Path(__file__).resolve().parent
DATA=HERE/"data"
AS_OF="2026-06-01"
OFFICIAL_SHA256="b416472ec52a151455e1c91438e0dec5b471e19eafe70e3e2ee1bb22544efe87"
VALID={"確定一致","要確認","未一致"}
REQUIRED={"facility_uid","legacy_prefecture","legacy_name","legacy_address","match_status",
"match_method","navi_facility_id_confirmed","navi_facility_id_candidate",
"navi_name_candidate","navi_address_candidate","navi_prefecture_code_candidate",
"navi_latitude_candidate","navi_longitude_candidate","review_reason",
"source_data_as_of","source_url","source_zip_sha256"}

def read_csv(path):
    if not path.is_file():raise FileNotFoundError(path)
    return pd.read_csv(path,dtype=str,keep_default_na=False,encoding="utf-8-sig")

def require(ok,message):
    if not bool(ok):raise ValueError(message)

def simil(a,b):
    return round(100*SequenceMatcher(None,str(a),str(b)).ratio(),1)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out-dir",type=Path,default=DATA)
    ap.add_argument("--check-only",action="store_true")
    a=ap.parse_args()
    legacy=read_csv(DATA/"legacy-hospitals-20261122.csv")
    matched=read_csv(DATA/"identity-navi-20260601.csv")
    review=read_csv(DATA/"identity-review-20260601.csv")
    verified=read_csv(DATA/"identity-crosswalk-verified-navi-20260601.csv")
    summary=json.loads((DATA/"identity-summary-20260601.json").read_text(encoding="utf-8"))
    require(len(legacy)==8019 and len(matched)==8019,"Expected 8,019 rows in both source and match table")
    require(legacy.facility_uid.is_unique and matched.facility_uid.is_unique,"Facility UID must be unique")
    require(matched.facility_uid.tolist()==legacy.facility_uid.tolist(),"Legacy row order/UID not preserved")
    require(REQUIRED.issubset(matched.columns), "Expected source and identity columns missing")
    require(matched.match_status.isin(VALID).all(), "Unknown match status")
    require(matched.legacy_name.tolist()==legacy.facility_name.tolist(), "Source names were overwritten")
    require(matched.legacy_address.tolist()==legacy.address.tolist(), "Source addresses were overwritten")
    require(matched.legacy_prefecture.tolist()==legacy.prefecture.tolist(), "Source prefectures were overwritten")
    require((matched.source_data_as_of==AS_OF).all(),"Source as-of dates differ")
    require((matched.source_zip_sha256==OFFICIAL_SHA256).all(),"Official source SHA changed")
    require(matched.source_url.eq(summary["official_listing_url"]).all(),"Source URL mismatch")
    confirmed=matched[matched.match_status=="確定一致"].copy()
    pending=matched[matched.match_status=="要確認"].copy()
    unmatched=matched[matched.match_status=="未一致"].copy()
    # Navi IDs are opaque source identifiers, including variable-length numeric
    # strings and alphanumeric strings. Never parse them as integers or pad them.
    lengths=confirmed.navi_facility_id_confirmed.str.len().value_counts().to_dict()
    mixed=confirmed.navi_facility_id_confirmed.str.contains(r"[A-Za-z]",regex=True)
    format_ok=confirmed.navi_facility_id_confirmed.str.fullmatch(r"[A-Za-z0-9]{5,13}")
    print("AUDIT_OFFICIAL_ID_LENGTHS",lengths)
    print("AUDIT_ALPHANUMERIC_IDS",int(mixed.sum()))
    require(format_ok.all(),"Unexpected characters or lengths in frozen official Navi IDs")
    require(confirmed.navi_facility_id_confirmed.is_unique,"Confirmed Navi ID reused")
    require(confirmed.navi_facility_id_candidate.eq("").all(),"Confirmed rows must not also have candidate ID")
    require(confirmed.navi_name_candidate.ne("").all() and confirmed.navi_address_candidate.ne("").all(),"Confirmed source evidence missing")
    require(confirmed.match_method.str.contains("完全一致",regex=False).all(),"A non-exact method was confirmed")
    require(matched[matched.match_status!="確定一致"].navi_facility_id_confirmed.eq("").all(),"Unconfirmed official ID was populated")
    require(matched.navi_facility_id_candidate[matched.navi_facility_id_candidate.ne("")].str.fullmatch(r"[A-Za-z0-9]{5,13}").all(),"Candidate Navi IDs must preserve official alphanumeric 5–13 character format")
    require(len(review)==len(pending),"Review list size differs")
    require(review.facility_uid.tolist()==pending.facility_uid.tolist(),"Review CSV differs from main match table")
    require(len(verified)==len(confirmed),"Confirmed crosswalk size differs")
    require(verified.facility_uid.tolist()==confirmed.facility_uid.tolist(),"Confirmed crosswalk UID differs")
    require(verified.navi_facility_id_confirmed.tolist()==confirmed.navi_facility_id_confirmed.tolist(),"Confirmed IDs differ")
    counts={"confirmed":len(confirmed),"review":len(pending),"unmatched":len(unmatched)}
    require(counts==summary["match_counts"],"Published summary counts differ")
    require(sum(counts.values())==8019,"Status total differs")
    require(matched.legacy_prefecture.nunique()==47,"Missing prefecture")
    prior_by_pref=summary["by_prefecture"]
    require(len(prior_by_pref)==47,"Original summary missing prefectures")
    for p in prior_by_pref:
        frame=matched[matched.legacy_prefecture==p["prefecture"]]
        require(len(frame)==p["legacy_count"],"Prefecture count differs: "+p["prefecture"])
        for label,col in [("確定一致","confirmed"),("要確認","review"),("未一致","unmatched")]:
            require(int(frame.match_status.eq(label).sum())==p[col],"Prefecture status differs: "+p["prefecture"])
    cand=pending[pending.navi_facility_id_candidate.ne("")].copy()
    id_usage=Counter(cand.navi_facility_id_candidate)
    confirmed_set=set(confirmed.navi_facility_id_confirmed)
    cand["candidate_is_already_confirmed"]=cand.navi_facility_id_candidate.map(lambda i: i in confirmed_set)
    cand["candidate_review_collision"]=cand.navi_facility_id_candidate.map(lambda i: id_usage[i]>1)
    candidate_confirmed_conflicts=int(cand.candidate_is_already_confirmed.sum())
    candidate_multi_ref=int(cand.candidate_review_collision.sum())
    cols=["facility_uid","legacy_prefecture","legacy_name","legacy_address","match_status",
          "match_method","navi_facility_id_candidate","navi_name_candidate","navi_address_candidate",
          "name_similarity","address_similarity","review_reason"]
    review_priority={
        "県・名称完全一致":1,
        "県・住所完全一致":2,
        "県内名称・住所類似":3,
        "複数候補":4,
        "候補重複":5
    }
    triage=pending[cols].copy()
    triage["review_priority"]=triage.match_method.map(review_priority).fillna(9).astype(int)
    triage["candidate_already_assigned_to_confirmed"]=triage.navi_facility_id_candidate.map(lambda x:"要確認" if x and x in confirmed_set else "")
    triage["candidate_shared_by_other_review"]=triage.navi_facility_id_candidate.map(lambda x:"要確認" if x and id_usage[x]>1 else "")
    triage["human_review_completed"]="未実施"
    triage["human_verified_official_source_url"]=""
    triage=triage.sort_values(["review_priority","legacy_prefecture","legacy_name","facility_uid"],kind="stable")
    # Separate explicit ID collisions from the general review queue.
    # They are not evidence of wrongful assignment, only possible ambiguity.
    conflict_mask=(triage["candidate_already_assigned_to_confirmed"].ne("") |
                   triage["candidate_shared_by_other_review"].ne(""))
    conflict_rows=triage.loc[conflict_mask].copy()
    conflict_rows["needs_human_identity_check"]="要確認・自動確定禁止"
    unmatched_rows=unmatched.copy()
    unmatched_rows["manual_review_status"]="未実施"
    unmatched_rows["interpretation_note"]="未一致は候補条件を満たさなかったことを示す。閉院・不存在と同義ではない"
    require(len(conflict_rows)<=len(triage),"Conflict count is greater than total review")
    require(len(unmatched_rows)==counts["unmatched"],"Unmatched extract is incomplete")
    require(conflict_rows.facility_uid.is_unique and unmatched_rows.facility_uid.is_unique,
            "Duplicate facility UID in supplemental review queues")
    require(not set(conflict_rows.facility_uid)&set(unmatched_rows.facility_uid),
            "Review and unmatched queues must be disjoint")
    raw_name=confirmed.apply(lambda x:simil(x.legacy_name,x.navi_name_candidate),axis=1)
    raw_address=confirmed.apply(lambda x:simil(x.legacy_address,x.navi_address_candidate),axis=1)
    suspicious=confirmed[raw_name<70].copy()
    suspicious["raw_name_similarity_pct"]=[simil(x.legacy_name,x.navi_name_candidate) for x in suspicious.itertuples()]
    suspicious["raw_address_similarity_pct"]=[simil(x.legacy_address,x.navi_address_candidate) for x in suspicious.itertuples()]
    flags=suspicious[["facility_uid","legacy_prefecture","legacy_name","legacy_address",
                     "navi_facility_id_confirmed","navi_name_candidate","navi_address_candidate",
                     "raw_name_similarity_pct","raw_address_similarity_pct"]].copy()
    flags["audit_flag"]="名称の元表記に大きな差があるため任意の目視確認を推奨。既存判定は自動変更しない"
    report={
        "audit_version":"stage1b-risk-audit-v2",
        "checked_at_utc":datetime.now(timezone.utc).isoformat(),
        "original_legacy_records":len(legacy),
        "official_navi_records":summary["official_navi_hospitals"],
        "match_counts":counts,
        "source_as_of":AS_OF,
        "source_zip_sha256":OFFICIAL_SHA256,
        "source_reference":summary["official_listing_url"],
        "hard_checks_passed":True,
        "confirmed_duplicate_navi_ids":0,
        "confirmed_id_length_distribution":{str(k):int(v) for k,v in lengths.items()},
        "confirmed_ids_containing_letters":int(mixed.sum()),
        "confirmed_with_no_evidence":0,
        "review_method_breakdown":{str(k):int(v) for k,v in pending.match_method.value_counts().items()},
        "candidate_id_present":len(cand),
        "candidate_also_used_by_confirmed_rows":candidate_confirmed_conflicts,
        "candidate_shared_by_multiple_review_rows":candidate_multi_ref,
        "confirmed_raw_name_similarity_below_70pct":int((raw_name<70).sum()),
        "confirmed_raw_address_similarity_below_65pct":int((raw_address<65).sum()),
        "raw_address_similarity_is_diagnostic_only":True,
        "confirmed_flags_requiring_human_review":len(flags),
        "triage_rows":len(triage),
        "conflict_review_rows":len(conflict_rows),
        "conflict_queue_is_subset_of_review":True,
        "unmatched_triage_rows":len(unmatched_rows),
        "unmatched_does_not_mean_closed":True,
        "preserved_records":len(legacy),
        "note":"Candidate conflicts and low raw-name similarities require manual checks; raw-address similarity is diagnostic only because formatting differs by prefecture. No matching status is auto-changed."
    }
    # Read-only hourly QA must detect stale or truncated published CSVs.
    # Derived exports are immutable snapshots; human decisions belong in a
    # separate ledger rather than editing auto-generated review queues.
    if a.check_only:
        generated={
            "identity-review-triage-20260601.csv":triage,
            "identity-confirmed-caution-20260601.csv":flags,
            "identity-conflict-review-20260601.csv":conflict_rows,
            "identity-unmatched-triage-20260601.csv":unmatched_rows,
        }
        for name, expected in generated.items():
            current=read_csv(DATA/name)
            clean=expected.fillna("").astype(str).reset_index(drop=True)
            require(list(current.columns)==list(clean.columns),"Saved CSV schema differs: "+name)
            require(len(current)==len(clean),"Saved CSV row count differs: "+name)
            require(current.equals(clean),"Saved CSV content differs from source-derived audit: "+name)
        saved=json.loads((DATA/"identity-risk-audit-20260601.json").read_text(encoding="utf-8"))
        for key in ("audit_version","source_zip_sha256","match_counts",
                    "conflict_review_rows","unmatched_triage_rows",
                    "candidate_also_used_by_confirmed_rows",
                    "candidate_shared_by_multiple_review_rows"):
            require(saved.get(key)==report.get(key),"Saved audit JSON differs: "+key)
    a.out_dir.mkdir(parents=True,exist_ok=True)
    (a.out_dir/"identity-risk-audit-20260601.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if not a.check_only:
        triage.to_csv(a.out_dir/"identity-review-triage-20260601.csv",index=False,encoding="utf-8-sig")
        flags.to_csv(a.out_dir/"identity-confirmed-caution-20260601.csv",index=False,encoding="utf-8-sig")
        conflict_rows.to_csv(a.out_dir/"identity-conflict-review-20260601.csv",index=False,encoding="utf-8-sig")
        unmatched_rows.to_csv(a.out_dir/"identity-unmatched-triage-20260601.csv",index=False,encoding="utf-8-sig")
    print(json.dumps({k:report[k] for k in ("match_counts","candidate_also_used_by_confirmed_rows","candidate_shared_by_multiple_review_rows","confirmed_flags_requiring_human_review","hard_checks_passed")},ensure_ascii=False))
if __name__=="__main__":
    main()
