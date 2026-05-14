#!/usr/bin/env python3
"""
populate_base.py — Crea las 7 tablas (6 CRM + SEO_Audits) en la base
Geo Carpentry CRM siguiendo el schema documentado en CRM_SCHEMA.md.

Uso:
    AIRTABLE_TOKEN=pat... python automation/airtable/populate_base.py [--base-id appXXX]

Orden de dependencia (NO cambiar):
    1. Contacts          (no deps)
    2. Subcontractors    (no deps)
    3. Leads             (depende de Contacts)
    4. Jobs              (depende de Leads + Contacts + Subcontractors)
    5. Activities        (depende de Contacts + Leads + Jobs)
    6. Permits_Intel     (depende de Contacts + Leads)
    7. SEO_Audits        (independiente — para El Posicionador)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
import urllib.error


META_BASE = "https://api.airtable.com/v0/meta/bases"


def api(token: str, method: str, url: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    data = json.dumps(body).encode("utf-8") if body else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"  HTTP {e.code}: {err_body}", file=sys.stderr)
        raise


def existing_tables(token: str, base_id: str) -> dict[str, dict]:
    """Returns {table_name: table_obj} for current tables in base."""
    resp = api(token, "GET", f"{META_BASE}/{base_id}/tables")
    return {t["name"]: t for t in resp.get("tables", [])}


def create_table(token: str, base_id: str, name: str, description: str, fields: list[dict]) -> dict:
    """Create a new table; returns the new table object."""
    body = {"name": name, "description": description, "fields": fields}
    return api(token, "POST", f"{META_BASE}/{base_id}/tables", body)


def update_table_name(token: str, base_id: str, table_id: str, new_name: str, description: str = "") -> dict:
    body = {"name": new_name}
    if description:
        body["description"] = description
    return api(token, "PATCH", f"{META_BASE}/{base_id}/tables/{table_id}", body)


def add_field(token: str, base_id: str, table_id: str, field_spec: dict) -> dict:
    return api(token, "POST", f"{META_BASE}/{base_id}/tables/{table_id}/fields", field_spec)


# ─── Schema definitions ────────────────────────────────────────────────────

# Field shorthand helpers
def F_text(name): return {"name": name, "type": "singleLineText"}
def F_long(name): return {"name": name, "type": "multilineText"}
def F_email(name): return {"name": name, "type": "email"}
def F_phone(name): return {"name": name, "type": "phoneNumber"}
def F_url(name): return {"name": name, "type": "url"}
def F_check(name): return {"name": name, "type": "checkbox", "options": {"icon": "check", "color": "greenBright"}}
def F_date(name): return {"name": name, "type": "date", "options": {"dateFormat": {"name": "iso"}}}
def F_dt(name): return {"name": name, "type": "dateTime", "options": {"dateFormat": {"name": "iso"}, "timeFormat": {"name": "24hour"}, "timeZone": "America/Chicago"}}
def F_created(name): return {"name": name, "type": "createdTime", "options": {"result": {"type": "dateTime", "options": {"dateFormat": {"name": "iso"}, "timeFormat": {"name": "24hour"}, "timeZone": "America/Chicago"}}}}
def F_num(name, precision=0): return {"name": name, "type": "number", "options": {"precision": precision}}
def F_curr(name): return {"name": name, "type": "currency", "options": {"precision": 2, "symbol": "$"}}
def F_pct(name): return {"name": name, "type": "percent", "options": {"precision": 1}}
def F_select(name, options, color_default="grayLight2"):
    return {"name": name, "type": "singleSelect", "options": {"choices": [{"name": o, "color": color_default} for o in options]}}
def F_multi(name, options, color_default="grayLight2"):
    return {"name": name, "type": "multipleSelects", "options": {"choices": [{"name": o, "color": color_default} for o in options]}}
def F_attach(name): return {"name": name, "type": "multipleAttachments"}
def F_link(name, linked_table_id, prefer_single=False):
    """Linked record field. On CREATE TABLE, only `linkedTableId` is accepted in options."""
    return {"name": name, "type": "multipleRecordLinks", "options": {"linkedTableId": linked_table_id}}
def F_rating(name, max_val=5): return {"name": name, "type": "rating", "options": {"icon": "star", "max": max_val, "color": "yellowBright"}}
def F_autonum(name): return {"name": name, "type": "autoNumber"}
def F_formula(name, formula): return {"name": name, "type": "formula", "options": {"formula": formula}}


# ─── Table specs (ordered by dependency) ───────────────────────────────────

# 1. Contacts (Primary: Name)
def contacts_fields():
    return [
        F_text("Name"),
        F_email("Email"),
        F_phone("Phone"),
        F_text("Address"),
        F_select("City", [
            "Green Bay", "Howard", "De Pere", "Allouez", "Bellevue", "Suamico",
            "Ashwaubenon", "Appleton", "Oshkosh", "Sheboygan", "Manitowoc",
            "Fond du Lac", "Wausau", "Marinette", "Oconto", "Shawano", "Pulaski",
            "Other"
        ]),
        F_select("Source", [
            "Google", "Facebook Page", "FB Marketplace", "FB Group", "Google Maps",
            "Referral", "Door Hanger", "Permits Scraper", "Walk-in", "Repeat Customer",
            "Personal Network", "Craigslist", "Yelp", "Other"
        ]),
        F_multi("Tags", ["VIP", "Hot", "Warm", "Cold", "Repeat", "Referrer"]),
        F_date("First contact date"),
        F_date("Last contact date"),
        F_long("Notes"),
    ]


# 2. Subcontractors (Primary: Name)
def subs_fields():
    return [
        F_text("Name"),
        F_phone("Phone"),
        F_email("Email"),
        F_multi("Specialty", [
            "Framing", "Electrical", "Plumbing", "Drywall", "Painting",
            "Roofing", "Finish Carpentry", "General", "Tile", "Concrete", "HVAC"
        ]),
        F_select("Rate type", ["Hourly", "Per project", "Mixed"]),
        F_curr("Rate value"),
        F_check("Has license"),
        F_check("Has insurance"),
        F_check("Has truck"),
        F_text("Referenced by"),
        F_rating("Rating"),
        F_check("Active"),
        F_date("Joined date"),
        F_long("Notes"),
    ]


# 3. Leads (Primary: Lead title text)
def leads_fields(contacts_id):
    return [
        F_text("Lead title"),  # ej: "Maria Lopez - Kitchen Remodel"
        F_link("Contact", contacts_id, prefer_single=True),
        F_select("Service", [
            "Deck Building", "Deck Repair", "Kitchen Remodel", "Bathroom Remodel",
            "Home Addition", "Framing", "Drywall", "Painting", "Roofing",
            "Finish Carpentry", "General Repair", "Custom"
        ]),
        F_long("Description"),
        F_attach("Photos"),
        F_select("Stage", [
            "New", "Quote Requested", "Quote Sent", "Negotiating",
            "Won", "Lost", "Ghost"
        ]),
        F_curr("Estimated value"),
        F_num("Probability", precision=0),  # 0-100
        F_dt("Created date"),  # populated by automation on insert (createdTime not API-creatable)
        F_text("Next action"),
        F_date("Next action date"),
        F_select("Assigned to", ["Jorge", "TBD"]),
        F_date("Quote sent date"),
        F_date("Won/Lost date"),
        F_select("Loss reason", [
            "Price too high", "Timeline", "Hired Another", "No Response",
            "Out of scope", "Other"
        ]),
    ]


# 4. Jobs (Primary: Job title text)
# NOTE: formula fields cannot be created in CREATE TABLE — must be added separately via addField
def jobs_fields(leads_id, subs_id):
    return [
        F_text("Job title"),  # ej: "Maria Lopez - Kitchen Remodel 2026-05-14"
        F_link("Lead", leads_id, prefer_single=True),
        F_curr("Contract value"),
        F_curr("Materials cost"),
        F_curr("Labor cost"),
        F_curr("Other costs"),
        F_date("Start date"),
        F_date("Estimated end date"),
        F_date("Actual end date"),
        F_select("Status", ["Scheduled", "In Progress", "On Hold", "Completed", "Cancelled"]),
        F_link("Subcontractors", subs_id),
        F_select("Payment status", ["Unpaid", "Deposit Paid (30%)", "Mid-payment", "Paid Full"]),
        F_url("Invoice URL"),
        F_attach("Photos before"),
        F_attach("Photos during"),
        F_attach("Photos after"),
        F_check("Review requested"),
        F_check("Review received"),
    ]

# Formula fields para Jobs — añadidos POST-creación
def jobs_formula_fields():
    return [
        F_formula("Total cost", "{Materials cost} + {Labor cost} + {Other costs}"),
        F_formula("Profit", "{Contract value} - {Materials cost} - {Labor cost} - {Other costs}"),
        F_formula("Margin %", "IF({Contract value}>0, ({Contract value} - {Materials cost} - {Labor cost} - {Other costs}) / {Contract value} * 100, 0)"),
    ]


# 5. Activities (Primary: Activity summary text)
def activities_fields(contacts_id, leads_id, jobs_id):
    return [
        F_text("Activity summary"),  # ej: "2026-05-14 Call Maria Lopez"
        F_dt("Date"),
        F_select("Type", [
            "Call", "Email Sent", "Email Received", "SMS Sent", "SMS Received",
            "Visit", "Quote Sent", "Estimate Visit", "Job Update",
            "Payment Received", "Review"
        ]),
        F_link("Contact", contacts_id, prefer_single=True),
        F_link("Lead", leads_id, prefer_single=True),
        F_link("Job", jobs_id, prefer_single=True),
        F_text("Outcome"),
        F_long("Notes"),
        F_select("Created by", ["Jorge", "ALEX bot", "Auto-system"]),
    ]


# 6. Permits_Intel (Primary: Permit number)
def permits_fields(contacts_id, leads_id):
    return [
        F_text("Permit number"),
        F_date("Date issued"),
        F_select("County", [
            "Brown", "Outagamie", "Winnebago", "Calumet",
            "Door", "Marinette", "Other WI"
        ]),
        F_text("Owner name"),
        F_text("Address"),
        F_text("City"),
        F_select("Service type", [
            "Deck", "Kitchen", "Bathroom", "Addition", "Framing",
            "Roof", "Garage", "New Build", "Other"
        ]),
        F_curr("Estimated project value"),
        F_select("Status", ["New", "Called", "Quoted", "Won", "Lost", "No Contact Info"]),
        F_date("First call date"),
        F_link("Contact", contacts_id, prefer_single=True),
        F_link("Lead", leads_id, prefer_single=True),
        F_long("Notes"),
    ]


# 7. SEO_Audits (Primary: run_id) — para El Posicionador
def seo_audits_fields():
    return [
        F_text("run_id"),
        F_text("tenant_id"),
        F_select("audit_type", ["seo_health", "seo_deep", "on_demand"]),
        F_select("status", ["Queued", "Running", "Done", "Failed"]),
        F_select("trigger", ["cron", "alex_manual", "api"]),
        F_dt("started_at"),
        F_dt("completed_at"),
        F_num("duration_sec"),
        F_num("overall_score"),
        F_num("technical_score"),
        F_num("local_score"),
        F_num("content_score"),
        F_long("mobile_cwv"),
        F_num("score_delta", precision=1),
        F_long("top_issues"),
        F_long("top_wins"),
        F_long("recommendations"),
        F_long("local_ranks"),
        F_long("competitor_gaps"),
        F_long("schema_coverage"),
        F_long("summary_md"),
        F_url("report_url"),
        F_num("tokens_used"),
        F_dt("created_at"),  # populated by automation on insert
    ]


# ─── Main orchestration ────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-id", default="appAQpveuAec077jF", help="Airtable base ID")
    parser.add_argument("--rename-table1", action="store_true", help="Rename existing Table 1 to Contacts instead of creating fresh")
    parser.add_argument("--dry-run", action="store_true", help="Just print plan, no API calls")
    args = parser.parse_args()

    token = os.environ.get("AIRTABLE_TOKEN")
    if not token:
        print("ERROR: set AIRTABLE_TOKEN environment variable", file=sys.stderr)
        return 2

    print(f"Base: {args.base_id}")

    # Step 1: Inventory
    print("\n=== Step 1: Inventario tablas actuales ===")
    current = existing_tables(token, args.base_id)
    print(f"  {len(current)} tablas: {list(current.keys())}")

    table_ids = {}

    # Step 2: Contacts
    if "Contacts" in current:
        print(f"\n[skip] Contacts ya existe ({current['Contacts']['id']})")
        table_ids["Contacts"] = current["Contacts"]["id"]
    else:
        if "Table 1" in current and args.rename_table1:
            print("\n=== Step 2a: Rename Table 1 → Contacts ===")
            t1_id = current["Table 1"]["id"]
            if not args.dry_run:
                # Rename + add Contacts fields (extra to the 6 defaults)
                update_table_name(token, args.base_id, t1_id, "Contacts", "Clientes y prospectos de Geo Carpentry")
                # Add missing Contacts fields (those not in default Table 1)
                existing_field_names = {f["name"] for f in current["Table 1"].get("fields", [])}
                for spec in contacts_fields():
                    if spec["name"] not in existing_field_names:
                        try:
                            add_field(token, args.base_id, t1_id, spec)
                            print(f"  +field: {spec['name']}")
                        except Exception as e:
                            print(f"  !field {spec['name']} failed: {e}")
            table_ids["Contacts"] = t1_id
        else:
            print("\n=== Step 2: Crear tabla Contacts ===")
            if args.dry_run:
                table_ids["Contacts"] = "DRY_RUN_CONTACTS"
            else:
                t = create_table(token, args.base_id, "Contacts",
                                  "Clientes y prospectos de Geo Carpentry",
                                  contacts_fields())
                table_ids["Contacts"] = t["id"]
                print(f"  created: {t['id']}")

    # Step 3: Subcontractors
    if "Subcontractors" in current:
        print(f"\n[skip] Subcontractors ya existe")
        table_ids["Subcontractors"] = current["Subcontractors"]["id"]
    else:
        print("\n=== Step 3: Crear tabla Subcontractors ===")
        if args.dry_run:
            table_ids["Subcontractors"] = "DRY_RUN_SUBS"
        else:
            t = create_table(token, args.base_id, "Subcontractors",
                              "Subcontratistas de Geo Carpentry",
                              subs_fields())
            table_ids["Subcontractors"] = t["id"]
            print(f"  created: {t['id']}")

    # Step 4: Leads (depends on Contacts)
    if "Leads" in current:
        print(f"\n[skip] Leads ya existe")
        table_ids["Leads"] = current["Leads"]["id"]
    else:
        print("\n=== Step 4: Crear tabla Leads ===")
        if args.dry_run:
            table_ids["Leads"] = "DRY_RUN_LEADS"
        else:
            t = create_table(token, args.base_id, "Leads",
                              "Oportunidades antes de cerrar contrato",
                              leads_fields(table_ids["Contacts"]))
            table_ids["Leads"] = t["id"]
            print(f"  created: {t['id']}")

    # Step 5: Jobs (depends on Leads, Subs)
    if "Jobs" in current:
        print(f"\n[skip] Jobs ya existe")
        table_ids["Jobs"] = current["Jobs"]["id"]
    else:
        print("\n=== Step 5: Crear tabla Jobs ===")
        if args.dry_run:
            table_ids["Jobs"] = "DRY_RUN_JOBS"
        else:
            t = create_table(token, args.base_id, "Jobs",
                              "Contratos cerrados en ejecución",
                              jobs_fields(table_ids["Leads"], table_ids["Subcontractors"]))
            table_ids["Jobs"] = t["id"]
            print(f"  created: {t['id']}")
            # Now add formula fields (can't be added in CREATE TABLE)
            print("  adding formula fields:")
            for spec in jobs_formula_fields():
                try:
                    add_field(token, args.base_id, t["id"], spec)
                    print(f"    +formula: {spec['name']}")
                except Exception as e:
                    print(f"    !formula {spec['name']} failed: {e}")

    # Step 6: Activities (depends on Contacts, Leads, Jobs)
    if "Activities" in current:
        print(f"\n[skip] Activities ya existe")
        table_ids["Activities"] = current["Activities"]["id"]
    else:
        print("\n=== Step 6: Crear tabla Activities ===")
        if args.dry_run:
            table_ids["Activities"] = "DRY_RUN_ACT"
        else:
            t = create_table(token, args.base_id, "Activities",
                              "Log de cada interacción con contacto",
                              activities_fields(table_ids["Contacts"], table_ids["Leads"], table_ids["Jobs"]))
            table_ids["Activities"] = t["id"]
            print(f"  created: {t['id']}")

    # Step 7: Permits_Intel (depends on Contacts, Leads)
    if "Permits_Intel" in current:
        print(f"\n[skip] Permits_Intel ya existe")
        table_ids["Permits_Intel"] = current["Permits_Intel"]["id"]
    else:
        print("\n=== Step 7: Crear tabla Permits_Intel ===")
        if args.dry_run:
            table_ids["Permits_Intel"] = "DRY_RUN_PERM"
        else:
            t = create_table(token, args.base_id, "Permits_Intel",
                              "Permits scrapeados WI counties — pre-leads",
                              permits_fields(table_ids["Contacts"], table_ids["Leads"]))
            table_ids["Permits_Intel"] = t["id"]
            print(f"  created: {t['id']}")

    # Step 8: SEO_Audits (independiente)
    if "SEO_Audits" in current:
        print(f"\n[skip] SEO_Audits ya existe")
        table_ids["SEO_Audits"] = current["SEO_Audits"]["id"]
    else:
        print("\n=== Step 8: Crear tabla SEO_Audits ===")
        if args.dry_run:
            table_ids["SEO_Audits"] = "DRY_RUN_SEO"
        else:
            t = create_table(token, args.base_id, "SEO_Audits",
                              "El Posicionador audits — SEO monitoring",
                              seo_audits_fields())
            table_ids["SEO_Audits"] = t["id"]
            print(f"  created: {t['id']}")

    # Final summary
    print("\n=== ✓ Done. Table IDs para tenant config ===")
    for name, tid in table_ids.items():
        print(f"  {name:20s} {tid}")

    print("\nPara geo-carpentry.json:")
    print(json.dumps({
        "airtable": {
            "base_id": args.base_id,
            "contacts_table_id": table_ids.get("Contacts"),
            "leads_table_id": table_ids.get("Leads"),
            "jobs_table_id": table_ids.get("Jobs"),
            "subs_table_id": table_ids.get("Subcontractors"),
            "activities_table_id": table_ids.get("Activities"),
            "permits_table_id": table_ids.get("Permits_Intel"),
            "seo_table_id": table_ids.get("SEO_Audits"),
            "token_env": "AIRTABLE_TOKEN_GEO"
        }
    }, indent=2))

    return 0


if __name__ == "__main__":
    sys.exit(main())
