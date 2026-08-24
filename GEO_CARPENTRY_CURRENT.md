# GEO CARPENTRY — ESTADO ACTUAL DEL PROYECTO
> Última actualización: 2026-08-22 (GeoBudget Deck — 8 correcciones de materiales aplicadas)

---

## 🎯 RESUMEN EJECUTIVO

Geo Carpentry LLC es un General Contractor en Green Bay, WI (propietario Jorge Cruz, Latino-owned, fundado 2014). El proyecto es construir un sistema SaaS multi-tenant (`Investoros`) que gestiona SEO, marketing y operaciones de contractors. Geo Carpentry es el tenant 0 / caso piloto.

**Website Geo Carpentry:** https://geocarpentry.com (WordPress + Elementor en Hostinger shared)
**Landing InvestorOS:** https://www.investoros.tech (Next.js en Vercel — commit 7f79c34 — LIVE)
**Dashboard SaaS:** https://investoros-web.vercel.app/geo (Next.js en Vercel)
**VPS:** root@187.77.215.146 (alex-bot agents + cron)

---

## 📊 SPRINT ACTIVO (Mayo 2026)

### ✅ COMPLETADO SPRINT GEOBUDGET (2026-08-05)

1. **GeoBudget Siding — Labor Only contract type** ✅
   - Radio buttons en modal de contrato (Full / Labor Only)
   - `buildContractHtml()`: precio sin materiales/tax, Secciones 2/3/7/8 ajustadas para owner-supplied materials
   - `buildComboIncludesList()` ahora 100% dinámico — lee `result.materials` y `result.laborBreakdown`
   - Save/load/clear actualizados para persistir `contractType`

2. **Contractor Packages overhead fix — 4 apps** ✅
   - **Siding**: helpers `contractorPackagesBase/Overhead/Total()` — modal, print, email, Best Value badge
   - **Deck**: `contractorOverheadAmt()` + `contractorTotal()` refactorizados
   - **Remodel**: igual que Deck + corregido texto engañoso "overhead NOT added"
   - **Roofing**: helpers `contractorLaborBase/Overhead/Total()` — modal, print, email
   - Todos muestran "Overhead & Profit" como línea visible en el desglose
   - Precio que cliente aprueba = precio que el contrato cobra ✅

3. **Archivos listos para Hostinger** — Jorge sube manualmente:
   - `budget/siding/index.html`
   - `budget/deck/index.html`
   - `budget/remodel/index.html`
   - `budget/roofing/index.html`

---

### ✅ COMPLETADO SPRINT B (2026-06-08)

1. **Airtable schema — Geo_Posts / Geo_Reels / Geo_Videos** ✅
   - 33 campos en Geo_Posts (status: Idea→Oraculo OK→Visual Listo→Programado→Publicado)
   - 7 campos en Geo_Reels, 8 en Geo_Videos — esquemas entregados a CC vía handoff

2. **SM Pipeline fix — Geo_Lessons** ✅
   - Root cause: record `recVuhbDDyCXiNza5` tenía persona de Pinnacle Holdings (real estate / foreclosure) filtrando al Ideator
   - Fix: actualizado a "Geo Carpentry LLC es General Contractor — NO empresa de real estate"
   - Resultado: SM pipeline aprobó 4 posts (scores 8-9) en run del 9-Jun 02:21 AM
   - 9 posts en estado "Visual Listo" listos para publicar (bloqueados por Marco cron silenciado)

3. **301 Redirects — 7 pares de URLs duplicadas** ✅ LIVE
   - WPCode snippet ID 2989 — PHP, Auto Insert, Run Everywhere — STATUS: ACTIVE
   - Verificado con curl: los 7 retornan 301 con Location correcto
   - URLs redirigidas:
     ```
     /bathroom-remodeling-de-pere-wi/   → /bathroom-remodeling/de-pere-wi/
     /bathroom-remodeling-green-bay-wi/ → /bathroom-remodeling/green-bay-wi/
     /bathroom-remodeling-oshkosh-wi/   → /bathroom-remodeling/oshkosh-wi/
     /kitchen-remodeling-de-pere-wi/    → /kitchen-remodeling/de-pere-wi/
     /kitchen-remodeling-green-bay-wi/  → /kitchen-remodeling/green-bay-wi/
     /kitchen-remodeling-oshkosh-wi/    → /kitchen-remodeling/oshkosh-wi/
     /deck-building-green-bay-wi/       → /deck-building/green-bay-wi/
     ```

