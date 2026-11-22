#!/usr/bin/env python3
"""Add two external asset references to the 8,019-row legacy page, no data edits.

Verify Git's blob SHA of original content after stripping the exact insertion.
This makes any accidental mutation of a source row impossible to overlook.
"""
import argparse,hashlib,re
from pathlib import Path

TARGET=Path(__file__).resolve().parent.parent/"index.html"
ORIGINAL_BLOB_SHA="24aa96b01adea8e14b53e8c415fa1eb7e3aaab74"
CSS='<link rel="stylesheet" href="./assets/legacy-official-websites-rev12.css">'
JS='<script defer src="./assets/legacy-official-websites-rev12.js"></script>'

def git_blob_sha(data):
    return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()

def original_check(text):
    if text.count('<tr data-text=')!=8019:
        raise ValueError("Existing hospital row count changed")
    raw=text.encode("utf-8")
    actual=git_blob_sha(raw)
    if actual!=ORIGINAL_BLOB_SHA:
        raise ValueError("Original hospital HTML blob differs: "+actual)
    return True

def verify(text):
    if text.count(CSS)!=1 or text.count(JS)!=1:
        raise ValueError("Link bridge must be inserted exactly once")
    clean=text.replace(CSS,"",1).replace(JS,"",1)
    original_check(clean)
    if len(re.findall(r"</head>",text,re.I))!=1 or len(re.findall(r"</body>",text,re.I))!=1:
        raise ValueError("HTML document closing tags changed")
    return True

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply",action="store_true")
    parser.add_argument("--check",action="store_true")
    args=parser.parse_args()
    if not (args.apply or args.check):parser.error("Use --apply or --check")
    text=TARGET.read_text(encoding="utf-8")
    if args.apply and CSS not in text and JS not in text:
        original_check(text)
        if text.count("</head>")!=1 or text.count("</body>")!=1:
            raise ValueError("Document end markers changed")
        text=text.replace("</head>",CSS+"</head>",1)
        text=text.replace("</body>",JS+"</body>",1)
        verify(text)
        TARGET.write_text(text,encoding="utf-8")
    verify(text)
    print("LEGACY_WEBSITE_BRIDGE_QA_PASS original_blob_sha="+ORIGINAL_BLOB_SHA+" rows=8019 references=2")

if __name__=="__main__":main()
