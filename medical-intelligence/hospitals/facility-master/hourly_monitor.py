#!/usr/bin/env python3
"""Hourly medical market site and facility master smoke check."""
import argparse,csv,json,sys,time,urllib.request
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BASE="https://sinobu13-bpei.github.io/"
FILES=["medical-intelligence/","medical-intelligence/hospitals/",
"medical-intelligence/hospitals/facility-master/",
"medical-intelligence/hospitals/facility-master/data/legacy-hospitals-20261122.csv",
"medical-intelligence/hospitals/facility-master/data/quality-baseline.json",
"medical-intelligence/hospitals/facility-master/data/identity-summary-20260601.json",
"medical-intelligence/hospitals/facility-master/data/identity-risk-audit-20260601.json",
"medical-intelligence/hospitals/facility-master/data/identity-conflict-review-20260601.csv",
"medical-intelligence/hospitals/facility-master/data/identity-unmatched-triage-20260601.csv"]
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--public",action="store_true")
    p.add_argument("--report",default="reports/medical-intelligence-hourly-health.json")
    a=p.parse_args()
    checks=[]
    def add(name,ok,details=""):
        checks.append({"name":name,"passed":bool(ok),"details":str(details)})
    source=(ROOT/"medical-intelligence/hospitals/index.html").read_text(encoding="utf-8")
    n=source.count("<tr data-text=")
    add("source_8019_rows",n==8019,n)
    f=ROOT/"medical-intelligence/hospitals/facility-master/data/legacy-hospitals-20261122.csv"
    with f.open(encoding="utf-8-sig",newline="") as h: rows=list(csv.DictReader(h))
    add("master_8019_records",len(rows)==8019,len(rows))
    add("master_47_prefectures",len(set(r["prefecture"] for r in rows))==47)
    add("master_uid_unique",len(set(r["facility_uid"] for r in rows))==len(rows))
    add("official_codes_remain_unmatched",all(not r["official_medical_institution_code"] and not r["official_corporate_number"] for r in rows))
    if a.public:
        for path in FILES:
            ok=False;detail=""
            for attempt in range(3):
                try:
                    req=urllib.request.Request(BASE+path,headers={"User-Agent":"MedicalMKT-HourlyQA/1.0"})
                    with urllib.request.urlopen(req,timeout=25) as res:
                        content=res.read(8192)
                        detail="HTTP "+str(res.status)+"; sample bytes "+str(len(content))
                        ok=res.status==200 and len(content)>100
                        if path.endswith("/") and not (b"<html" in content.lower() or b"<!doctype" in content.lower()):ok=False
                    if ok:break
                except Exception as e:detail=type(e).__name__+": "+str(e)[:140]
                if attempt<2:time.sleep(4)
            add("public_"+path,ok,detail)
    report={"checked_at_utc":datetime.now(timezone.utc).isoformat(),"public_checked":a.public,"checks":checks,"failures":[x for x in checks if not x["passed"]]}
    target=Path(a.report);target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"checks":len(checks),"failures":len(report["failures"])},ensure_ascii=False))
    if report["failures"]:sys.exit(1)
if __name__=="__main__":main()
