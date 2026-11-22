#!/usr/bin/env python3
"""Rev.13: verify 13 separately evidenced hospital official URLs without Navi-ID promotion."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit
import pandas as pd

HERE=Path(__file__).resolve().parent
DATA=HERE/"data"
COLS=[
 "facility_uid","source_row_no","prefecture","facility_name_legacy",
 "address_legacy","verified_website_url","review_outcome","current_hospital_name",
 "reviewed_on","primary_evidence_url","secondary_evidence_url",
 "original_review_bucket","identity_decision","review_notes"
]
def read(file):
    return pd.read_csv(DATA/file,dtype=str,keep_default_na=False,encoding="utf-8-sig")
def site(url):
    try:
        u=urlsplit(url)
        return (u.scheme=="https" and u.hostname is not None and "." in u.hostname
                and not u.username and not u.password and not any(
                    c.isspace() or c in '<>"\\' for c in url))
    except ValueError:
        return False

def validate():
    original=read("legacy-hospitals-20261122.csv")
    identity=read("identity-navi-20260601.csv")
    pending=read("remaining-website-review-20260601.csv")
    navi=read("official-websites-navi-20260601.csv")
    reviewed=read("independently-reviewed-websites-20261122.csv")
    audit=json.loads((DATA/"independently-reviewed-websites-audit-20261122.json").read_text(encoding="utf-8"))
    assert len(original)==len(identity)==8019, "Source hospital or matched identity count changed"
    assert len(navi)==3098 and len(pending)==4921, "Historical website baselines changed"
    assert len(reviewed)==13 and list(reviewed.columns)==COLS, "Reviewed URL schema/count changed"
    assert original.facility_uid.is_unique and identity.facility_uid.is_unique
    assert len(set(reviewed.facility_uid))==13 and reviewed.source_row_no.is_unique
    assert not(set(reviewed.facility_uid)&set(navi.facility_uid)), "Baseline Navi URL overlap"
    assert set(reviewed.facility_uid).issubset(set(pending.facility_uid))
    assert reviewed.review_outcome.value_counts().to_dict()=={
        "verified_same_name":12,"verified_renamed":1}
    assert reviewed.reviewed_on.eq("2026-11-22").all()
    assert reviewed.verified_website_url.is_unique
    assert all(site(x) for x in reviewed.verified_website_url)
    assert all(site(x) for x in reviewed.primary_evidence_url)
    assert all(site(x) for x in reviewed.secondary_evidence_url)
    assert reviewed.identity_decision.str.contains("維持").all()
    old=original.set_index("facility_uid",verify_integrity=True)
    ident=identity.set_index("facility_uid",verify_integrity=True)
    review=pending.set_index("facility_uid",verify_integrity=True)
    for row in reviewed.itertuples(index=False):
        source=old.loc[row.facility_uid]
        found=review.loc[row.facility_uid]
        current=ident.loc[row.facility_uid]
        assert row.source_row_no==source.source_row_no==found.source_row_no
        assert (row.prefecture,row.facility_name_legacy,row.address_legacy)==(
            source.prefecture,source.facility_name,source.address)
        assert found.identity_match_status=="確定一致", "Identity classification promoted"
        assert current.match_status=="確定一致", "Navi match status changed"
        assert found.website_review_bucket==row.original_review_bucket
        assert found.review_status=="未検証・自動リンク禁止", "Original review snapshot was changed"
        assert row.review_notes, "Reason and identity restrictions are required"
    change=reviewed.loc[reviewed.review_outcome=="verified_renamed"].iloc[0]
    assert change.facility_uid=="LEG-46c4bd4afa203ebd", "Rename evidence assigned to wrong facility"
    assert change.current_hospital_name=="湘南リハビリテーション病院"
    assert change.facility_name_legacy=="医療法人　湘和会　湘南記念病院"
    assert "2026年4月1日" in change.review_notes
    assert audit["independently_reviewed_website_rows"]==13
    assert audit["verified_same_name"]==12 and audit["verified_renamed"]==1
    assert audit["original_review_buckets"]==reviewed.original_review_bucket.value_counts().to_dict()
    assert audit["pending_website_review_after_this_batch"]==4921-13
    assert audit["browser_direct_website_links_if_verified_layer_loaded"]==3098+13
    assert audit["baseline_navi_identity_confirmed"]==3453
    assert audit["baseline_navi_identity_pending"]==3435
    assert audit["baseline_navi_identity_unmatched"]==1131
    assert audit["navi_identity_conflicts_unmodified"] is True
    print(json.dumps({"result":"PASS","source_hospitals":8019,
        "navi_reported_links":3098,"independently_verified_sites":13,
        "rename_with_official_announcement":1,"source_review_queue":4921,
        "remaining_no_direct_site":4908,
        "navi_id_status_unchanged":True},ensure_ascii=False))

if __name__=="__main__":
    validate()
