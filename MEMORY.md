# MEMORY INDEX — Jorge Cruz / Geo Carpentry LLC
> Auto-mantenido por skill `geo-memory`. Última actualización: 2026-08-05 — **GeoBudget Build v2 COMPLETO** 🎉. PRICES 100% auditados Menards (41 entradas, Green Bay East, 2026-08-05). computeAll() con todos los materiales para los 3 sistemas. Pendiente: Task #11 GeoBudget Remodel contract modal.

---

## 🗂️ ARCHIVOS DE MEMORIA

### Geo Carpentry / Investoros (root — geo-memory los lee directamente)
- [GEO_CARPENTRY_CURRENT.md](GEO_CARPENTRY_CURRENT.md) — Estado actual del proyecto, sprint activo, próximas acciones
- [GEO_CARPENTRY_TECH.md](GEO_CARPENTRY_TECH.md) — Stack técnico completo: Airtable, VPS, WordPress, Dashboard
- [GEO_CARPENTRY_DECISIONS.md](GEO_CARPENTRY_DECISIONS.md) — Decisiones estratégicas registradas con fecha y rationale
- [GEO_CARPENTRY_RULES.md](GEO_CARPENTRY_RULES.md) — Reglas de seguridad y restricciones que NUNCA se violan

### Pinnacle Holdings Group (Tenant 2)
- [PINNACLE_FER_CURRENT.md](PINNACLE_FER_CURRENT.md) — Agente FER: arquitectura, archivos, status, integración SaaS

### Memoria compartida con Claude Code (NEW 2026-07-30)
- [CLAUDE_MD_SNIPPET.md](CLAUDE_MD_SNIPPET.md) — Bloque listo para pegar en el `CLAUDE.md` del repo `investoros-web`, para que Claude Code lea esta misma memoria automáticamente al iniciar sesión. **Pendiente: Jorge debe pegarlo en el repo.**

### GeoBudget Apps (herramientas de cotización — portafolio PWA)
> ⚠️ REGLA CRÍTICA: Contractor Packages = Labor + Demo + Overhead (precio que el cliente aprueba = precio del contrato). NUNCA mostrar labor+demo sin overhead.
- [geobudget-remodel.md](geobudget-remodel.md) — **COMPLETO** (2026-07-29). Calculadora interior: paredes (demo+new), pisos, 3 paquetes acabado, 5 reportes. `contractorTotal()` con overhead ✅ (2026-08-05)
- [geobudget-siding.md](geobudget-siding.md) — Calculadora de siding. v2 Pro, 11 combos, Labor Only contract type ✅, Contractor Packages con overhead ✅, `buildComboIncludesList()` dinámico ✅ (2026-08-05). Pendiente: boardTransition/pictureFrame $0.00
- **GeoBudget Roofing** — budget/roofing/ — `contractorLaborTotal()` con overhead ✅ (2026-08-05). No documentado aún.
- **GeoBudget Deck** — budget/deck/ — `contractorTotal()` con overhead ✅ (2026-08-05). No documentado aún.
- **GeoBudget Build** ✅ v2 COMPLETO 2026-08-05 — `budget/build/index.html`. 3 sistemas: Stick Frame / Ladder Frame / Post Frame (Pole Barn). PRICES 41 entradas Menards Green Bay East confirmadas (audit 2026-08-05): 2×4×16' $8.83, 2×6×16' $13.86, 2×8×16' $16.87, 2×6 PT $19.78, LVL $83.99, OSB 7/16" $11.28, OSB 5/8" $16.98, anchor bolt $1.70, Atlas Pinnacle shingles $40.99, R-19 batt $0.74/sqft, R-19 PF $1.33/sqft, R-30 $1.13/sqft, foam closures $1.50, panel screws $0.09, lag screws 3/8"×5" $0.57, concrete $6.44/bag, sonotube $10.88, service door $285, window $145.61, hurricane ties $1.35, joist hanger $1.99, post base $17.87, house wrap $148.29/1125sqft, seam tape $14.65. computeAll() completo: todos los materiales para los 3 sistemas incluyendo tornillos, clavos, grapas, espuma, anclas, concreto, sonotubo, puertas, ventanas. Contract modal: 10 secciones legales WI. 3 Contractor Package cards. Syntax OK ✅. Pendiente subir a geocarpentry.com (Jorge sube manualmente).

---

## 📁 SUBCARPETAS (InvestorOS SaaS)

### 01_legal/
- [investoros_privacy_policy.md](01_legal/investoros_privacy_policy.md) — Privacy Policy completa para investoros.tech/privacy
- [investoros_terms_of_service.md](01_legal/investoros_terms_of_service.md) — Terms of Service para investoros.tech/terms

