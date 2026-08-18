# GEO CARPENTRY — STACK TÉCNICO
> Última actualización: 2026-05-27

---

## AIRTABLE — appAQpveuAec077jF

### Tabla: Content_Queue (tblpiN42pK3YFxGEW)

| Field Name | Field ID | Tipo | Uso |
|---|---|---|---|
| run_id | fldFGx5f0WzkUCL3i | singleLineText | ID único del run |
| tenant_id | fldKAUO4jgNRNH3zT | singleLineText | "geo-carpentry" |
| status | fldqTgIhRr0b7llZ2 | singleSelect | draft → ready_to_publish → published |
| content_type | fldKmaQaJ83x7Qlh3 | singleSelect | "service_city_page" |
| pillar | fldu4mq8agXIdi33e | singleSelect | e.g. "kitchen-cost" |
| title | fld6JPtz77FmTWohm | singleLineText | WP post_title |
| target_keyword | fldNgbhMunjv2Mkqg | singleLineText | Yoast focuskw |
| intent_query | fldQ0g2rInGo35wqD | singleLineText | — |
| body_md | fldwAxioICyR9pnwD | multilineText | Markdown → HTML para WP |
| body_md_es | fldjSXjiAVXAFovza | multilineText | Vacío en Phase 1 |
| meta_description | fldIuZw3HUHxDES7L | singleLineText | Yoast metadesc |
| slug | fldwHvZ02rfKTlRkN | singleLineText | "service/city-wi" |
| schema_jsonld | fldYEupK3DvBfHIbB | multilineText | @graph con 3 schemas |
| word_count | fldEbC5uVMhhzIwun | number | referencia |
| suggested_internal_links | fld4wE0gwSlz2Bz3L | multilineText | JSON array de 5 links |
| language | fldeeHNeL5h7XRSec | singleSelect | "EN" |
| source_idea_id | fld91lY1lZoJmhM7h | singleLineText | "service_city" |
| wp_post_id | fldDeGO3thL3mpNdl | singleLineText | Seteado por Claude Code |
| wp_url | fldvwXEi2kOnLfufs | singleLineText | Seteado por Claude Code |

### Tabla: Decisions_Log (tbluHpgWlVNqSveVi)

Decisiones estratégicas de Claude Code, Cowork y Jorge. Registro permanente.

### Otras Tablas Relevantes
- **SEO_Audits** — datos del agente rastreador
- **Marketing_Audits** — datos del agente mercader

---

## WORDPRESS — geocarpentry.com

```
Hosting: Hostinger shared
SSH: u433637438@srv1067.hstgr.io
Doc Root: /home/u433637438/domains/geocarpentry.com/public_html
WP-CLI: wp (en PATH)
Plugin SEO: Yoast SEO (meta_yoast_wpseo_metadesc, _yoast_wpseo_focuskw)
mu-plugin: geo-service-city-pages.php (desplegado ✅)
```

**URL Pattern:** `/{service_slug}/{city_slug}-wi/`
**Parent pages:** 6 páginas private (una por servicio)
**Child pages:** 30 drafts (service × city)

**Yoast meta keys:**
- `_yoast_wpseo_metadesc` — meta description
- `_yoast_wpseo_focuskw` — focus keyphrase
- `_geo_schema_jsonld` — schema en post meta

---

## VPS — 187.77.215.146

```
OS: Linux
User: root
alex-bot path: /opt/alex-bot/
geo-webhook path: /opt/geo-webhook/  ✅ ACTIVO (2026-05-29)
```

**Agentes disponibles (21 agentes — actualizado 2026-05-29):**
```javascript
const AGENT_MAP = {
  // SEO & Content
  posicionador, rastreador, escriba, reescritor,
  // Marketing & Ads
  mercader, audit_meta, cazador,
  // Social Media
  social_media, creativo, director,
  // Lead Gen & CRM
  clasificador, embajador, remitente, foro,
  // Analytics & Intelligence
  analista, analitico, espia, oraculo,
  // Operations
  supervisor, auditor,
  // GBP
  nova,  // Google Business Profile Manager
};
```

