#!/usr/bin/env python3
"""Rev.14 append-only validation for four official hospital website reviews."""
from __future__ import annotations
import json
from pathlib import Path
from urllib.parse import urlsplit
import pandas as pd
HERE=Path(__file__).resolve().parent
DATA=HERE/"data"
COLS=["facility_uid","source_row_no","prefecture","facility_name_legacy","address_legacy",
"verified_website_url","review_outcome","current_hospital_name","reviewed_on",
"primary_evidence_url","secondary_evidence_url","original_review_bucket",
"identity_decision","review_notes"]
def read(name):
    return pd.read_csv(DATA/name,dtype=str,keep_default_na=False,encoding="utf-8-sig")
def secure(url):
    try:
        u=urlsplit(url)
        return u.scheme=="https" and bool(u.hostname) and "." in u.hostname and not u.username and not u.password
    except ValueError:
        return False
def validate():
    master=read("legacy-hospitals-20261122.csv")
    identity=read("identity-navi-20260601.csv")
    pending=read("remaining-website-review-20260601.csv")
    prior=read("independently-reviewed-websites-20261122.csv")
    batch=read("independently-reviewed-websites-20261123.csv")
    audit=json.loads((DATA/"independently-reviewed-websites-audit-20261123.json").read_text(encoding="utf-8"))
    assert len(master)==len(identity)==8019
    assert len(pending)==4921 and len(prior)==13
    assert len(batch)==4 and list(batch.columns)==COLS
    assert batch.facility_uid.is_unique and batch.source_row_no.is_unique
    assert set(batch.facility_uid).isdisjoint(prior.facility_uid)
    assert set(batch.verified_website_url).isdisjoint(prior.verified_website_url)
    assert batch.review_outcome.eq("verified_same_name").all()
    assert batch.reviewed_on.eq("2026-11-23").all()
    assert batch.original_review_bucket.eq("医療情報ネットにURL未記載").all()
    assert batch.identity_decision.str.contains("維持").all()
    assert batch.review_notes.str.len().gt(15).all()
    assert batch.verified_website_url.map(secure).all()
    assert batch.primary_evidence_url.map(secure).all()
    assert batch.secondary_evidence_url.map(secure).all()
    m=master.set_index("facility_uid",verify_integrity=True)
    i=identity.set_index("facility_uid",verify_integrity=True)
    p=pending.set_index("facility_uid",verify_integrity=True)
    for r in batch.itertuples(index=False):
        src=m.loc[r.facility_uid]; ident=i.loc[r.facility_uid]; queue=p.loc[r.facility_uid]
        assert r.source_row_no==src.source_row_no==queue.source_row_no
        assert (r.prefecture,r.facility_name_legacy,r.address_legacy)==(src.prefecture,src.facility_name,src.address)
        assert ident.match_status==queue.identity_match_status=="確定一致"
        assert queue.website_review_bucket==r.original_review_bucket
        assert queue.review_status=="未検証・自動リンク禁止"
    names=set(batch.facility_name_legacy)
    assert names=={"医療法人　優仁会　滝川中央病院","医療法人社団　弘成会　明海病院","神崎病院","医療法人　松浦会　松浦病院"}
    assert audit["input_batch_rows"]==4 and audit["total_independent_reviews_after_batch"]==17
    assert audit["direct_website_links_if_verified_layer_loaded"]==3115
    assert audit["remaining_unlinked_review_rows"]==4904
    assert audit["remaining_of_priority_exact_identity_bucket"]==338
    assert audit["original_master_changed"] is False and audit["identity_match_status_changed"] is False
    print("REV14_OFFICIAL_WEBSITE_BATCH_PASS rows=4 total_reviewed=17 links=3115 priority_queue_left=338")
if __name__=="__main__": validate()