### 02_handoffs/
- [HANDOFF_CW_CC.md](02_handoffs/HANDOFF_CW_CC.md) — División de trabajo Cowork ↔ Claude Code, entregables, checklist
- [HANDOFF_LEAD_CAPTURE.md](02_handoffs/HANDOFF_LEAD_CAPTURE.md) — Track 1: OttoKit form → /api/leads/intake → Airtable + Telegram

### 03_scripts/
- [provision_telnyx.mjs](03_scripts/provision_telnyx.mjs) — Provisionar número Telnyx para nuevo tenant
- [provision_airtable_base.mjs](03_scripts/provision_airtable_base.mjs) — Clonar base Airtable template para nuevo tenant
- [provision_hostinger_email.mjs](03_scripts/provision_hostinger_email.mjs) — Crear email business en Hostinger
- [geo-webhook-service.mjs](03_scripts/geo-webhook-service.mjs) — Server webhook VPS (puerto 3001) — deploy en /opt/geo-webhook/
- [geo-webhook.service](03_scripts/geo-webhook.service) — systemd unit file — deploy en /etc/systemd/system/
- [geo_agent_v2.php](03_scripts/geo_agent_v2.php) — **GEO SMS Agent main webhook** — deploy: geocarpentry.com/tools/geo_agent.php
- [geo_claude_v2.php](03_scripts/geo_claude_v2.php) — Claude prompt v2 (14 campos, pide nombre) — deploy: tools/lib/geo_claude.php
- [geo_seguimiento_v2.php](03_scripts/geo_seguimiento_v2.php) — Follow-up cron v2 (business hours + dedup) — deploy: tools/geo_seguimiento.php

### 04_tenant-configs/
- [geo-carpentry_persona.md](04_tenant-configs/geo-carpentry_persona.md) — Perfil completo de Geo Carpentry LLC (Tenant 0)
- [_template_persona.md](04_tenant-configs/_template_persona.md) — Template para onboarding de nuevos tenants
- geo-carpentry_persona.md → también en VPS: `/opt/alex-bot/agents/tenants/geo-carpentry_persona.md` ✅
- pinnacle_persona.md → también en VPS: `/opt/alex-bot/agents/tenants/pinnacle_persona.md` ✅

### 05_integrations/
- [meta-app-review-docs.md](05_integrations/meta-app-review-docs.md) — Guía completa Meta App Review (pasos, copy exacto, timeline)

### 05_seo-content/ (NEW 2026-05-29)
- [investoros_es_pages.md](05_seo-content/investoros_es_pages.md) — 30 páginas SEO en español para /es/[slug] en investoros.tech
- [sitemap_robots_spec.md](05_seo-content/sitemap_robots_spec.md) — sitemap.ts + robots.txt + hreflang + OG image spec para CC

### 99_archive/
- [Geo_Carpentry_Memory_Strategy.md](99_archive/Geo_Carpentry_Memory_Strategy.md) — Plan original B2C Marzo 2026 (histórico, superseded)

---

## ⚡ ESTADO RÁPIDO (al 2026-06-04)

### 🤖 GEO SMS AGENT — UBICACIÓN PERMANENTE
> **NUNCA más buscar esto** — está en Hostinger WordPress de geocarpentry.com
```
Webhook principal:  geocarpentry.com/tools/geo_agent.php       ← recibe OpenPhone SMS
Claude prompt:      geocarpentry.com/tools/lib/geo_claude.php  ← lógica IA + 14 campos
Follow-up cron:     geocarpentry.com/tools/geo_seguimiento.php ← reminders y nurture
Morning brief:      geocarpentry.com/tools/geo_morning_brief.php ← resumen 7:30am
Config:             geocarpentry.com/tools/config.php           ← API keys
Cron schedule:      0,30 * * * * (cada 30 min, guard interno 8am-6pm CT)
Conversaciones:     geocarpentry.com/tools/geo_conversations/   ← JSON por teléfono
```
**Airtable tables usadas:**
- Geo_Leads: `tblaH41HWeVG9ZXLn` — un record por teléfono
- Geo_Conversations: `tblxAQheLfKBKShum` — audit trail

**Fixes aplicados 2026-06-04:**
- v2 pide nombre en mensaje 1-2, guarda Full Name desde Claude
- Business hours guard: Mon-Fri 8am-6pm CT solamente
- Reminders de cita: solo 24h antes + 1h antes (no spam diario)
- Follow-ups: 48h → 5 días → 10 días máximo (era cada hora)
- Bug dedup fixed: patrón `appt_Xh_sent_YYYY-MM-DD` en Notes

---

