#!/usr/bin/env python3
"""
create_service_city_pages.py — Bulk WP page creator from Airtable Content_Queue.

Reads rows where:
  - tenant_id = "geo-carpentry"
  - content_type = "service_city_page"
  - status = "ready_to_publish"

For each row, creates a WP page in DRAFT status with:
  - post_title from row.title
  - post_content = row.body_md rendered to HTML (basic conversion)
  - page template = "page-service-city.php"
  - post meta: _gc_service_slug, _gc_service_name, _gc_city_slug, _gc_city_name,
               _gc_county, _gc_phone, _gc_ticket_range, _gc_target_keyword,
               _gc_faq_jsonld, _gc_internal_links, _gc_cta_primary

After creation, Jorge bulk-publishes from WP admin.

USAGE (run from VPS or local with SSH access to Hostinger):
  python3 create_service_city_pages.py --dry-run        # preview without creating
  python3 create_service_city_pages.py                  # create all ready pages
  python3 create_service_city_pages.py --limit 1        # create one (for testing)

ENV REQUIRED:
  AIRTABLE_TOKEN_GEO   — PAT for Geo Carpentry Airtable base
  SSH_PASSWORD         — for SSH'ing into Hostinger
  (Hostinger SSH: u433637438@156.67.74.243:65002)

Author: Claude Code (Bucket B5)
Created: 2026-05-27
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

# --- Config ---
BASE_ID = "appAQpveuAec077jF"
TABLE_ID = "tblpiN42pK3YFxGEW"  # Content_Queue
TENANT_ID = "geo-carpentry"
CONTENT_TYPE = "service_city_page"
WP_PATH = "domains/geocarpentry.com/public_html"  # path inside Hostinger SSH user home

# Page template file name (must match the file in child-theme/)
PAGE_TEMPLATE = "page-service-city.php"

# Service slug → display name (used for postmeta lookup; mirrors theme_bank)
SERVICES = {
    "kitchen-remodeling": ("Kitchen Remodeling", "$5,000 – $30,000"),
    "bathroom-remodeling": ("Bathroom Remodeling", "$3,000 – $15,000"),
    "deck-building": ("Deck Building", "$2,000 – $12,000"),
    "finish-carpentry": ("Finish Carpentry", "$500 – $8,000"),
    "home-renovation": ("Home Renovation", "$5,000 – $50,000"),
    "general-construction": ("General Construction", "$3,000 – $100,000+"),
}

# City slug → (display name, county)
CITIES = {
    "green-bay": ("Green Bay", "Brown"),
    "appleton": ("Appleton", "Outagamie"),
    "oshkosh": ("Oshkosh", "Winnebago"),
    "de-pere": ("De Pere", "Brown"),
    "howard": ("Howard", "Brown"),
}


def fetch_records(status_filter="ready_to_publish"):
    """Query Airtable Content_Queue for rows matching status filter.

    Cowork writes records with status='draft' initially. Once Jorge + Claude Code
    review the sample, status is bumped to 'ready_to_publish' and bulk creator
    publishes those as WP draft pages.

    Pass status_filter='draft' to dry-run against Cowork's freshly-generated
    batch before promotion.
    """
    token = os.environ.get("AIRTABLE_TOKEN_GEO")
    if not token:
        sys.exit("ERROR: AIRTABLE_TOKEN_GEO env var not set")

    formula = (
        f"AND("
        f"{{tenant_id}}='{TENANT_ID}',"
        f"{{content_type}}='{CONTENT_TYPE}',"
        f"{{status}}='{status_filter}'"
        f")"
    )
    params = urlencode({"filterByFormula": formula, "pageSize": 100})
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}?{params}"
    req = Request(url, headers={"Authorization": f"Bearer {token}"})
    with urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
    return data.get("records", [])


# Back-compat alias for the original name
def fetch_ready_records():
    return fetch_records("ready_to_publish")


def update_record_status(record_id, new_status, page_id=None):
    """Update Content_Queue row status after publish."""
    token = os.environ["AIRTABLE_TOKEN_GEO"]
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}/{record_id}"
    fields = {"status": new_status}
    if page_id:
        fields["wp_post_id"] = page_id
    body = json.dumps({"fields": fields, "typecast": True}).encode()
    req = Request(url, method="PATCH", data=body, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def markdown_to_html_basic(md):
    """Minimal markdown → HTML conversion (no external deps).
    For richer rendering, install python-markdown and replace this function.
    """
    import re
    out = md
    # Headings
    out = re.sub(r"^### (.+)$", r"<h3>\1</h3>", out, flags=re.MULTILINE)
    out = re.sub(r"^## (.+)$", r"<h2>\1</h2>", out, flags=re.MULTILINE)
    out = re.sub(r"^# (.+)$", r"<h2>\1</h2>", out, flags=re.MULTILINE)  # h1 reserved for template
    # Bold/italic
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", out)
    # Links
    out = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', out)
    # Lists (basic)
    out = re.sub(r"^- (.+)$", r"<li>\1</li>", out, flags=re.MULTILINE)
    out = re.sub(r"(<li>.+</li>\n?)+", lambda m: "<ul>" + m.group(0) + "</ul>", out)
    # Paragraphs (split on blank line, wrap non-tag blocks)
    paragraphs = []
    for block in re.split(r"\n\s*\n", out):
        block = block.strip()
        if not block:
            continue
        if block.startswith(("<h", "<ul", "<ol", "<p", "<div", "<section")):
            paragraphs.append(block)
        else:
            paragraphs.append(f"<p>{block}</p>")
    return "\n\n".join(paragraphs)


def _parse_slug(combined_slug):
    """Cowork stores combined path in `slug` field: e.g. 'kitchen-remodeling/green-bay-wi'.
    Parse into (service_slug, city_slug) using whitelists.

    Returns (service_slug, city_slug) or (None, None) if can't parse.
    """
    if not combined_slug:
        return None, None
    # Format: {service-slug}/{city-slug}-wi
    parts = combined_slug.strip("/").split("/")
    if len(parts) != 2:
        return None, None
    svc, city_with_suffix = parts
    # Strip "-wi" suffix from city
    city = city_with_suffix.rsplit("-wi", 1)[0] if city_with_suffix.endswith("-wi") else city_with_suffix
    return svc, city


def build_wp_cli_create_cmd(row, dry_run=False):
    """Build the wp post create + wp post meta update commands for one record."""
    fields = row["fields"]
    record_id = row["id"]

    # Required fields — Cowork populates these per geo-carpentry-theme-bank.json spec
    title = fields.get("title", "").strip()
    body_md = fields.get("body_md", "")
    target_keyword = fields.get("target_keyword", "")
    meta_description = fields.get("meta_description", "")
    schema_jsonld = fields.get("schema_jsonld", "")

    # Cowork stores combined path in `slug` field (e.g. "kitchen-remodeling/green-bay-wi"),
    # NOT as separate service_slug + city_slug fields. Parse it.
    service_slug, city_slug = _parse_slug(fields.get("slug", ""))
    if not service_slug or not city_slug:
        # Fallback to source_idea_id if slug parsing fails
        # Format: "{service_slug}_{city_slug}" e.g. "kitchen-remodeling_green-bay"
        source_id = fields.get("source_idea_id", "")
        if source_id and "_" in source_id:
            parts = source_id.split("_", 1)
            if len(parts) == 2:
                service_slug, city_slug = parts

    # Cowork uses `suggested_internal_links` (not `internal_links`)
    internal_links = fields.get("suggested_internal_links", "")

    # These fields don't exist in Cowork's current Content_Queue schema — derived/optional
    faq_jsonld = ""  # Could parse from body_md or schema_jsonld FAQPage section later
    cta_primary = f"Get My Free {service_slug.replace('-', ' ').title()} Estimate" if service_slug else "Get My Free Estimate"

    if not title or not service_slug or not city_slug:
        return None, f"SKIP {record_id}: missing title/service/city (slug='{fields.get('slug', '')}')"

    if service_slug not in SERVICES:
        return None, f"SKIP {record_id}: unknown service_slug '{service_slug}'"
    if city_slug not in CITIES:
        return None, f"SKIP {record_id}: unknown city_slug '{city_slug}'"

    service_name, ticket_range = SERVICES[service_slug]
    city_name, county = CITIES[city_slug]

    # Convert body markdown → HTML
    body_html = markdown_to_html_basic(body_md) if body_md else f"<p>Content for {service_name} in {city_name}, WI coming soon.</p>"

    # Compose meta dict
    meta = {
        "_wp_page_template": PAGE_TEMPLATE,
        "_gc_service_slug": service_slug,
        "_gc_service_name": service_name,
        "_gc_city_slug": city_slug,
        "_gc_city_name": city_name,
        "_gc_county": county,
        "_gc_phone": "+19203671272",
        "_gc_ticket_range": ticket_range,
        "_gc_target_keyword": target_keyword,
        "_gc_cta_primary": cta_primary,
        "_yoast_wpseo_metadesc": meta_description,  # SureRank also reads this
        "_genesis_description": meta_description,
        "_gc_meta_description": meta_description,
    }
    if faq_jsonld:
        meta["_gc_faq_jsonld"] = faq_jsonld
    if internal_links:
        meta["_gc_internal_links"] = internal_links
    if schema_jsonld:
        meta["_gc_extra_schema"] = schema_jsonld

    if dry_run:
        return {
            "_dry_run": True,
            "title": title,
            "service": service_slug,
            "city": city_slug,
            "body_html_length": len(body_html),
            "meta_keys": list(meta.keys()),
        }, None

    # Build a shell script to run on the VPS / Hostinger (one record per call)
    # Uses wp post create + wp post meta update for each meta key.
    safe_title = title.replace('"', '\\"').replace("$", "\\$")
    safe_html = body_html.replace("'", "'\\''")  # single-quote escape for heredoc

    cmd_create = (
        f"/usr/local/bin/wp --path={WP_PATH} post create "
        f"--post_type=page "
        f"--post_status=draft "
        f"--post_title=\"{safe_title}\" "
        f"--post_content='{safe_html}' "
        f"--porcelain"
    )

    return {
        "record_id": record_id,
        "title": title,
        "service_slug": service_slug,
        "city_slug": city_slug,
        "cmd_create": cmd_create,
        "meta": meta,
    }, None


def _infer_service_slug(fields):
    """Some Cowork records may not set service_slug explicitly — infer from title."""
    title = fields.get("title", "").lower()
    for slug in SERVICES:
        if slug.replace("-", " ") in title or slug in title:
            return slug
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Preview, don't create")
    parser.add_argument("--limit", type=int, default=None, help="Max pages to create (for testing)")
    parser.add_argument("--output-script", default=None, help="Write WP-CLI commands to a .sh file")
    parser.add_argument(
        "--status",
        default="ready_to_publish",
        help="Filter Content_Queue by status (default: ready_to_publish; use 'draft' to preview Cowork's batch before promotion)",
    )
    args = parser.parse_args()

    print(f"[{datetime.utcnow().isoformat()}Z] Fetching Content_Queue (status='{args.status}')...")
    records = fetch_records(args.status)
    print(f"Found {len(records)} records.")

    if args.limit:
        records = records[:args.limit]
        print(f"Limiting to first {args.limit}.")

    if not records:
        print("Nothing to do. Cowork has not generated content yet, or all is already published.")
        return

    if args.output_script:
        # Generate a single .sh file that can be uploaded + run on the server
        script_path = Path(args.output_script)
        with script_path.open("w", encoding="utf-8", newline="\n") as f:
            f.write("#!/bin/bash\n")
            f.write("# Auto-generated by create_service_city_pages.py\n")
            f.write(f"# Generated: {datetime.utcnow().isoformat()}Z\n")
            f.write(f"# Records: {len(records)}\n\n")
            f.write("set -e\n\n")

            for row in records:
                payload, err = build_wp_cli_create_cmd(row, dry_run=args.dry_run)
                if err:
                    f.write(f"# {err}\n\n")
                    continue
                if args.dry_run:
                    f.write(f"# DRY-RUN preview for record {row['id']}:\n")
                    f.write(f"# {json.dumps(payload, indent=2)}\n\n")
                    continue
                rid = payload["record_id"]
                f.write(f"\n# ---- Record {rid} ({payload['service_slug']} × {payload['city_slug']}) ----\n")
                f.write(f"PAGE_ID=$({payload['cmd_create']})\n")
                f.write('echo "Created page ID: $PAGE_ID"\n')
                for k, v in payload["meta"].items():
                    safe_v = str(v).replace("'", "'\\''")
                    f.write(f"/usr/local/bin/wp --path={WP_PATH} post meta update $PAGE_ID '{k}' '{safe_v}'\n")
                # Mark Airtable record as published (post-creation hook would be cleaner; for now noted)
                f.write(f"# TODO: update Airtable record {rid} status=published, wp_post_id=$PAGE_ID via API\n")

            f.write("\n# DONE. To flush rewrite rules after creating pages:\n")
            f.write(f"# /usr/local/bin/wp --path={WP_PATH} rewrite flush --hard\n")
        print(f"\nWrote {script_path}")
        print(f"Upload + execute on Hostinger:")
        print(f"  python sftp_upload.py {script_path} /tmp/create_pages.sh")
        print(f"  python ssh_hostinger.py 'bash /tmp/create_pages.sh'")
        return

    # Inline execution mode (not implemented for safety — use --output-script)
    print("ERROR: inline execution not supported yet. Use --output-script <path>")
    sys.exit(1)


if __name__ == "__main__":
    main()