4. **GBP Place ID confirmado** ✅
   - `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ` — pendiente que CC lo agregue a geo-carpentry.json

5. **5 Handoffs escritos para CC** ✅ (en 02_handoffs/)
   - `HANDOFF_AGENTS_GEO_PATCH.md` — patch 5 SM pipeline agents (Oráculo, Reescritor, Sofia, Leo, Marco) para Geo persona
   - `HANDOFF_ATLAS_PLAYBOOKS.md` — 3 Atlas playbooks (review_schema_missing, alt_text_generic, gbp_place_id_tbd)
   - `HANDOFF_FOREMAN_SEO_FIX.md` — Foreman cache-bust fix (SEO score 58→75+)
   - `HANDOFF_ATLAS_LOOP2.md` — Atlas Loop 2: LLM propone playbooks + aprobación Telegram

---

### ✅ COMPLETADO SESIONES ANTERIORES (2026-05-27) — incluye Claude Code handoff

1. **30 records SEO en Airtable** ✅ + **30 páginas WordPress PUBLICADAS** ✅

2. **GEO Agent — Deploy completo en producción** ✅ LIVE
   - URL: `https://geocarpentry.com/tools/geo_agent.php`
   - Bugs corregidos: OpenPhone payload + SMS format (`content` field, `to` como array)
   - Cron jobs en Hostinger: seguimientos c/hora + morning brief 7:30 AM lun-vie
   - SMS end-to-end confirmado: `sms_sent: true`

3. **geo-webhook.service Fase 2** ✅ LIVE en VPS puerto 3003

4. **27 retratos AI creados via Canva** ✅ — TODOS GUARDADOS
   - Carpeta: `Geo Carpentry/investoros-agents/` (también en repo: `public/investoros-agents/`)
   - 27 archivos PNG 800×800px confirmados:
     agent-fer, agent-tracy, agent-marco, agent-sofia, agent-leo, agent-max,
     agent-nina, agent-sage, agent-rex, agent-ava, agent-echo, agent-zed,
     agent-eli, agent-chase, agent-nova, agent-kai, agent-luca, agent-remi,
     agent-scout, agent-atlas, agent-orion, agent-viper, agent-ember, agent-flynn,
     agent-carto, agent-ward, agent-penny
   - ⚠️ IGNORAR archivos legacy: agent-alex, agent-creativo, agent-enterprise,
     agent-posicionador, agent-secretario, agent-supervisor (nombres viejos en español)
   - ⚠️ PENDIENTE: Retratos no se ven en el mockup al abrir localmente (path issue)
     → Se resuelve en próxima sesión (Jorge lo abrirá con servidor o Claude Code implementa en Next.js)

5. **InvestorOS Landing Page — Mockup recreado y mejorado** ✅
   - Archivo local: `Geo Carpentry/investoros-landing-mockup.html`
   - Archivo handoff para Claude Code: `Geo Carpentry/HANDOFF_CLAUDE_CODE.md`
   - Bug corregido: Flynn tenía borde índigo (Planned) → ámbar (Code-Complete) ✅

