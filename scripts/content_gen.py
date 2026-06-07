#!/usr/bin/env python3
"""
scripts/content_gen.py — denzuko/stream-assets social pipeline generator

Reads approved stubs from data/content-queue/*.yaml
Calls Anthropic API to generate per-platform post variants
Writes rows to the content-pipeline Google Sheet (Drafts tab)

Usage:
    python scripts/content_gen.py --all
    python scripts/content_gen.py --stub data/content-queue/INGEST-2026-06-07-001.yaml
    python scripts/content_gen.py --all --dry-run

Required env:
    ANTHROPIC_API_KEY
    GOOGLE_SERVICE_ACCOUNT_JSON  (path to SA credentials file)
    SHEET_ID                     (default: 1R0FR3zPW87wXb2yq-EitZny8r0jmLH3CZ-7vgUp0ej4)
"""

import json
import os
import sys
import time
import argparse
import datetime
import pathlib
import urllib.request
import urllib.parse

import yaml
import gspread
from google.oauth2.service_account import Credentials

# ── Config ────────────────────────────────────────────────────────────────────

QUEUE_DIR  = pathlib.Path("data/content-queue")
MODEL      = "claude-sonnet-4-20250514"
MAX_TOKENS = 2000
SHEET_ID   = os.environ.get("SHEET_ID", "1R0FR3zPW87wXb2yq-EitZny8r0jmLH3CZ-7vgUp0ej4")
SCOPES     = ["https://www.googleapis.com/auth/spreadsheets"]

APPROVED_HASHTAGS = {
    "#infosec", "#OT", "#ICS", "#SCADA", "#selfhosted",
    "#infrastructure", "#foss", "#devops", "#devsecops",
    "#privacy", "#FourthAmendment", "#supplychain", "#homelab",
}

SYSTEM_PROMPT = """You are the social media voice for Dwight Spencer (denzuko),
Principal of Da Planet Security, Technology Chair of Restore The Fourth,
25-year infosec practitioner, author of the forthcoming book "The Watchers You Fed."

The goal is NOT to announce content. It is to start a conversation that pulls
the right reader toward the site, the book, or a professional conversation.
Think: working a room of potential readers — personalised, direct, not broadcast.

AUDIENCE FISH TYPES — match tone to target:
- practitioner: OT/ICS engineers, DevSecOps, self-hosters, 2600/HPR/SDF crowd.
  Hook: technical claim they'll argue with or +1. Pull: site post for depth.
- compliance: procurement officers, CISOs, DIB contractors, DevOps leads.
  Hook: business or cost implication. Pull: DPS advisory or book.
- community: privacy advocates, civil liberties, RT4 adjacent, journalists.
  Hook: concrete local or policy angle. Pull: book pre-order or BMAC.

PULL TYPES:
- site: end with site URL (only if linking to a specific post)
- bmac: mention lab_access tier addendum — inside baseball for members
- book: reference "The Watchers You Fed" (KDP, pre-Labor Day 2026)
- advisory: signal for DPS fractional CISO engagement

PLATFORM RULES:
MASTODON (hard 500 char including hashtags):
- Direct practitioner-to-practitioner, original observation not news summary
- 3-4 hashtags from approved list only
- No rhetorical questions. No numbered lists. Max one em-dash.
- End with site URL only when linking to a specific post.

LINKEDIN (1000-1500 chars):
- Professional register, lead with business/technical implication not news
- Active voice. No "It's worth noting". No "In conclusion". No "This is why X matters".

REDDIT title: factual, specific, no editorializing
REDDIT body: 2-3 sentence hook + link

BMAC: inside baseball for lab_access tier members.
Connect to ongoing work: observability stack, pbx-quadlet, Watchers manuscript.

OUTPUT: Return ONLY valid JSON. No preamble, no markdown fences.
Schema:
{
  "mastodon": {"copy": "string", "char_count": int, "hashtags": ["string"], "verified_under_500": bool},
  "linkedin": {"copy": "string", "char_count": int},
  "reddit": [{"subreddit": "string", "title": "string", "body": "string"}],
  "bmac": {"copy": "string"},
  "image_query": "string"
}"""

# ── Sheet client ──────────────────────────────────────────────────────────────

def get_sheet_client():
    sa_path = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not sa_path:
        raise EnvironmentError("GOOGLE_SERVICE_ACCOUNT_JSON not set")
    creds = Credentials.from_service_account_file(sa_path, scopes=SCOPES)
    return gspread.authorize(creds)

def get_drafts_worksheet(client):
    sh = client.open_by_key(SHEET_ID)
    try:
        return sh.worksheet("Drafts")
    except gspread.WorksheetNotFound:
        ws = sh.add_worksheet(title="Drafts", rows=1000, cols=16)
        ws.append_row([
            "stub_id", "generated_at", "platform", "subreddit", "scheduled_at",
            "copy", "char_count", "hashtags", "site_anchor",
            "target_fish", "pull_type", "pull_url",
            "image_query", "status", "posted_at", "engagement"
        ])
        return ws

# ── Anthropic API ─────────────────────────────────────────────────────────────

