# HANDOFF → COWORK — Wire Eli (Escriba) to publish to Geo Carpentry WordPress

**Fecha:** 2026-05-29
**De:** Claude Code (CC)
**Para:** Cowork (CW)
**Re:** First end-to-end revenue-producing agent — Eli publishes the 30 city × service pages already drafted in Content_Queue to https://geocarpentry.com

---

## ✅ What CC has shipped

### 1. Credentials in the vault — ready for Eli to consume

Jorge seeded these via `POST /api/admin/seed-tenant-credential`. Stored encrypted (AES-256-GCM) in Supabase Postgres `Credential` table, tenant `geo-carpentry` (id `cmpqfuhhh0000l804ibwll0q9`):

| service | keyName | value | metadata |
|---|---|---|---|
| `wordpress` | `app_password` | (24-char WP Application Password) | `{"username":"geocarpentryllc", "url":"https://geocarpentry.com"}` |
| `google_business` | `oauth_client_id` | `1088922070563-cpgq4csjuuihsf413d9kqk9hr6jbgdd2.apps.googleusercontent.com` | `{"project_id":"investoros-agents"}` |
| `google_business` | `oauth_client_secret` | (encrypted) | — |
| `airtable` | `api_token` | (seeded earlier from `AIRTABLE_TOKEN_GEO`) | — |
| `airtable` | `base_id` | `appAQpveuAec077jF` | — |

### 2. `TenantConfig` TypeScript type extended

`apps/investoros/src/lib/credentials.ts` now exposes the WP REST API credentials cleanly. When CW (or any VPS-side TypeScript) calls `getTenantConfigBySlug("geo-carpentry")`, the returned object includes:

```typescript
config.wordpress = {
  url: "https://geocarpentry.com",
  username: "geocarpentryllc",
  appPassword: "xxxx xxxx xxxx xxxx xxxx xxxx", // decrypted just-in-time
  bridgeToken: undefined, // legacy mu-plugin path; not used for Geo
};

config.googleBusiness = {
  oauthClientId: "1088922070563-...",
  oauthClientSecret: "GOCSPX-...",
  oauthRefreshToken: undefined, // populated after Jorge completes the OAuth flow
  placeId: undefined,
};
```

The OAuth refresh token flow (for Nova) is **not** built yet — that's a separate piece for the Nova sprint. For Eli today, only `config.wordpress` matters.

### 3. Vault read pattern from VPS

Eli on VPS reads credentials by hitting an HTTP endpoint on the web app — there is no direct DB call from VPS (it does not have the `ENCRYPTION_KEY`). CC will expose:

```
GET https://www.investoros.tech/api/internal/tenant-config?tenant=geo-carpentry
Headers: x-internal-secret: <WEBHOOK_SECRET>
Response: { wordpress: { url, username, appPassword }, ... }
```

(Endpoint not yet built — flagged as the next CC task for the Eli sprint. If CW prefers a different pattern — e.g. direct Postgres connection from VPS with the encryption key shared — that is negotiable.)

---

## 🎯 What CW needs to do for Eli

### Architecture target

```
                Content_Queue (Airtable)
                ─────────────────────────
                rows with status="ready_to_publish"
                            │
                            ▼
                ┌───────────────────────────┐
                │     Eli (Escriba)         │
                │  agents/escriba/*.mjs     │
                └────────────┬──────────────┘
                             │ POST /wp-json/wp/v2/posts
                             │ Auth: Basic base64(username:app_password)
                             │ Body: { title, content (HTML), status, slug, meta }
                             ▼
                ┌───────────────────────────┐
                │  geocarpentry.com         │
                │  WordPress REST API       │
                └────────────┬──────────────┘
                             │ response: { id, link, ... }
                             ▼
                Content_Queue update:
                  status = "published"
                  wp_post_id = <id from response>
                  wp_url = <link from response>
                  published_at = <now>
```

### Specific changes in `agents/escriba/escriba.mjs`

1. **Read tenant config** from CC's `getTenantConfigBySlug(tenantSlug)` (or equivalent VPS-side fetch). Reject if `config.wordpress?.username` or `config.wordpress?.appPassword` missing — surface a clear error to Telegram so Jorge knows what is unconfigured.

2. **Query Content_Queue** for rows where:
   ```
   filterByFormula = AND({status}="ready_to_publish", {tenant_id}="geo-carpentry")
   ```
   Limit to e.g. 5 per run to avoid spam in case of bugs.

3. **For each row**, convert `body_md` to HTML (Eli probably already does this — markdown-to-HTML via marked or similar).

4. **POST to WP REST API**:
   ```
   POST https://geocarpentry.com/wp-json/wp/v2/posts
   Headers:
     Authorization: Basic <base64(username:appPassword)>
     Content-Type: application/json
   Body:
     {
       "title": <title from Content_Queue>,
       "content": <body_html>,
       "status": "draft",          // Jorge approves manually before publish — start safe
       "slug": <slug from Content_Queue>,
       "excerpt": <meta_description>,
       "meta": {
         "_yoast_wpseo_focuskw": <target_keyword>,
         "_yoast_wpseo_metadesc": <meta_description>
       }
     }
   ```

   Start with `status: "draft"` so Jorge reviews before they go public. Promote to `"publish"` once we have the first successful end-to-end.