6. **InvestorOS Landing v2 — DEPLOYADA EN PRODUCCIÓN** ✅ (Claude Code — commit 7f79c34)
   - **URL LIVE:** https://www.investoros.tech (apex investoros.tech → redirect 308 → www)
   - **Vercel:** https://investoros-web.vercel.app (preserved)
   - **Repo:** geocarp24/investoros-web · branch main · SHA 7f79c34
   - **Build:** 9.46 kB page · 112 kB First Load JS · compiló en 6.9s · static prerendered
   - **Archivos modificados:**
     - `apps/investoros/src/app/page.tsx` → reescrito (358 líneas)
     - `apps/investoros/src/app/landing.module.css` → reescrito (~700 líneas)
   - **27 PNGs creados** en `apps/investoros/public/investoros-agents/`
   - **6 PNGs legacy preservados** en `apps/investoros/public/agents/` (los usa dashboard `/geo` → `AgentStatusBar`)
   - **Secciones en orden:** Navbar → Hero (badge "67 spots left") → Stats (30s/27/24-7/60d) →
     Agents grid 9×3 → VS Competitors (BatchLeads/Pipedrive/Hootsuite) →
     Pricing 4 tiers + Founder Banner → Tech Stack 12 pills → Footer "© 2026 Pinnacle Holdings Group LLC"
   - **Responsive:** 9 cols desktop / 6 cols tablet / 3 cols mobile
   - **SSL:** Let's Encrypt auto en investoros.tech

   ✅ **DECISIONES CONFIRMADAS POR JORGE (2026-05-27):**
   1. Stats "27" — correcto, son 27 agentes ✅
   2. Pricing 4 tiers (Starter $197 / Growth $397 / Pro $997 / Enterprise) — correcto, pendiente revisión de precios finales ✅
   3. Legacy 6 PNGs en `/public/agents/` — se quedan, no tocar ✅

7. **Agentes InvestorOS — RENOMBRADO DE ESPAÑOL → INGLÉS** ✅ (CAMBIO IMPORTANTE)
   - Los 27 agentes fueron renombrados de nombres españoles a nombres en inglés
   - Ver sección AGENTES COMPLETOS abajo (actualizada)

---

### ✅ COMPLETADO SESIÓN 2026-08-22 — GeoBudget Deck + Build fixes

**Archivo:** `budget/deck/index.html` — listo para subir a Hostinger

1. **Dumpster fee** ✅ — $450 (consistente con roofing app, se activa solo cuando include-tearoff está checked)
2. **Joist Hanger** ✅ — `2x4` → `2x8` (match con joists PT 2x8x12), precio $1.15 → $2.15
3. **Post Base** ✅ — `4x4` → `6x6` (match con posts PT 6x6x10), precio $12.80 → $21.35
4. **Rail Posts 4x4** ✅ — WoodTraditional ahora calcula 1 post cada 6ft + 1 en cada extremo (PT 4x4x8, $9.95 ea)
5. **Top + Bottom Rail** ✅ — PT 2x4x12 (12ft piezas), `ceil(railLf/12)` piezas cada uno ($5.15 ea)
6. **WoodTraditional blended rate** ✅ — `horizontalMaterialPerLf` $7.00 → $0.50 (misc hardware; boards/posts ahora explícitos)
7. **PVC/Aluminum railing** ✅ — muestra número de paneles (e.g. "7 panel") en vez de LF
8. **Concreto footings** ✅ — ya no es 1 bolsa/footing; calcula volumen real de sonotube:
   - Inputs nuevos: Sonotube Diameter (default 16") + Footing Depth (default 48")
   - Formula: `π × r² × h ÷ 0.375 cu ft` → **15 bolsas** para 16"×48" estándar
   - Save/load/reset actualizados para ambos inputs

---

### ✅ COMPLETADO SESIÓN 2026-08-19 — Review Request Agent

1. **Geo_Leads analizado** ✅
   - 10 records total (no 35 como se estimaba antes)
   - 3 clientes elegibles (job linked + no DNC): Nedd & Jill Schommer, Robin, Andrea Vandermeulen
   - 2 excluidos por DNC, 5 sin job linked (leads en pipeline)
   - Todos los elegibles son English-speaking — ningún cliente ES confirmado aún