def call_claude(stub: dict) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set")

    user_msg = f"""Generate social media posts for the following.

TOPIC: {stub.get('topic', '')}
ANGLE: {stub.get('angle', '')}
SOURCE_URLS: {json.dumps(stub.get('source_urls', []))}
SITE_ANCHOR: {stub.get('site_url', '')}
TARGET_FISH: {stub.get('target_fish', 'practitioner')}
PULL_TYPE: {stub.get('pull_type', 'site')}
PULL_URL: {stub.get('pull_url', '')}

Generate now."""

    payload = json.dumps({
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_msg}],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())

    raw = data["content"][0]["text"].strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(raw)

# ── Write rows to Drafts tab ─────────────────────────────────────────────────

def write_to_sheet(ws, stub: dict, generated: dict, dry_run: bool = False):
    now       = datetime.datetime.utcnow().isoformat()
    stub_id   = stub.get("stub_id", stub.get("_source_file", "UNKNOWN"))
    sched     = stub.get("scheduled_at", "")
    site_url  = stub.get("site_url", "")
    fish      = stub.get("target_fish", "practitioner")
    pull_type = stub.get("pull_type", "site")
    pull_url  = stub.get("pull_url", "")
    img_query = generated.get("image_query", "")

    rows = []

    # Mastodon
    m = generated.get("mastodon", {})
    if m:
        mc = len(m.get("copy", ""))
        tags = m.get("hashtags", [])
        bad  = set(tags) - APPROVED_HASHTAGS
        if mc > 500:
            print(f"  [WARN] Mastodon {stub_id} {mc}>500 chars", file=sys.stderr)
        if bad:
            print(f"  [WARN] Unapproved hashtags: {bad}", file=sys.stderr)
        rows.append([stub_id, now, "mastodon", "", sched,
                     m.get("copy",""), mc, " ".join(tags),
                     site_url, fish, pull_type, pull_url,
                     img_query, "draft", "", ""])

    # LinkedIn
    li = generated.get("linkedin", {})
    if li:
        lc = len(li.get("copy",""))
        if not (1000 <= lc <= 1500):
            print(f"  [WARN] LinkedIn {stub_id} {lc} chars (expected 1000-1500)", file=sys.stderr)
        rows.append([stub_id, now, "linkedin", "", sched,
                     li.get("copy",""), lc, "",
                     site_url, fish, pull_type, pull_url,
                     img_query, "draft", "", ""])

    # Reddit
    for r in generated.get("reddit", []):
        body  = r.get("body", "")
        title = r.get("title", "")
        copy  = f"TITLE: {title}\n\n{body}"
        rows.append([stub_id, now, "reddit", r.get("subreddit",""), sched,
                     copy, len(body), "",
                     site_url, fish, pull_type, pull_url,
                     img_query, "draft", "", ""])

    # BMAC
    bm = generated.get("bmac", {})
    if bm:
        rows.append([stub_id, now, "bmac", "", sched,
                     bm.get("copy",""), len(bm.get("copy","")), "",
                     site_url, fish, "bmac", pull_url,
                     img_query, "draft", "", ""])

    if dry_run:
        for r in rows:
            print(f"  [dry-run] would write: {r[2]} row for {r[0]}")
    else:
        for row in rows:
            ws.append_row(row, value_input_option="RAW")
        print(f"  Written {len(rows)} rows for {stub_id}")

# ── Stub loading ──────────────────────────────────────────────────────────────

def load_stubs(path: pathlib.Path = None) -> list:
    q = path or QUEUE_DIR
    stubs = []
    if not q.exists():
        return stubs
    for f in sorted(q.glob("*.yaml")):
        with f.open() as fh:
            stub = yaml.safe_load(fh)
        if stub.get("status") == "approved":
            stub["_source_file"] = str(f)
            stubs.append(stub)
    return stubs

# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="Social pipeline content generator")
    p.add_argument("--stub",    type=pathlib.Path, help="Single stub YAML file")
    p.add_argument("--all",     action="store_true", help="All approved stubs in queue")
    p.add_argument("--dry-run", action="store_true", help="Validate without writing")
    return p.parse_args()

def main():
    args = parse_args()

    if args.stub:
        with args.stub.open() as fh:
            stub = yaml.safe_load(fh)
        stub["_source_file"] = str(args.stub)
        stubs = [stub]
    elif args.all:
        stubs = load_stubs()
        if not stubs:
            print("No approved stubs found in data/content-queue/", file=sys.stderr)
            return 1
    else:
        print("Specify --stub FILE or --all", file=sys.stderr)
        return 1

    ws = None
    if not args.dry_run:
        client = get_sheet_client()
        ws = get_drafts_worksheet(client)

    for stub in stubs:
        ref = stub.get("stub_id", stub.get("_source_file", "unknown"))
        print(f"Processing: {ref}")

        if args.dry_run:
            print(f"  [dry-run] topic: {stub.get('topic','')[:60]}")
            print(f"  [dry-run] fish: {stub.get('target_fish')}  pull: {stub.get('pull_type')}")
            continue

        try:
            generated = call_claude(stub)
        except Exception as exc:
            print(f"  [error] {exc}", file=sys.stderr)
            continue

        write_to_sheet(ws, stub, generated, dry_run=False)
        time.sleep(2)

    return 0

if __name__ == "__main__":
    sys.exit(main())