| Área | Estado | Próxima acción |
|---|---|---|
| 30 páginas SEO Geo Carpentry | ✅ Publicadas en WordPress | — |
| Dashboard /geo | ✅ Live en Vercel | — |
| Landing IOS v2 | ✅ **LIVE** | — |
| investoros.tech | ✅ Live + Privacy/Terms | — |
| VPS AGENT_MAP | ✅ **21 agentes** en router.mjs | — |
| geo-webhook.service | ✅ LIVE puerto 3003 | — |
| Eli (Escriba) | ✅ Cron Mar/Vie 10:00 UTC, publica a geocarpentry.com | — |
| WP App Password | ✅ En /opt/alex-bot/.env | — |
| **GEO SMS Agent** | ✅ **v2 LIVE** — spam nocturno FIXED — pide nombre | Ver ubicación arriba |
| Nova (GBP Manager) | 🟡 nova.mjs deployado — quota GCP pendiente | Place ID ✅ ChIJ49c5Tlf7S4QRbXXNI1H0EvQ — esperar quota Case 5-5881000041235 |
| Track 1: Lead Capture | 🟡 HANDOFF listo para CC | CC implementa /api/leads/intake + /geo/leads dashboard |
| FER Agent (Pinnacle) | 🔴 Kill-switch activo | Jorge: A2P 10DLC Telnyx |
| Meta App Review | 🟡 Docs listos | Jorge: crear app en Pinnacle BM |
| **SM Pipeline** | ✅ Funcionando — 4 posts aprobados 9-Jun (scores 8-9) | CC: activar Marco cron — 9 posts "Visual Listo" esperando |
| **301 Redirects** | ✅ WPCode snippet 2989 LIVE — 7 pares flat→jerárquico | — |
| **Geo_Lessons** | ✅ Fix Pinnacle persona contaminación — General Contractor correcto | — |
| **5 handoffs CC** | ✅ En 02_handoffs/ — agents_patch, atlas_playbooks, foreman_fix, atlas_loop2 | CC procesa en orden de prioridad |
| **Marco (social_media)** | 🔴 Cron silenciado — activar es #1 CC priority | 9+ posts Visual Listo listos para publicar |
| **GEO Agent v3 (pausa manual)** | ✅ Subido a Hostinger por Jorge 2026-07-30 | — |
| **GEO Agent v4 (smart scheduling)** | 🟡 Código listo — geo_agent_v4.php + geo_claude_v3.php en 03_scripts/ — restringe citas a Lun/Mié/Jue 4-6pm + evita doble-booking | Jorge: subir ambos archivos a Hostinger (reemplazan geo_agent.php y lib/geo_claude.php) |
| **Cal (agente calendario VPS)** | ✅ Desplegado 2026-07-31 — `/opt/alex-bot/agents/cal/cal.mjs`, cron 3x/día (8am, 2:45pm, 3:45pm) | Esperando reset de cuota Airtable para primera sync real |
| **Airtable plan límite** | 🟡 Causa raíz encontrada: cron `geo_seguimiento` cada 30min = ~868 calls/mes de 1000 cuota. Jorge cambió a 3x/día (8am, 2:45pm, 3:45pm) 2026-07-30 — SIN subir de plan | Esperar reset de cuota mensual, monitorear Usage la próxima semana |
| **Pinnacle crons zombie** | ✅ Los 5 (el_polling + 4x fer_*) borrados por Jorge 2026-07-30 | — |
| **Memoria compartida CC** | 🟡 CLAUDE_MD_SNIPPET.md listo | Jorge: pegarlo en CLAUDE.md del repo investoros-web |

---

## 👤 PERFIL DE JORGE

- **Email seguro:** admin@geocarpentry.com (NUNCA geocarpentryllc@gmail.com para notificaciones)
- **Estilo:** Visual primero — siempre usar widgets/diagramas antes que texto
- **Nivel técnico:** Intermedio — entiende conceptos, delega implementación
- **Idioma:** Español para comunicación, inglés para código/documentos técnicos
- **Decisiones:** Siempre pedir confirmación antes de cambios en producción
- **Empresa:** Geo Carpentry LLC (General Contractor) + Pinnacle Holdings Group (real estate wholesale, Tenant 2 SaaS) + FC Multiservices LLC + Health & Wellness Hub

---

## 🔑 CREDENCIALES CONOCIDAS (referencia, no exponer)

- Airtable Base: `appAQpveuAec077jF`
- Airtable Table Content_Queue: `tblpiN42pK3YFxGEW`
- Airtable Geo_Leads: `tblaH41HWeVG9ZXLn`
- Airtable Geo_Conversations: `tblxAQheLfKBKShum`
- VPS: `root@187.77.215.146`
- WordPress SSH: `u433637438@srv1067.hstgr.io` (puerto 65002)
- WP Document Root: `/home/u433637438/domains/geocarpentry.com/public_html`
- GEO SMS Agent root: `/home/u433637438/domains/geocarpentry.com/public_html/tools/`
- Vercel Dashboard: `https://investoros-web.vercel.app/geo`
- Nova GCP quota case: `2-0696000040942` (My Business Account Management API)