2. **HANDOFF_CC_REVIEW_REQUEST_AGENT.md creado** ✅
   - Archivo: `/opt/alex-bot/agents/review_request/review_request.mjs`
   - Lógica: filtra en JS (hasJob + !DNC + cooldown 30d + status válido)
   - SMS en EN y ES via Twilio
   - Campo nuevo requerido en Airtable: `Review Requested At` (Date)
   - GOOGLE_REVIEW_URL ✅ confirmado 2026-08-23: `https://g.page/r/CW11zSNR9BL0EBM/review`
   - Trigger: manual desde CRM app (no cron automático) — botón en UI por job
   - CC prerequisitos: confirmar Twilio creds
   - DRY_RUN=true obligatorio en primera ejecución

---

### ✅ COMPLETADO SESIÓN 2026-08-17 — Meta Ads + GitHub Backup

1. **Meta Ads — $50/semana APROBADO por Jorge** ✅
   - Campaña A (English): $25/semana · FB+IG · edad 35-65 · Green Bay +25mi · homeowners
   - Campaña B (Spanish/Hispanic): $25/semana · FB+IG · edad 30-60 · Green Bay +25mi
   - Objetivo: Messages (DM → estimado)
   - 6 creativos seleccionados del pool de Visual Listo (score ≥ 8):
     - EN: recwZtAefTuKE38MK (Tub→Shower IG s9), recfsbjY7orovpqtW (Shower Honest IG s9), recRkHPWuZeyGUdY8 (You Asked FB+IG s8)
     - ES: recoC1SMskMxPioXa (Ducha vs Tina IG s9), rechU6hg8wNvz7ypS (Cedro vs Compuesto FB s9), rec8cthYFwuH6eE06 (Cocina 90s IG s8)
   - HANDOFF_CC_META_ADS_AGENT.md creado — campañas se crean en PAUSED, Jorge activa manualmente
   - ⚠️ CC necesita: confirmar Ad Account ID, IG Business Account ID, nombre del campo imagen en Geo_Posts

2. **Scheduler agent (programador.mjs) — CANCELADO** ✅
   - CC confirmó: Social_Insights no existe, El Analítico escribe métricas PER POST en Geo_Posts
   - Publisher ya maneja Programado correctamente — no hay gap
   - Problema real: 6 FB followers / 5 IG followers = reach de ~3 personas → solución = Meta Ads

3. **NUMERIC_TIME_CLAIM fixes** ✅
   - 4 captions corregidas: rec3gJsqLJeycopGP, recOLjg6Pkd9qT7vk, recQ1qGveegwAFcQR, recg2Fsyy4URnEDPU
   - Seeds corregidos: D02 (cedar year 1), D07 (65-80 cents), D10 (year 4), R02 (weeks), R08 (week by week), B02 (71 cents), B03 (1987 year)

4. **GitHub Backup** ✅
   - Repo: https://github.com/geocarp24/geo-carpentry (PRIVATE)
   - 118 archivos: memoria, 25 handoffs, agentes VPS, tenant configs, 30 páginas SEO ES
   - Backup automático diario 11pm via Cowork scheduled task (geo-carpentry-git-backup)
   - .env con GitHub PAT en Memory Claude (gitignored)
   - Airtable token redactado en RULES.md y HANDOFF_LEAD_CAPTURE.md antes del push

---

### ✅ COMPLETADO SPRINT 2026-08-16B — GeoBudget Roofing upgrades

**Archivo:** `budget/roofing/index.html` — listo para subir a Hostinger

1. **Repair Mode checkbox** ✅
   - Checkbox en header activa modo de reparación parcial
   - En repair mode: oculta Roof Sections card, muestra Repair Scope card (direct sqft + pitch + eave + rake LF)
   - Roof Lines card (Ridge/Hip/Valley/Pipe Boots) SIEMPRE visible en ambos modos
   - Carpentry Extras card SIEMPRE visible en ambos modos
   - `toggleRepairMode()`, `computeRepairExtras()` añadidos
   - `computeAllRoofTotals()` con rama repair mode, `computeCombinationTotal()` incluye repairExtras

