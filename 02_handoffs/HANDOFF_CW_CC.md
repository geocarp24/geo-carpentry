# HANDOFF — Cowork (CW) ↔ Claude Code (CC)
> Investoros SaaS · Multi-tenant "Full Service Fast"
> Generado por: Cowork · Fecha: 2026-05-28
> Propósito: Dividir trabajo sin duplicar. CC hace la web app + DB. CW hace VPS + agentes + scripts + contenido legal.

---

## 🗺️ DIVISIÓN CLARA DE RESPONSABILIDADES

### Claude Code (CC) es dueño de:
- `apps/investoros/` — toda la web app Next.js
- `prisma/schema.prisma` — DB schema, migraciones
- `src/lib/credentials.ts` — vault encryption (AES-256-GCM)
- `src/lib/airtable.ts` — migrar getToken() a aceptar tenantSlug
- `src/app/api/agents/[name]/trigger/route.ts` — tenant validation
- `src/app/(dashboard)/[tenant]/page.tsx` — dynamic route
- `src/app/onboard/` — wizard 5 pasos (NUEVO)
- `src/app/settings/connections/` — UI integraciones (NUEVO)
- `src/app/privacy/page.tsx` — ruta /privacy (CW entrega el contenido)
- `src/app/terms/page.tsx` — ruta /terms (CW entrega el contenido)
- Postgres provisioning (Supabase o Neon)
- Deploy y CI/CD en Vercel

### Cowork (CW) es dueño de:
- `agents/` — refactoring de agentes en VPS (ver lista abajo)
- `scripts/provision_*.mjs` — scripts de provisionamiento (NUEVOS)
- `agents/tenants/*_persona.md` — persona files por tenant
- `/etc/systemd/system/geo-webhook.service` — VPS webhook service
- `/opt/alex-bot/` — cron jobs y configuración en VPS
- Contenido legal: Privacy Policy + ToS (entrego markdown a CC)
- Meta App Review: documentación + submission
- A2P 10DLC: brand + campaign registration
- SEO paralelo: 30 páginas ES, sitemap, robots.txt, OG image spec

---

## 📋 ENTREGABLES CW → CC (con formato)

### Entregable 1 — Privacy Policy y Terms of Service
**Cuándo:** Antes de que CC cree las rutas /privacy y /terms
**Formato:** Dos archivos .md listos para copy-paste en pages
**Destino CC:** `src/app/privacy/page.tsx` y `src/app/terms/page.tsx`
**Por qué urgente:** Meta App Review no inicia sin estas URLs live

### Entregable 2 — Agentes refactorizados (5 archivos)
**Cuándo:** Simultáneo a Fase A de CC (no bloquea Fase A, sí bloquea Fase B)
**Archivos que CW modifica — CC NO tocar:**
```
agents/analitico/analitico.mjs      → remove: FB_PAGE_ID=965320503341457
agents/audit_meta/audit_meta.mjs    → remove: FB_PAGE_ID hardcode  
agents/rastreador/rastreador.mjs    → remove: AIRTABLE_TOKEN hardcode
agents/oraculo/oraculo.mjs          → persona file → tenant-specific
agents/reescritor/reescritor.mjs    → persona file → tenant-specific
```
**Patrón de refactor:**
```javascript
// ANTES (hardcoded)
const FB_PAGE_ID = "965320503341457";

// DESPUÉS (tenant-aware)
import { loadTenantConfig } from '../tenants/loader.mjs';
const config = await loadTenantConfig(process.env.TENANT_SLUG || 'geo-carpentry');
const FB_PAGE_ID = config.social.facebook_page_id;
```
**Dependencia de CC:** Necesito que CC confirme la estructura exacta del tenant_config
que viene del vault — para saber qué keys leer. Ver sección "Lo que CW necesita de CC".

