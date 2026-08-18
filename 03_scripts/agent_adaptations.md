# Agent Adaptations — Pinnacle → Geo Carpentry
# CC: apply these substitutions to the 6 agent files on VPS

## Substitution map (search → replace in each file)

---

### 1. social_media/social_media.mjs

```
FIND:    process.env.AIRTABLE_SM_POSTS_TABLE_ID   (or hardcoded Pinnacle table ID)
REPLACE: process.env.AIRTABLE_SM_POSTS_TABLE_ID_GEO

FIND:    process.env.AIRTABLE_SM_REELS_TABLE_ID
REPLACE: process.env.AIRTABLE_SM_REELS_TABLE_ID_GEO

FIND:    process.env.AIRTABLE_SM_VIDEOS_TABLE_ID
REPLACE: process.env.AIRTABLE_SM_VIDEOS_TABLE_ID_GEO
```

Pattern to make tenant-aware (if not already):
```js
// At top of file, after args parsing:
const IS_GEO = TENANT_SLUG === 'geo-carpentry';
const SM_POSTS  = IS_GEO ? process.env.AIRTABLE_SM_POSTS_TABLE_ID_GEO  : process.env.AIRTABLE_SM_POSTS_TABLE_ID;
const SM_REELS  = IS_GEO ? process.env.AIRTABLE_SM_REELS_TABLE_ID_GEO  : process.env.AIRTABLE_SM_REELS_TABLE_ID;
const SM_VIDEOS = IS_GEO ? process.env.AIRTABLE_SM_VIDEOS_TABLE_ID_GEO : process.env.AIRTABLE_SM_VIDEOS_TABLE_ID;
```

---

### 2. oraculo/oraculo.mjs

```
FIND:    'oraculo_inputs/wi_homeowner_persona.md'  (or Pinnacle persona path)
REPLACE: TENANT_SLUG === 'geo-carpentry'
           ? 'agents/tenants/geo-carpentry_persona.md'
           : 'agents/tenants/pinnacle_persona.md'
```

---

### 3. reescritor/reescritor.mjs

```
FIND:    'oraculo_inputs/sm_lessons.md'
REPLACE: TENANT_SLUG === 'geo-carpentry'
           ? 'oraculo_inputs/geo_lessons.md'
           : 'oraculo_inputs/sm_lessons.md'
```

---

### 4. creativo/creativo.mjs (Sofia)

```
FIND:    import { ... } from '../creativo_runner/themes.mjs'
REPLACE: const themesModule = TENANT_SLUG === 'geo-carpentry'
           ? await import('../creativo_runner/themes_geo.mjs')
           : await import('../creativo_runner/themes.mjs');
         const { buildHtml, getTheme, POST_TYPE_THEMES } = themesModule;
```

---

### 5. director_v2/director_v2.mjs (Leo)

```
FIND:    import { ... } from '../creativo_runner/themes.mjs'  (if referenced)
REPLACE: same dynamic import pattern as creativo above

FIND:    persona path hardcoded to Pinnacle
REPLACE: TENANT_SLUG === 'geo-carpentry'
           ? '/opt/alex-bot/agents/tenants/geo-carpentry_persona.md'
           : '/opt/alex-bot/agents/tenants/pinnacle_persona.md'
```

Note: narrative_B.mjs (5×3s spec) — DO NOT TOUCH. Keep as-is for all tenants.

---

### 6. social_media/graph_api.mjs

```
FIND:    process.env.META_PAGE_ACCESS_TOKEN  (or META_USER_TOKEN)
REPLACE: // Load from vault for Geo:
         const vaultConfig = await fetchTenantConfig(TENANT_SLUG, WEBHOOK_SECRET);
         const PAGE_TOKEN  = vaultConfig.facebook.pageAccessToken;
         const PAGE_ID     = vaultConfig.facebook.pageId;
         const IG_BIZ_ID   = vaultConfig.facebook.igBusinessId;
```

fetchTenantConfig helper (add to top of file):
```js
async function fetchTenantConfig(tenant, secret) {
  const r = await fetch(
    `https://www.investoros.tech/api/internal/tenant-config?tenant=${tenant}`,
    { headers: { 'x-internal-secret': secret } }
  );
  if (!r.ok) throw new Error(`tenant-config ${r.status}`);
  return r.json();
}
```

---

### 7. safety.mjs — Warmup rate limit for Geo

Add to existing getMaxPostsForTenant() or rateLimit() function:
```js
if (tenantSlug === 'geo-carpentry') {
  const start = new Date('2026-06-01');
  const week  = Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
  if (week <= 1) return 1;
  if (week <= 2) return 2;
  if (week <= 4) return 3;
  return 4; // full rate after week 5
}
```

---

## New files to create on VPS

| File | Source | Action |
|------|--------|--------|
| `/opt/alex-bot/agents/creativo_runner/themes_geo.mjs` | Memory Claude/03_scripts/themes_geo.mjs | SCP |
| `/opt/alex-bot/agents/tenants/geo_config.mjs` | Memory Claude/03_scripts/geo_config.mjs | SCP |
| `/opt/alex-bot/agents/atlas/atlas.mjs` | Memory Claude/03_scripts/atlas.mjs | SCP + mkdir |
| `/opt/alex-bot/agents/supervisor/last_run_geo.json` | `{"critical":[],"warnings":[],"health":"green","pipeline":{}}` | Create empty |

## Env vars to add to VPS .env (CC Fase 1 will provide IDs)

```bash
AIRTABLE_SM_POSTS_TABLE_ID_GEO=<id from CC>
AIRTABLE_SM_REELS_TABLE_ID_GEO=<id from CC>
AIRTABLE_SM_VIDEOS_TABLE_ID_GEO=<id from CC>
```

## AGENT_MAP additions for router.mjs

```js
// Add to AGENT_MAP in /opt/geo-webhook/router.mjs:
'atlas':    { script: '/opt/alex-bot/agents/atlas/atlas.mjs',    defaultMode: 'remediate' },
```