2. **Carpentry Extras — materials table completo** ✅
   - Soffit: vinyl $4.20 → **aluminum vented panel $2.75/LF** (Menards Sell-Even 16"×12ft)
   - Aluminum fascia cover agregado: **$1.92/LF** (Menards FAS-01, 12ft piece)
   - F-Channel soffit support agregado: **$1.44/LF** (Menards ACC-03B, 12ft piece)
   - 5" K-style aluminum gutter material: **$1.50/LF** (gutter LF = labor + material)
   - Joist hangers: LUS26 **$1.80/ea**, LUS28 **$2.60/ea** (auto-derived de rafter count)
   - Fascia LF = wood board $2.80 + aluminum cover $1.92 (auto-stacked)
   - Soffit LF = panel $2.75 + F-channel $1.44 (auto-stacked)
   - RATE_FIELD_IDS, computeRepairExtras() actualizados — braces 492/492 ✅

---

### ✅ COMPLETADO SPRINT 2026-08-16 — SM Pipeline + Estrategia 4 Pilares

| Tarea | Estado | Notas |
|---|---|---|
| Marco RETIRADO (no reactivar) | ✅ | Reemplazado por `social_media.mjs` desde 2026-06-03 |
| SureRank meta keys fix | ✅ DONE | escriba.mjs:281-283 ya usa `_surerank_*`. HANDOFF_SURERANK marcado RESOLVED |
| Publisher bug corregido | ✅ DONE CC | Rate limiter negativo + slot collision — 13 posts `Error` → `Visual Listo` |
| Analitico activado | ✅ | Corre daily 06:00 UTC, 11 campos activos, lee engagement de Meta API |
| Publisher cadence upgrade | ✅ CC done | Martes/Viernes → diario (pendiente verificar en crontab) |
| director_v2 desbloqueado | ✅ | Primera Reel de Geo a las 22:00 UTC 2026-08-16 |
| 7 posts nuevos en Airtable | ✅ | recvXXX…×7 en Status: Idea |
| HANDOFF_CC_SESSION_BRIEF_2026-08-08 | ✅ OBSOLETE | Tasks 1-4 eran incorrectas — marcado en archivo |
| DECISION_NOVA_GBP_AGENT.md | ✅ CREADO | Requiere decisión de Jorge (checkbox vacío) |
| **10 posts reescritos (F1)** | ✅ COWORK | Ver POSTS_REESCRITOS_10_CW.md — CC actualiza Caption + corre Oráculo |
| **30 seeds generador (F2)** | ✅ COWORK | Ver SEEDS_GENERADOR_30_ANGULOS.md — CC inyecta en sistema prompt de creativo |
| F3 — Umbrales engagement | ⏳ ESPERAR | Necesita 48h de datos de analitico (desde hoy 06:00 UTC) |
| F4 — Decisión Nova | ⏳ JORGE | DECISION_NOVA_GBP_AGENT.md — Jorge llena checkbox |

---

### ⏳ PENDIENTE — PRÓXIMAS ACCIONES

| Prioridad | Tarea | Responsable | Estado |
|---|---|---|---|
| 🔴 CC #1 | **Construir meta_ads.mjs** — crear 2 campañas en PAUSED + 6 ads | CC | Ver HANDOFF_CC_META_ADS_AGENT.md |
| 🔴 CC #2 | **Actualizar Caption de 10 posts** con textos de POSTS_REESCRITOS_10_CW.md | CC | Entregado por Cowork 2026-08-16 |
| 🔴 CC #3 | **Correr Oráculo** sobre los 10 posts reescritos (no asignar score manual) | CC | Después de CC #2 |
| 🔴 CC #4 | **Inyectar 30 seeds** en system prompt de `creativo` / `director_v2` | CC | Ver SEEDS_GENERADOR_30_ANGULOS.md |
| 🔴 CC #5 | Verificar publisher cadence daily en crontab (fue Tue/Fri) | CC | — |
| 🟡 JORGE | **Activar campañas** en Meta Ads Manager después de que CC cree los ads | Jorge | Después de CC #1 |
| 🔴 CC #6 | **SMS Review Request agent** — build review_request.mjs + crear campo en Airtable | CC | Ver HANDOFF_CC_REVIEW_REQUEST_AGENT.md — 3 clientes elegibles identificados |
| 🟡 JORGE | Revisar GBP quota case #5-5881000041235 y llenar checkbox en DECISION_NOVA | Jorge | — |
| 🟡 JORGE | **Make Review Request** — Escenario ID 5893163 INACTIVO | Jorge | Activar + cambiar FROM phone |
| 🟡 JORGE | Re-autorizar Airtable OAuth en Make.com (expiró 2026-07-05) | Jorge | — |
| 🟡 DESPUÉS | F3 — actualizar tabla de umbrales en audit_scoring.mjs | Cowork | 48h después de 2026-08-16 |
| 🟡 CC | Atlas Loop 2 — LLM propone playbooks + aprobación Telegram | CC | Ver HANDOFF_ATLAS_LOOP2.md |
| 🟡 CC | 3 Atlas playbooks (review_schema_missing, alt_text_generic, gbp_place_id_tbd) | CC | Ver HANDOFF_ATLAS_PLAYBOOKS.md |
| 🟡 CC | Foreman cache-bust fix (SEO score 58→75+) | CC | Ver HANDOFF_FOREMAN_SEO_FIX.md |
| 🟡 CC | Airtable r.ok handling en todos los agentes | CC | Ver HANDOFF_CC_SOCIAL_MEDIA_100PCT.md T4 |
| 🟡 CC | Topic diversity en publisher (evitar 4 posts iguales seguidos) | CC | Ver HANDOFF_CC_SOCIAL_MEDIA_100PCT.md T3 |
| 🟡 JORGE | Submitir sitemap a Google Search Console | Jorge | Pendiente |
| 🟡 JORGE | Iniciar A2P 10DLC brand registration en Telnyx | Jorge | Para Fer externo |
| 🟡 DESPUÉS | Kai (Lead Scorer) | Cowork | Sprint +1 |
| 🟡 DESPUÉS | Fer (SMS Receptionist) | Cowork | Requiere A2P |
| 🟠 FUTURO | 30 páginas SEO EN para investoros.tech | Cowork | — |
| 🟠 FUTURO | /pricing route + Stripe checkout | Claude Code | Fase 2 |

---

### 📌 CONTEXTO SM PIPELINE (estado al 2026-08-16)

```
Agentes activos en VPS /opt/alex-bot/:
  oraculo          — Stage 1: Idea → Oraculo OK (dynamic threshold P25, floor 7, ceil 9) — ACTUAL: 8
  creativo         — Stage 2: Oraculo OK → Visual Listo (genera visual con FLUX/Pexels)
  social_media.mjs — Stage 3: Visual Listo → Publicado (publisher principal)
  director_v2      — Reels (desbloqueado 2026-08-16 22:00 UTC)
  analitico        — Métricas diarias 06:00 UTC (activado 2026-08-16)

Publisher cadence: daily (era Tue/Fri — actualizado por CC)
  FB: 10:00 UTC | IG: 11:00 UTC
  FB Page: 723873447473999 | IG: 17841475418377793

Distribución de contenido (confirmada por Jorge 2026-08-16):
  40% Deck-Build | 30% Home-Renovation | 15% Bathroom-Remodel | 15% General-Construction

Airtable Posts: appAQpveuAec077jF / tblBbSbpzzANl74y0
Status pipeline: Idea → Oraculo OK → Visual Listo → Programado → Publicado / Error
```

---

### ⏳ PENDIENTE — HISTÓRICAS (no borrar — referencias)

| Tarea | Estado | Notas |
|---|---|---|
| GBP Place ID → geo-carpentry.json | ✅ DONE | `ChIJ49c5Tlf7S4QRbXXNI1H0EvQ` |
| Eli (Escriba) ACTIVE | ✅ | cron Tue/Fri 10am UTC |
| 301 redirects 7 pares | ✅ DONE | WPCode snippet 2989 LIVE |
| CSS entry-content WP | ✅ DONE | headings naranja, listas ✓ |
| Meta App "Geo Carpentry Social" | ✅ | App ID: 3291485027720361 |
| FB Page Token permanente | ✅ | 26 permisos |
| InvestorOS Landing v2 LIVE | ✅ | commit 7f79c34 investoros.tech |
| 30 páginas SEO en WordPress | ✅ | LIVE |
| GEO Agent SMS | ✅ LIVE | geocarpentry.com/tools/geo_agent.php |
| Rotar WP App Password | 🟡 DEFERRED | Hacer cuando todo esté listo |

---

## 🗺️ ARQUITECTURA DEL SISTEMA

```
geocarpentry.com (Hostinger + WordPress)
     ↑ páginas SEO draft → publish
     
investoros-web.vercel.app/geo (Next.js dashboard)
     → /api/agents/[name]/trigger
     → POST VPS:3003/trigger (HMAC signed) ← CORRECTO — docker-proxy ocupa 3001
     
VPS 187.77.215.146
     ├─ /opt/alex-bot/  (agentes: analitico, audit_meta, rastreador, oraculo, reescritor — REFACTORIZADOS con TenantConfig)
     │    └─ agents/tenants/ (geo-carpentry.json, pinnacle.json, geo-carpentry_persona.md, pinnacle_persona.md, _template_persona.md)
     ├─ /opt/geo-webhook/ (LIVE en puerto 3003 — WEBHOOK_SECRET=c30b4c5a... — pendiente alinear Vercel)
     └─ cron: agentes corren automáticamente
     
geocarpentry.com/tools/ (Hostinger — GEO Agent SMS)
     ├─ geo_agent.php        ← webhook SMS principal (LIVE)
     ├─ geo_seguimiento.php  ← follow-ups automáticos (cron c/hora)
     ├─ geo_morning_brief.php← Telegram digest (cron 7:30AM lun-vie)
     ├─ config.php           ← credenciales (NO en git)
     └─ lib/                 ← geo_claude, geo_airtable, geo_sms, geo_telegram, etc.

Airtable appAQpveuAec077jF
     ├─ Content_Queue (tblpiN42pK3YFxGEW) — 30 records SEO
     ├─ Geo_Leads (tblaH41HWeVG9ZXLn) — leads SMS del GEO Agent
     ├─ Geo_Conversations (tblxAQheLfKBKShum) — historial conversaciones
     ├─ SEO_Audits — datos de rastreador
     ├─ Marketing_Audits — datos de mercader
     └─ Decisions_Log (tbluHpgWlVNqSveVi) — decisiones estratégicas
```

---

## 📋 LAS 30 PÁGINAS SEO

**Patrón URL:** `/{service_slug}/{city_slug}-wi/`

| Servicios | Ciudades |
|---|---|
| kitchen-remodeling | green-bay, appleton, oshkosh, de-pere, howard |
| bathroom-remodeling | green-bay, appleton, oshkosh, de-pere, howard |
| deck-building | green-bay, appleton, oshkosh, de-pere, howard |
| finish-carpentry | green-bay, appleton, oshkosh, de-pere, howard |
| home-renovation | green-bay, appleton, oshkosh, de-pere, howard |
| general-construction | green-bay, appleton, oshkosh, de-pere, howard |

**Estructura de cada página:** H1 ciudad-servicio → intro local → sección 2 materiales → sección 3 proceso → sección 4 costos → sección 5 permisos → sección 6 testimonio → FAQ (3 Q) → CTA → schema @graph

---

## 🤖 INVENTARIO COMPLETO — 27 AGENTES INVESTOROS
> ⚠️ NOMBRES ACTUALIZADOS — Los agentes fueron renombrados de español a inglés (Mayo 2026)
> Imágenes: `public/investoros-agents/agent-NAME.png` (27 PNG 800×800 en repo)

### 🟢 PRODUCCIÓN (12) — borde verde #22c55e
| Nombre | Archivo PNG | Rol |
|---|---|---|
| Fer | agent-fer.png | AI Lead Receptionist · SMS bilingual · PHP/Hostinger |
| Tracy | agent-tracy.png | Skip Tracer · owner lookup · Tracerfy API |
| Marco | agent-marco.png | Social Media Manager · Meta Graph API · bilingual |
| Sofia | agent-sofia.png | Visual Creator · HTML→PNG · Cloudinary |
| Leo | agent-leo.png | Video Director · Reels 15s · FFmpeg · HeyGen |
| Max | agent-max.png | Quality Gate · brand compliance · anti-waste |
| Nina | agent-nina.png | Content Optimizer · AI learning loop · rewrites |
| Sage | agent-sage.png | Analytics · FB+IG engagement · performance tiers |
| Rex | agent-rex.png | SEO Monitor · geo-grid · CWV · 7 motores |
| Ava | agent-ava.png | UX Optimizer · conversion audit · LCP · mobile |
| Echo | agent-echo.png | Meta Auditor · FB+IG account health (on-demand) |
| Zed | agent-zed.png | Dev Ops · Telegram→GitHub · Python on VPS |

### 🟡 CODE-COMPLETE / AWAITING DEPLOY (12) — borde ámbar #f59e0b
| Nombre | Archivo PNG | Rol |
|---|---|---|
| Eli | agent-eli.png | SEO Content Writer · city pages · bilingual |
| Chase | agent-chase.png | Paid Ads Auditor · Google/Meta/TikTok |
| Nova | agent-nova.png | GBP Manager · posts/reviews/photos (OAuth pending) |
| Kai | agent-kai.png | Lead Scorer · 0-100 · Hot/Warm/Cold routing |
| Luca | agent-luca.png | LinkedIn B2B · ICP targeting (disabled Geo) |
| Remi | agent-remi.png | Community Manager · Reddit r/HomeImprovement |
| Scout | agent-scout.png | Web Scraper · foreclosures · probate · FSBO |
| Atlas | agent-atlas.png | Executive Brief · Monday 7am · 8 agents unified |
| Orion | agent-orion.png | System Watchdog · self-repair · evolves weekly |
| Viper | agent-viper.png | Sales Closer · competitor watchdog · price diffs |
| Ember | agent-ember.png | Onboarding · email marketing · SMTP · SPF/DKIM |
| Flynn | agent-flynn.png | Automation Builder · workflows · Make.com |

### 🔵 PLANNED (3) — borde índigo #6366f1
| Nombre | Archivo PNG | Rol |
|---|---|---|
| Carto | agent-carto.png | Territory Mapping · geo coverage |
| Ward | agent-ward.png | Compliance & Risk · TCPA/CAN-SPAM/ADA |
| Penny | agent-penny.png | Financial Intelligence · Stripe · billing |

---

## 📌 INFORMACIÓN DEL NEGOCIO

```
Geo Carpentry LLC (General Contractor)
735 E Walnut St Suite 3, Green Bay, WI 54301
Phone: (920) 367-1272
Email: admin@geocarpentry.com
Website: https://geocarpentry.com
Founded: 2014
Type: S-Corp, Latino-owned, Licensed & Insured
Rating: 5.0 stars

Services & Price Ranges:
  Kitchen Remodeling: $5k-$30k
  Bathroom Remodeling: $3k-$15k
  Deck Building: $2k-$12k
  Home Renovation: $5k-$50k
  Finish Carpentry: $500-$8k
  General Construction: $3k-$100k

Service Area: Green Bay, Howard, De Pere, Allouez, Bellevue, Suamico,
  Ashwaubenon, Appleton, Oshkosh, Sheboygan, Manitowoc, Fond du Lac, Wausau

Social:
  Facebook: https://www.facebook.com/profile.php?id=61578160947198
  Instagram: https://www.instagram.com/geocarpentryllc2026
```