### Entregable 3 — Scripts de provisionamiento
**Cuándo:** Fase C (semana 3), después de que CC tenga el vault funcionando
**Archivos NUEVOS que CW escribe:**
```
scripts/provision_telnyx.mjs          → llama Telnyx API, compra número, configura 10DLC
scripts/provision_hostinger_email.mjs  → SSH a Hostinger, crea buzón admin@cliente.com
scripts/provision_airtable_base.mjs    → clona template base, asigna tenantId
```
**Interface que estos scripts exponen (para que CC los llame desde el wizard):**
```javascript
// Todos retornan: { success: boolean, data: {...}, error?: string }

// provision_telnyx.mjs
await provisionTelnyxNumber({ tenantSlug, areaCode, businessName })
// retorna: { phoneNumber: "+19205551234", telnyxNumberId: "...", campaignId: "..." }

// provision_hostinger_email.mjs
await provisionHostingerEmail({ tenantSlug, domain, emailPrefix: "admin" })
// retorna: { email: "admin@cliente.com", smtpHost, smtpPort, password }

// provision_airtable_base.mjs
await provisionAirtableBase({ tenantSlug, templateBaseId: "appAQpveuAec077jF" })
// retorna: { baseId: "appXXXXXX", baseUrl: "https://airtable.com/appXXX" }
```
**Cómo CC los invoca desde el onboarding wizard:**
```typescript
// En src/app/api/onboard/provision/route.ts (CC crea esto)
import { execFile } from 'child_process';
// O mejor: importar como módulos si CC convierte a TypeScript
const result = await fetch('/api/onboard/provision', {
  body: JSON.stringify({ service: 'telnyx', tenantSlug, areaCode })
});
```
**Alternativa más limpia:** CC puede crear un API route `/api/provision/[service]`
que llame internamente a los scripts. CW entrega los scripts como módulos .mjs,
CC los wrappea en el API route.

### Entregable 4 — geo-webhook.service (VPS)
**Cuándo:** Fase C (semana 3), debe estar UP antes de que CC pruebe el trigger route
**Qué expone:**
```
POST http://187.77.215.146:3001/trigger
Headers: x-webhook-signature: HMAC-SHA256(body, WEBHOOK_SECRET)
Body: { tenant: "geo-carpentry", agent: "posicionador", mode: "full" }
Response: { queued: true, jobId: "xxx" }
```
**Variables de entorno que CC debe agregar en Vercel:**
```
VPS_WEBHOOK_URL=http://187.77.215.146:3001/trigger
WEBHOOK_SECRET=<CW genera y comparte via canal seguro con Jorge>
```
**Nota:** CW hace deploy del service. CC solo necesita saber la URL y el secret.

### Entregable 5 — Persona files por tenant
**Cuándo:** Fase B (semana 2)
**Archivos NUEVOS:**
```
agents/tenants/geo-carpentry_persona.md   → Jorge Cruz, Geo Carpentry, Green Bay WI
agents/tenants/pinnacle_persona.md        → Pinnacle Holdings, real estate wholesale
agents/tenants/_template_persona.md       → template para nuevos tenants
```
**Formato:**
```markdown
# Tenant Persona — geo-carpentry
business_name: Geo Carpentry LLC
owner_name: Jorge Cruz
industry: General Contractor
location: Green Bay, WI
services: [kitchen-remodeling, bathroom-remodeling, deck-building, ...]
tone: Professional but approachable, bilingual EN/ES
phone: <from vault>
email: admin@geocarpentry.com
```

### Entregable 6 — Contenido Meta App Review
**Cuándo:** En paralelo (no bloquea nada de CC)
**Entrego a Jorge:** Documento con answers exactas para cada pregunta del Meta review
**No requiere nada de CC**

---

## 🔄 LO QUE CW NECESITA DE CC (dependencias)

### Dependencia 1 — Estructura del tenant_config en vault
**Necesito:** La interfaz TypeScript exacta del objeto tenant_config que getCredential() retorna.
**Para qué:** Saber exactamente qué keys leer en los agentes refactorizados.
**Cuándo me lo pasas:** Al terminar `src/lib/credentials.ts` en Fase A.
**Formato que necesito:**
```typescript
// Dame el tipo exportado de credentials.ts
export type TenantConfig = {
  airtable: { token: string; baseId: string; };
  telnyx?: { phoneNumber: string; apiKey: string; };
  social?: { facebookPageId: string; bufferToken?: string; };
  wordpress?: { url: string; apiKey: string; };
  // etc.
}
```

### Dependencia 2 — WEBHOOK_SECRET generado
**Necesito:** El valor del WEBHOOK_SECRET que CC pondrá en Vercel.
**Para qué:** Configurar la verificación HMAC en geo-webhook.service del lado VPS.
**Cuándo:** Antes de Fase C. CC genera con `openssl rand -hex 32`, me lo pasa a mí via Jorge.

### Dependencia 3 — Confirmación de rutas /privacy y /terms
**Necesito:** Que CC cree las rutas vacías `/privacy` y `/terms` en Next.js.
**Para qué:** Poder darle a Meta las URLs live antes de que yo entregue el contenido final.
**Cuándo:** Cualquier momento en Fase A/B — son rutas simples.

---

## 📅 TIMELINE COORDINADO

