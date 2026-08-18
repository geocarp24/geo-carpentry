# PINNACLE HOLDINGS GROUP — AGENTE FER
> Creado: 2026-05-27 | Tenant 2 del SaaS Investoros

---

## 🎯 QUÉ ES FER

**FER AI AGENT v5** — Agente SMS para Pinnacle Holdings Group (real estate wholesaling).
Recibe webhook de Quo (OpenPhone) → deduplica → busca/crea lead en Airtable → 
carga historial de conversación → genera respuesta Claude → envía SMS → 
escala a Telegram si lead caliente.

**Status actual:** 🔴 Kill-switch activado desde 2026-05-11
**Razón:** Quiet period — Quo carrier failure + Telnyx setup en progreso

---

## 📍 ENDPOINTS & RUTAS

| Ambiente | Detalle |
|---|---|
| Production URL | https://pinnaclegroupwi.com/Tools/fer_agent.php |
| GitHub Repo | geocarp24/pinnacle-holdings-group |
| Branch activo | `reorg/cleanup-monorepo` |
| GitHub URL base | https://github.com/geocarp24/pinnacle-holdings-group/tree/reorg/cleanup-monorepo/hostinger/tools |
| Local (Jorge) | `c:\Users\Admin\OneDrive\Documents\Claude for real estate\hostinger\tools\` |

---

## 📂 ARCHIVOS CRÍTICOS

### Endpoints PHP (hostinger/tools/)

| Archivo | Tamaño | Propósito |
|---|---|---|
| fer_agent.php | 24 KB | **Entry point** — Quo webhook receiver. Dedup + Airtable + Claude + SMS + Telegram + CRM |
| fer_first_contact.php | 14 KB | First-touch flow para new leads |
| fer_seguimiento.php | 19 KB | Follow-up sequence orchestrator |
| fer_morning_brief.php | 7 KB | Daily morning brief para Jorge |
| fer_review_request.php | 9 KB | Post-closing review request |
| fer_stale_cron.php | 3 KB | Cron job para leads stale |
| fer_diag.php | 3 KB | Diagnostic endpoint |

### Library (hostinger/tools/lib/)

| Archivo | Tamaño | Propósito |
|---|---|---|
| fer_claude.php | 22 KB | Claude API wrapper, prompt building, response handling |
| fer_airtable.php | 9 KB | Airtable CRUD (leads, contacts, activities) |
| fer_conversations.php | 3 KB | Conversation memory (per-phone history) |
| fer_datastore.php | 5 KB | Key-value persistence layer |
| fer_deduplication.php | 2 KB | Lead dedup by phone (fallback address) |
| fer_quo.php | 2 KB | Quo SMS send |
| fer_telegram.php | 4 KB | Telegram escalation para hot leads |
| fer_logger.php | 2 KB | Structured logging |

### Config & Tests
- `hostinger/tools/config.php` — env vars + secrets
- `hostinger/tools/tests/test_fer_dryrun.php` — dry-run smoke test

---

## 🔄 FLUJO DEL AGENTE

```
SMS entrante (Quo/OpenPhone)
     ↓
fer_agent.php (webhook receiver)
     ↓
fer_deduplication.php — ¿lead nuevo o existente?
     ↓
fer_airtable.php — lookup/upsert lead en Airtable Pinnacle
     ↓
fer_conversations.php + fer_datastore.php — cargar historial
     ↓
fer_claude.php — construir prompt + llamar Claude API
     ↓
fer_quo.php — enviar SMS respuesta
     ↓ (si hot lead)
fer_telegram.php — escalación a Jorge vía Telegram
     ↓
fer_airtable.php — CRM update (lead status, activities)
     ↓
fer_logger.php — log structured
```

---

## 📱 INTEGRACIÓN SMS

**Proveedor actual:** Quo (OpenPhone) — webhook receiver
**Proveedor en migración:** Telnyx (setup en progreso desde 2026-05-11)
**Razón migración:** Quo carrier failure durante quiet period

---

## 🔗 RELACIÓN CON SAAS INVESTOROS

Pinnacle es el **Tenant 2** del SaaS multi-tenant Investoros.
- Tenant 1 (piloto): Geo Carpentry (`geo-carpentry`)
- Tenant 2: Pinnacle Holdings Group (`pinnacle`)

En el sistema de agentes VPS, FER se mapeará como:
```javascript
// AGENT_MAP en router.mjs
fer: "agents/fer/fer.mjs"  // a implementar en Fase 2+
```

Actualmente FER corre independiente en Hostinger PHP.
Integración futura: trigger desde dashboard Investoros `/t/pinnacle/agents`.

---

## ⏳ ESTADO & PRÓXIMAS ACCIONES

| Tarea | Estado | Responsable |
|---|---|---|
| Kill-switch desactivar | ⏳ Cuando Telnyx esté listo | Jorge |
| Telnyx setup completar | ⏳ En progreso | Jorge |
| Migrar FER de Quo → Telnyx | 🔜 Después Telnyx | Claude Code |
| Integrar FER en dashboard Investoros | 🔮 Fase 2+ | Claude Code |
| Tenant switcher Pinnacle/Geo | 🔮 Fase 2 | Claude Code |