**⚠️ HALLAZGOS 2026-07-31 (verificados en vivo por SSH):**
- `agents/nova/` **NO EXISTE** en `/opt/alex-bot/agents/` — el cron de Nova (health_check, post_update, reply_reviews, weekly_report) lleva fallando en silencio, nadie lo notó. Pendiente investigar/reconstruir.
- **No existe** `agents/_shared/tenant_loader.mjs` ni ningún loader compartido — los agentes reales (confirmado con `posicionador.mjs`) leen `agents/tenants/<slug>.json` directo con `readFile`, sin import compartido. Cualquier agente nuevo debe seguir ese patrón, no asumir un loader que no existe.
- **Dos proyectos de Google Cloud distintos en uso:** `GBP_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_ID` en `.env` apuntan a un proyecto (`26650922402-...`) que NO es `investoros-agents` (`1088922070563-...`, donde vive el cliente OAuth real `nova-gbp-agent` usado para Calendar). Aclarar cuál proyecto es el vigente antes de asumir credenciales compartidas entre agentes.
- Tenant JSON real (`geo-carpentry.json`) usa `AIRTABLE_TOKEN_GEO` (no `AIRTABLE_TOKEN`) y `TELEGRAM_CHAT_ID_GEO` (con fallback `TELEGRAM_CHAT_ID`) — variables específicas por tenant, no las genéricas.
- `airtable.leads_table_id` en el tenant JSON (`tblVqrROrVspFXniG`) es una tabla CRM distinta a `Geo_Leads` (`tblaH41HWeVG9ZXLn`, la que usa el bot SMS `geo_agent.php`) — no confundirlas.

**Nova (GBP) — credenciales:**
- GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN ← en /opt/alex-bot/.env ✅
- GBP_LOCATION_ID ← pendiente (quota 0 en Google Cloud Console → Jorge debe request quota increase)
- **GBP Place ID: `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ`** ✅ confirmado 2026-06-08 (735 E Walnut St #3, Green Bay WI)
- CC: agregar `gbp_place_id: 'ChIJ49c5Tlf7S4QRbXXNI1H0EvQ'` en geo-carpentry.json
- OAuth2 scope: `https://www.googleapis.com/auth/business.manage`
- Fix quota: https://console.cloud.google.com/apis/api/mybusinessaccountmanagement.googleapis.com/quotas?project=investoros-agents

**geo-webhook.service:**
- Puerto: **3003** ← ⚠️ IMPORTANTE: NO es 3001
- Auth: HMAC-SHA256 via header `x-webhook-signature`
- Multi-tenant: router enruta por `{ tenant, agent, mode }`
- Systemd: `/etc/systemd/system/geo-webhook.service`
- Status: `active (running)` ✅

---

## DASHBOARD — investoros-web.vercel.app

```
Framework: Next.js (App Router)
Deploy: Vercel
URL: https://investoros-web.vercel.app/geo
Repo: geo-carpentry/ (GitHub)
```

**Variables de entorno en Vercel:**
```
VPS_WEBHOOK_URL = http://187.77.215.146:3003/trigger   ✅ actualizado en Vercel 2026-05-29
WEBHOOK_SECRET  = c30b4c5a7b18ad63f9429e700b57e9b4e3b17c2b6bb293e6bfb287e716bddd93
```

**Componente clave:** `AgentStatusBar.tsx`
- Actualmente: status hardcodeado
- Fase 2: leer de Airtable (SEO_Audits + Marketing_Audits)
- Fase 2: botones "Run Now" → `/api/agents/[name]/trigger`

**API Route Fase 2:** `apps/investoros/src/app/api/agents/[name]/trigger/route.ts`

---

## REPOSITORIO GEO-CARPENTRY

```
Estructura relevante:
geo-carpentry/
├─ calude mem/           ← handoff docs para Claude Code
│  ├─ HANDOFF_WP_PAGES_CLAUDECODE.md
│  ├─ HANDOFF_WEBHOOK_FASE2_CLAUDECODE.md
│  ├─ HANDOFF_CLAUDECODE.md
│  └─ HANDOFF_DASHBOARD_CLAUDECODE.md
├─ agents/
│  └─ tenants/
│     └─ geo-carpentry-theme-bank.json  ← spec de las 30 páginas SEO
├─ automation/
│  └─ scripts/
│     └─ create_service_city_pages.py   ← bulk creator WP (listo, commit 866863e)
└─ apps/
   └─ investoros/                        ← Next.js dashboard
```

---

## THEME BANK — geo-carpentry-theme-bank.json

Spec completo de las 30 páginas SEO. Incluye:
- Ciudades con: neighborhoods, permits, demographics
- Servicios con: price_ranges, value_props, timelines
- Template de 8 secciones de contenido
- Internal linking strategy (max 2 anchor texts por target URL)
- Schema requirements (areaServed DEBE ser `{ "@type": "City", "name": "Green Bay, WI" }`)

---

## SAAS MULTI-TENANT

**Producto:** Investoros
**Tenant 0:** geo-carpentry (piloto)
**Tenant 1 planeado:** pinnacle

**Patrón multi-tenant:**
- URL: `/t/{tenant}/agents`
- Trigger webhook: `{ tenant, agent, mode }` → router auto-enruta
- Zero código nuevo para agregar tenant — solo config