```
SEMANA 1 — Fase A (CC: infrastructure)
CC:  Prisma Credential model + vault + Postgres + dynamic /[tenant] route
CW:  Escribir Privacy Policy + ToS (entrego antes de fin de semana)
CW:  Empezar refactor de 5 agentes (no bloquea a CC)
JG:  Crear Meta Business App en BM de Pinnacle
JG:  Iniciar A2P brand registration en Telnyx

SEMANA 2 — Fase B (CC: certificar Tier 1 agents para Geo)
CC:  Wire agentes tenant-aware, cron certification
CW:  Entregar agentes refactorizados (analitico, audit_meta, rastreador, oraculo, reescritor)
CW:  Entregar persona files por tenant
CW:  Deploy geo-webhook.service en VPS (puede hacerse independientemente)
🤝  SYNC: CW entrega refactors → CC integra y certifica juntos

SEMANA 3 — Fase C (CC: build integraciones)
CC:  Telnyx provisioning API + Buffer integration + WP provisioning + onboard wizard
CW:  Entregar provision_telnyx.mjs + provision_hostinger_email.mjs + provision_airtable_base.mjs
CW:  Setup cuenta Buffer Business ($99/mo) + configurar org
🤝  SYNC: CW entrega scripts → CC los wrappea en /api/provision/[service]

SEMANA 4 — Fase D (CC: onboarding wizard completo)
CC:  /onboard/[step] wizard end-to-end
CW:  Proporcionar copy/content para cada step del wizard
CW:  Testear onboarding como "cliente #2" y reportar bugs
🤝  SYNC: Test conjunto del onboarding completo antes de cliente real

PARALELO (sin bloquear nada):
CW:  Meta App Review submission (empieza semana 1, llega cuando llega)
CW:  30 páginas SEO en español + hreflang
CW:  sitemap.xml + robots.txt + OG image spec para investoros.tech
```

---

## ⚠️ RIESGOS Y MITIGACIONES (perspectiva CW)

| Riesgo | Probabilidad | Mitigación CW |
|--------|-------------|---------------|
| Meta rechaza App Review | Alta | Buffer como fallback ya en Fase C |
| Telnyx A2P 10DLC tarda >2 semanas | Media | Usar números sin 10DLC para primeros beta clients (SMS no masivo) |
| geo-webhook.service en VPS tiene downtime | Baja | Systemd auto-restart + health check endpoint |
| Agente refactorizado rompe Geo Carpentry existente | Media | Refactors son backwards-compatible: fallback a env var si tenant_config no tiene el campo |

---

## 🔐 REGLAS DE COORDINACIÓN

1. **Nunca tocar el mismo archivo sin avisar.** Si CC necesita modificar un archivo que CW owns (ej: un agente), abrir issue/nota primero.
2. **Secrets nunca en texto plano.** WEBHOOK_SECRET y API keys solo via Jorge en canal seguro.
3. **Backwards compatibility siempre.** Todo refactor de CW debe mantener Geo Carpentry funcionando sin cambios.
4. **Test en staging primero.** Provisioning scripts se prueban en sandbox/test accounts antes de producción.
5. **Nada a producción sin OK de Jorge.** Especialmente: deploy de webhook service, cambios en cron del VPS.

---

## 📂 ARCHIVOS REFERENCIA IMPORTANTES

```
agents/tenants/geo-carpentry.json        ← tenant config actual (fuente de verdad)
agents/tenants/pinnacle.json             ← segundo tenant
agents/tenants/_template.json            ← template para nuevos
apps/investoros/prisma/schema.prisma     ← DB schema (CC)
apps/investoros/src/lib/credentials.ts  ← vault (CC — CW necesita el tipo exportado)
/opt/alex-bot/agents/                    ← agentes en VPS (CW)
/etc/systemd/system/geo-webhook.service ← webhook service (CW)
```

---

## ✅ CHECKLIST — Antes de primer cliente externo

- [ ] CC: Credential vault funcionando + Postgres live
- [ ] CC: /[tenant]/dashboard dinámico
- [ ] CC: Webhook trigger route con HMAC validation
- [ ] CW: 5 agentes refactorizados y backwards-compatible
- [ ] CW: geo-webhook.service UP en VPS puerto 3001
- [ ] CW: provision_telnyx.mjs testado en sandbox
- [ ] CW: Privacy Policy + ToS live en investoros.tech
- [ ] JG: Meta Business App creada + en review
- [ ] JG: A2P 10DLC brand registration aprobada
- [ ] CC+CW: Test E2E completo → Dashboard trigger → VPS → agente corre → DB actualiza
- [ ] JG: Valida todo antes de abrir a cliente externo

---
*Última actualización: 2026-05-28 · Próxima revisión: al terminar Fase A*