5. **On 2xx response**, update the Content_Queue row in Airtable:
   ```
   {
     "status": "published",
     "wp_post_id": <response.id>,
     "wp_url": <response.link>,
     "published_at": <ISO timestamp>
   }
   ```

6. **On error** (auth failure, schema mismatch, WP plugin missing, etc.), update the row with:
   ```
   {
     "status": "publish_failed",
     "last_error": <short message>,
     "last_error_at": <ISO timestamp>
   }
   ```
   and Telegram-notify Jorge with the human-readable error + row ID + link to Airtable.

### Cron schedule for Eli

Initial pacing (per `geo-carpentry.json` content_goals — 2 per week):

```cron
# Tuesdays + Fridays at 10:00 UTC — publish up to 2 pending drafts
0 10 * * 2,5 cd /opt/alex-bot && node agents/escriba/escriba.mjs --tenant geo-carpentry --mode publish_batch --max 2
```

The 30 city-service pages already in Content_Queue means Eli has ~15 weeks of inventory pre-loaded.

---

## 🧪 Smoke test plan

Once Eli is wired, end-to-end test:

1. **Manual trigger** from dashboard: `https://www.investoros.tech/geo-carpentry/agents` → click **Run Now** on Eli (status moves to active for Geo). Sends `mode: "publish_batch"` to the trigger route.

2. **Expected within ~60s:**
   - One row from Content_Queue with `status="ready_to_publish"` flips to `status="published"` with `wp_post_id` populated.
   - The corresponding draft post is visible in https://geocarpentry.com/wp-admin/edit.php with the right title, body, slug, meta.
   - Telegram notification: "✅ Eli published `<title>` to geocarpentry.com (draft)".

3. **If it fails:** the row's `status` becomes `publish_failed` with a `last_error` field. CC pulls the Airtable row + paste here. CW iterates.

4. **Once smoke test passes:**
   - Switch `status: "draft"` → `status: "publish"` in Eli's payload so future runs publish immediately.
   - Add the cron schedule.
   - Mark Eli `status: "active"` in the agents page UI (CC does this).
   - Update Decisions_Log.

---

## ❓ Open questions for CW

1. **How does VPS read credentials from CC's Postgres vault today?**
   CW's Fase B refactor mentions agents read from `TenantConfig`. Is the read pattern HTTP to CC's API, direct Postgres, or env var fallback? If the answer is "TBD," the simplest path is for CC to expose `GET /api/internal/tenant-config` and CW caches the result for the duration of a single run. CC can build that in ~30 min.

2. **Existing `pinnacle_wp_bridge.php` mu-plugin** — should Geo use the same approach (custom mu-plugin) or stick to the standard WP REST API + Application Password? Recommendation: **standard REST API**. It's simpler, no plugin install needed on Hostinger, and works the same way for every future tenant. Bridge mu-plugin can stay as a Pinnacle legacy.

3. **Yoast SEO meta fields** — does `geocarpentry.com` have Yoast installed? If yes, the `meta._yoast_wpseo_*` fields above work. If it uses SureRank instead, the field keys are different. CC can verify via `curl https://geocarpentry.com/wp-json/wp/v2/posts/<known-id> | jq .meta`. CW: any preference?

4. **Eli's existing schema for Content_Queue** — the 30 rows are already drafted with `body_md`, `slug`, `meta_description`, etc. If Eli's publish mode expects different column names, CC can write a small migration. CW: any non-obvious column names?

5. **Rate limit / safety** — initial cron at "max 2 per run, 2 runs per week" = 4 posts/week. Safe. Bump to daily once it's been stable for 2 weeks.

---

## 📁 Files of reference (read-only for CW)

```
apps/investoros/src/lib/credentials.ts                         ← TenantConfig type + getTenantConfigBySlug
apps/investoros/src/app/api/admin/seed-tenant-credential/      ← admin endpoint Jorge used to seed
apps/investoros/agents/tenants/geo-carpentry.json              ← tenant config (read-only for Eli)
agents/escriba/                                                  ← Eli's code, your domain
```

GitHub: `geocarp24/investoros-web` branch `main`.

---

## 🚦 Status after CW completes this

| Before this handoff | After |
|---|---|
| Eli: 🟡 code-ready, not wired for Geo | Eli: ✅ active for Geo |
| Active agents for Geo: 2 (Rex, Echo) | Active agents for Geo: **3** (Rex, Echo, Eli) |
| Geo Carpentry SEO pipeline: audit-only | Geo Carpentry SEO pipeline: **audit + publish** |
| Revenue path | Direct: 30 pages → indexed → organic leads in 4-8 weeks |

---

## 🎯 Go signal

Jorge approved the sprint. Three credentials seeded. CC has updated `TenantConfig` to expose WP REST API fields. Ready when CW is.

When you ship the Escriba refactor:
1. Reply to this handoff with the commit SHA in `geocarp24/alex-bot` (or wherever Escriba lives on VPS).
2. Ping CC to verify with manual trigger.
3. We move to Marco (Social Media) next.
