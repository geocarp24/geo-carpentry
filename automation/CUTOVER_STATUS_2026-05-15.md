# Geo Carpentry — Cutover Status (2026-05-15)

## Final state (post-overnight Sprint 1 + Sprint 2 quick wins)

| Layer | Status |
|---|---|
| **DNS (Squarespace)** | ✅ Clean — only `156.67.74.243` resolves, CAA `pki.goog` removed, legacy CloudFront/Durable/cf-custom-hostname records purged |
| **SSL** | ✅ Let's Encrypt cert installed via Hostinger, valid through 2026-08-13 |
| **`https://geocarpentry.com`** | ✅ HTTP 200 + cert valid (no browser warnings) |
| **All 13 main pages HTTPS** | ✅ 200 OK on home, about, services (+6 detail), portfolio, contact, sitemap, robots |
| **WP siteurl/home** | ✅ `https://geocarpentry.com` |
| **LiteSpeed cache** | ✅ Active, purged after every edit batch |
| **Form `/contact/` (SureForm 2340)** | ✅ Button "Get My Free Estimate", 7 fields, Privacy link below, end-to-end tested with real submit → Airtable Lead created → cleaned |
| **mu-plugin lead capture** | ✅ Active in `/wp-content/mu-plugins/geo-airtable-lead-capture.php`, constants in `wp-config.php` |
| **Schema markup** | ✅ "EXCELLENT" per Posicionador audit — LocalBusiness `GeneralContractor` w/ 17-city `areaServed`, `OfferCatalog`, `GeoCoordinates` |
| **Posicionador SEO** | ✅ Baseline run 2026-05-15, score 58/100 in Airtable `SEO_Audits` |
| **Escriba content engine** | ✅ Setup complete, first plan_week run generated 2 articles in Content_Queue |
| **InvestorOS Geo dashboard** | ✅ Scaffolded at `apps/investoros/src/app/(dashboard)/geo/` (commit `7ecaa8c`), needs `npm install` + dev server to test locally |

## What changed during the cutover sprint

**DNS cleanup (Jefe via Squarespace UI):**
- Deleted `CAA @ → 0 issue "pki.goog"` (was blocking Let's Encrypt issuance)
- Deleted 6 legacy records: AWS CloudFront, Durable.co verification, Cloudflare custom-hostname, 2× ACME challenges, unknown subdomain validation
- Kept: A `@ → 156.67.74.243`, CNAME `www → geocarpentry.com`, 2× Google site verification, Apple domain verification, Squarespace Domain Connect preset, Google Workspace MX (5 records)

**SSL emission:**
- Cancelled stuck "Installing" cert in hPanel + clicked "Install SSL" again
- Hostinger emitted Let's Encrypt cert against clean DNS within minutes
- Verified via `openssl s_client` from server side

**WP content alignment (Jefe correction):**
Geo Carpentry does NOT make custom cabinets/closets/woodwork/built-in shelving. Removed 7 mentions across:
- Page 2285 Portfolio (3 replacements)
- Page 2284 About (1 replacement)
- Post 2302 Winter Myths (2 replacements)
- Post 2294 Kitchen Cost (1 replacement)
- Post 2299 "Custom Cabinets vs Stock" — moved to **draft status** (entire post misaligned, backup in `~/.geo_backups/`)
- Tenant config keywords + topic_pillars updated

## Outstanding items (need Jefe action)

| Item | Where | Effort |
|---|---|---|
| Add Cron Job for weekly Posicionador | hPanel → Advanced → Cron Jobs (see authorization section in overnight report) | 2 min |
| Run OAuth init local for refresh_token | Windows PowerShell (see overnight report) | 5 min |
| Review 2 Escriba article plans + approve to draft | Airtable Content_Queue | 5 min |
| Provide 10-15 hi-res project photos | Google Drive link | 30 min |
| Provide 3-5 named testimonials | Text message | 10 min |
| Approve form above-the-fold mobile reorder OR keep as-is | Visual decision | 1 min |

## Rollback runbook (if anything breaks)

**Site goes down:**
1. hPanel → File Manager → restore from `wp-config.php.bak.geo`
2. Restore child theme: `cp style.css.bak.20260515 style.css; cp functions.php.bak.20260515 functions.php` (in `/wp-content/themes/geo-carpentry-child/`)
3. WP-CLI: `wp post-content < ~/.geo_backups/<id>_<timestamp>.txt` for individual pages

**Form breaks:**
1. WP admin → SureForms → Form 2340 → revert to baseline
2. Or via WP-CLI: `wp post update 2340 --post_status=draft` to take offline

**Cache stale:**
- `wp litespeed-purge all` on Hostinger SSH (any time)

## URLs for reference

- Live site: https://geocarpentry.com
- Staging (still alive as reference): https://blueviolet-gerbil-900105.hostingersite.com
- WP admin: https://geocarpentry.com/wp-admin (admin@geocarpentry.com)
- hPanel: https://hpanel.hostinger.com
- Airtable Geo CRM: https://airtable.com/appAQpveuAec077jF
- Squarespace DNS: https://account.squarespace.com/domains/managed/geocarpentry.com/dns/dns-settings
- Google Cloud Console (OAuth client): https://console.cloud.google.com (project "Claude for Real Estate")
- Geo dashboard (local dev): `cd InvestorOS/apps/investoros && npm install && npm run dev` → http://localhost:3000/geo

## Backups locations

- `~/.geo_backups/` — backups of every WP post/page that was edited (filename: `<id>_<timestamp>.txt`)
- `~/.geo_backups/<id>_seo_<timestamp>.txt` — pre-SEO-edit backups (SEO titles + H1 batch)
- `~/.geo_backups/<id>_maps_<timestamp>.txt` — pre-Google Maps embed backup
- `domains/geocarpentry.com/public_html/wp-content/themes/geo-carpentry-child/style.css.bak.20260515` — pre-polish CSS
- `domains/geocarpentry.com/public_html/wp-content/themes/geo-carpentry-child/functions.php.bak.20260515` — pre-polish PHP
- `domains/geocarpentry.com/public_html/wp-config.php.bak.geo` — pre-Airtable-constants config
