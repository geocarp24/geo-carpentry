# HANDOFF — Geo Persona Patch: 5 SM Pipeline Agents
> Cowork → Claude Code | 2026-06-08 | Sprint B completion

## Context
SM Manager (social_media.mjs) already has a Geo branch at L315.  
The other 4 agents still run Pinnacle-only prompts.  
**Pattern to apply in each agent:**

```javascript
// At top of file — already imported in most agents:
import { getTenantConfig } from '../../lib/tenant_config.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In the function that builds systemPrompt, add this block:
const personaPath = path.join(__dirname, '../../agents/tenants', `${cfg.tenant_id}_persona.md`);
const personaMd = fs.existsSync(personaPath) ? fs.readFileSync(personaPath, 'utf8') : '';
const isGeo = cfg.tenant_id === 'geo-carpentry';
```

---

## Agent 1 — Oráculo (`agents/oraculo/oraculo.mjs`)

**What to change:** systemPrompt review criteria — Geo voice = General Contractor, NOT real estate wholesale.

**Find the systemPrompt build section and add:**
```javascript
const domainContext = isGeo
  ? `TENANT CONTEXT: Geo Carpentry LLC is a General Contractor in Green Bay WI (NOT a real estate company).
Content must reflect: kitchen/bathroom remodels, deck building, finish carpentry, home renovation, general construction.
Voice: professional tradesman, bilingual (EN/ES), community-focused, 5-star rated since 2014.
REJECT content that: mentions real estate investing, wholesaling, property deals, motivated sellers, skip tracing.
REJECT content that uses Pinnacle's real estate lexicon.
${personaMd ? '\n--- PERSONA ---\n' + personaMd : ''}`
  : (existingPinnacleContext || '');

// Inject domainContext into systemPrompt before the review rubric
```

---

## Agent 2 — Reescritor (`agents/reescritor/reescritor.mjs`)

**What to change:** systemPrompt rewrite guidance — Geo voice for General Contractor.

```javascript
const rewriteGuidance = isGeo
  ? `REWRITE RULES FOR GEO CARPENTRY:
- Voice: Expert General Contractor. Warm, confident, bilingual-friendly.
- Services: kitchen remodel, bathroom remodel, deck, finish carpentry, home renovation, general construction.
- Location anchors: Green Bay, Appleton, Oshkosh, De Pere, Howard WI.
- CTA options: "Call (920) 367-1272", "Free estimate", "Book a consultation".
- NEVER mention: real estate, investing, motivated sellers, wholesaling, ARV, cap rate.
- Maintain: EN or ES language of original record (do NOT translate).
${personaMd ? '\n--- PERSONA ---\n' + personaMd : ''}`
  : (existingPinnacleRewriteGuidance || '');
```

---

## Agent 3 — Sofia / Creativo (`agents/creativo/creativo.mjs`)

**What to change:** Load `themes_geo.mjs` instead of `themes.mjs` for Geo tenant.

```javascript
// Replace static themes import with dynamic load:
let themes;
if (isGeo) {
  const { THEMES } = await import('./creativo_runner/themes_geo.mjs');
  themes = THEMES;
} else {
  const { THEMES } = await import('./creativo_runner/themes.mjs');
  themes = THEMES;
}

// Also inject persona into visual generation prompt:
const personaNote = isGeo && personaMd
  ? `\nBRAND NOTE: Geo Carpentry LLC — General Contractor, Green Bay WI. Visuals must show real construction work, tools, finished projects. NO stock-photo generic imagery. NO real estate imagery.\n`
  : '';
```

**Note:** `themes_geo.mjs` path = `agents/creativo/creativo_runner/themes_geo.mjs` — must exist in repo. If not present yet, create it (see HANDOFF_THEMES_GEO.md or check if already exists).

---

## Agent 4 — Leo / Director v2 (`agents/director_v2/director_v2.mjs`)

**What to change:** Same as Sofia — load `themes_geo.mjs` + inject Geo persona into video generation prompt.

```javascript
// Dynamic themes load:
let themes;
if (isGeo) {
  const { THEMES } = await import('../creativo/creativo_runner/themes_geo.mjs');
  themes = THEMES;
} else {
  const { THEMES } = await import('../creativo/creativo_runner/themes.mjs');
  themes = THEMES;
}

// In the video concept prompt:
const brandNote = isGeo
  ? `Brand: Geo Carpentry LLC, General Contractor, Green Bay WI.
Video style: real job sites, before/after reveals, Jorge or crew on camera.
Avoid: AI-generated fake imagery, generic stock footage.
Services: ${cfg.services?.join(', ') || 'kitchen remodel, bathroom remodel, deck, carpentry'}.`
  : (existingPinnacleBrandNote || '');
```

---

## Agent 5 — Marco / Publisher (`agents/social_media/social_media.mjs` + `graph_api.mjs`)

**What to change:** In `process_posts` mode and graph_api.mjs — read FB/IG tokens from vault (getTenantConfig) instead of hardcoded env vars.

**In social_media.mjs process_posts section:**
```javascript
// Replace any hardcoded PINNACLE_FB_TOKEN / FB_PAGE_ACCESS_TOKEN with:
const tenantCfg = getTenantConfig(tenant_id);
const fbPageToken = tenantCfg?.facebook?.pageAccessToken || process.env.FB_PAGE_ACCESS_TOKEN;
const fbPageId    = tenantCfg?.facebook?.pageId          || process.env.FB_PAGE_ID;
const igAccountId = tenantCfg?.facebook?.igAccountId     || process.env.IG_ACCOUNT_ID;
```

**In `graph_api.mjs` (if token is passed as param, verify it comes from above):**
```javascript
// Ensure postToFacebook(token, pageId, ...) and postToInstagram(token, igId, ...)
// receive the tenant-aware token, not a global env var.
```

**Geo Carpentry vault keys (already in /opt/alex-bot/.env or tenant config):**
```
FB_PAGE_ACCESS_TOKEN = <existing 26-permission token from 2026-06-01>
FB_PAGE_ID           = 723873447473999
IG_ACCOUNT_ID        = 17841475418377793
```

If `getTenantConfig('geo-carpentry').facebook` is not populated yet, add to `/opt/alex-bot/agents/tenants/geo-carpentry.json`:
```json
{
  "facebook": {
    "pageAccessToken": "<token>",
    "pageId": "723873447473999",
    "igAccountId": "17841475418377793"
  }
}
```

---

## Verification

After applying all patches, run:
```bash
cd /opt/alex-bot
node agents/social_media/social_media.mjs --tenant geo-carpentry --mode generate_ideas --max 2
# Expected: 4 records in Airtable (2 ideas × ES+EN), no UNKNOWN_FIELD_NAME, no Pinnacle lexicon

node agents/oraculo/oraculo.mjs --tenant geo-carpentry --mode review --limit 2
# Expected: reviews use General Contractor criteria, not real estate

node agents/reescritor/reescritor.mjs --tenant geo-carpentry --mode rewrite --limit 1
# Expected: rewrite in GC voice, preserves language (EN stays EN, ES stays ES)
```
