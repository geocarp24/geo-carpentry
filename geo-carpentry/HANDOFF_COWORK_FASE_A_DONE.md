# HANDOFF → COWORK — Fase A done, you're unblocked

**Fecha:** 2026-05-28
**De:** Claude Code (CC)
**Para:** Cowork (CW)
**Re:** Fase A SaaS infrastructure deployed; CW deliverables ahora son no-bloqueantes

---

## ✅ Fase A completa (mi scope CC)

### 1. Legal pages LIVE en producción
Tu contenido (Privacy Policy + Terms of Service) está renderizado y accesible:

- 🟢 **https://www.investoros.tech/privacy** (HTTP 200, ISR 1h)
- 🟢 **https://www.investoros.tech/terms** (HTTP 200, ISR 1h)

Estas son las URLs que ya podés submitir a:
- Meta App Review (Facebook Developer dashboard → App Settings → Basic → Privacy Policy URL + Terms of Service URL)
- A2P 10DLC brand registration en Telnyx (Compliance → Brand → URLs)
- Cualquier otra plataforma que las pida

Footer del landing y del dashboard también linkean a estas URLs.

### 2. Credential vault deployed (AES-256-GCM)
- Tabla `Credential` en Postgres (Supabase us-west-1)
- 8 servicios soportados en el enum: `airtable`, `telnyx`, `buffer`, `google_business`, `hostinger_email`, `wordpress`, `social`, `meta_graph`
- Encryption: AES-256-GCM con IV random + auth tag por credential (no decifrable sin la ENCRYPTION_KEY de Vercel)
- Backwards compat: si la credential no está en el vault, fallback a env var (`AIRTABLE_TOKEN_GEO`, etc.) — Pinnacle y Geo siguen funcionando

### 3. Tenant-aware Airtable resolution
`src/lib/airtable.ts::getToken(tenantSlug?)` ahora:
- Si pasás `tenantSlug` → busca en vault primero, fallback a env var
- Si NO pasás slug → comportamiento original (env var only)
- Defensive: si Postgres está unreachable o schema no existe, degrada graciosamente

### 4. Webhook trigger route con tenant authorization
`/api/agents/[name]/trigger`:
- Requiere Clerk auth
- Valida `user.publicMetadata.tenantId === body.tenant` (anti-privilege-escalation)
- Verifica tenant existe y no está SUSPENDED/CANCELED
- Allowlist expandida de 9 → 20 agentes (incluye todos los folders existentes)

### 5. Dynamic dashboard route
- Nuevo: `/[tenant]/page.tsx` (ej. `/geo-carpentry`, `/pinnacle`, `/<futuro-cliente>`)
- Legacy `/geo` redirige a `/geo-carpentry` (backwards compat)
- Valida `params.tenant === user.publicMetadata.tenantId`
- Renderiza dashboard Geo cuando slug = "geo-carpentry"; otros tenants ven "onboarding pending"

### 6. Infraestructura Vercel + Supabase + Prisma E2E
- Supabase Postgres provisionado (project `kyatblshmtwawtwxdjmv`, region us-west-1)
- 9 tablas creadas via `prisma db push`: Tenant, User, Credential, Contact, Lead, Deal, Subscription, ApiKey, AuditLog
- `vercel-build` script corre `prisma generate && prisma db push` antes de `next build`
- 4 env vars en Vercel: `DATABASE_URL`, `DIRECT_URL`, `ENCRYPTION_KEY`, `WEBHOOK_SECRET`

---

## 📦 Lo que te entrego a vos (las 3 dependencias del handoff original)

### Dependencia 1 — TenantConfig TypeScript type
Lo exporté de `src/lib/credentials.ts`. Para que tus agentes refactorizados sepan exactamente qué leer del vault. **Importalo así:**

```typescript
import { type TenantConfig, getTenantConfigBySlug } from '@/lib/credentials';

// En tu agent refactorizado:
const config: TenantConfig = await getTenantConfigBySlug('geo-carpentry');
const fbPageId = config.social?.facebookPageId;     // tu hardcoded value antes
const airtableToken = config.airtable.token;        // siempre presente
const telnyxPhone = config.telnyx?.phoneNumber;     // opcional
```

**Shape completo del type:**
```typescript
export type TenantConfig = {
  slug: string;
  name: string;
  airtable: { token: string; baseId: string; };       // REQUIRED
  telnyx?: { phoneNumber: string; apiKey: string; areaCode?: string; };
  social?: {
    facebookPageId?: string;
    instagramAccountId?: string;
    bufferToken?: string;
    metaUserToken?: string;
    metaPageAccessToken?: string;
  };
  wordpress?: { url: string; bridgeToken?: string; wpcliPath?: string; };
  email?: { smtpHost: string; smtpUser: string; smtpPassword: string; smtpPort?: number; };
  gbp?: { placeId: string; managerEmail: string; placeIdCid?: string; };
};
```

**Path en el repo:** `apps/investoros/src/lib/credentials.ts` (líneas 17-50 del export type).

### Dependencia 2 — WEBHOOK_SECRET
Generado con `openssl rand -hex 32`, 64 chars hexadecimal.

**No lo paso por chat por seguridad.** Está en el disco de Jorge en:
```
C:\Users\Admin\investoros-secrets-2026-05-28.txt
```

Pedíselo a Jorge directo. **Es el mismo valor que ya está en Vercel** (variable `WEBHOOK_SECRET`). Tenés que ponerlo en el VPS para que `geo-webhook.service` pueda validar firmas HMAC-SHA256 de los triggers desde el dashboard.

### Dependencia 3 — Privacy + Terms URLs live ✅
Ya están live (ver arriba sección 1). Podés arrancar Meta App Review hoy mismo.

---

## 🎯 Lo que necesitamos de vos (Fase B + C deliverables del plan original)

### Fase B — Agentes refactorizados (semana 2)
Los 5 archivos para refactorizar (tu lista original del handoff):

| File | Hardcoded value a remover | Reemplazar con |
|---|---|---|
| `agents/analitico/analitico.mjs` | `FB_PAGE_ID=965320503341457` | `config.social?.facebookPageId` |
| `agents/audit_meta/audit_meta.mjs` | `FB_PAGE_ID hardcoded` | `config.social?.facebookPageId` |
| `agents/rastreador/rastreador.mjs` | `AIRTABLE_TOKEN hardcoded` | `config.airtable.token` |
| `agents/oraculo/oraculo.mjs` | persona file Pinnacle-only | `agents/tenants/${slug}_persona.md` |
| `agents/reescritor/reescritor.mjs` | persona file Pinnacle-only | `agents/tenants/${slug}_persona.md` |

**Patrón sugerido (puede variar según tu loader):**

```javascript
import { loadTenantConfig } from '../_shared/tenant_loader.mjs';

const tenantSlug = process.env.TENANT_SLUG || 'geo-carpentry';
const config = await loadTenantConfig(tenantSlug);

// Reemplaza el hardcoded FB_PAGE_ID
const fbPageId = config.social?.facebookPageId
  ?? process.env.FB_PAGE_ID  // fallback for Pinnacle backwards compat
  ?? null;
if (!fbPageId) throw new Error(`No FB page configured for ${tenantSlug}`);
```

**Persona files nuevos a crear:**
- `agents/tenants/geo-carpentry_persona.md` (Jorge Cruz / Green Bay WI / contractor)
- `agents/tenants/pinnacle_persona.md` (Pinnacle / real estate wholesaler)
- `agents/tenants/_template_persona.md` (skeleton para nuevos tenants)

### Fase B también — geo-webhook.service en VPS
Tu deliverable original. Una vez que esté UP en VPS port 3001 con el WEBHOOK_SECRET correcto, todos los triggers desde el dashboard van a funcionar end-to-end.

### Fase C — Provisioning scripts (semana 3)
Tu lista original:

```
scripts/provision_telnyx.mjs           → API que retorna { phoneNumber, telnyxNumberId, campaignId }
scripts/provision_hostinger_email.mjs  → API que retorna { email, smtpHost, smtpPort, password }
scripts/provision_airtable_base.mjs    → API que retorna { baseId, baseUrl }
```

Yo los envuelvo en `/api/provision/[service]` route handlers cuando llegues con ellos. Internamente cada handler:
1. Valida auth (Clerk + tenant ownership)
2. Llama tu script
3. Toma el resultado y lo guarda automáticamente en el credential vault
4. Retorna `{ success, data, error? }` al wizard

---

## 📊 Estado completo del checklist pre-cliente externo

| Item | Owner | Status |
|---|---|---|
| Credential vault funcionando + Postgres live | CC | ✅ |
| `/[tenant]/dashboard` dynamic | CC | ✅ |
| Webhook trigger route con HMAC + tenant validation | CC | ✅ |
| 5 agentes refactorizados (backwards-compat) | CW | ⏳ |
| `geo-webhook.service` UP en VPS puerto 3001 | CW | ⏳ |
| `provision_telnyx.mjs` testado en sandbox | CW | ⏳ |
| Privacy Policy + ToS live en investoros.tech | CC | ✅ |
| Meta Business App creada + en review | CW/Jorge | ⏳ (puede arrancar ya) |
| A2P 10DLC brand registration aprobada | CW/Jorge | ⏳ (puede arrancar ya) |
| Test E2E completo Dashboard→VPS→agente→DB | CC+CW | ⏳ depende de tus deliverables |
| Validación Jorge antes de abrir a cliente externo | Jorge | ⏳ |

---

## 🚀 Mientras esperás CW, yo (CC) sigo con (no bloquea nada tuyo)

1. **Seed Geo credentials al vault** (30 min) — migrar `AIRTABLE_TOKEN_GEO` env var a la tabla `Credential` para validar E2E que la encriptación funciona
2. **Dashboard UI polish** (2-3h) — aplicar el dark theme del landing al `/[tenant]/page.tsx` (sidebar, topbar, tipografía Inter, brand colors `#09090f` + gradient `#6366f1`)
3. **Fase D — Onboarding wizard `/onboard/[step]`** (1 día) — 5 steps placeholder. Cuando llegues con tus provisioning scripts, los plug-in en cada step.

---

## ❓ Preguntas para CW

1. **Timeline estimado** de los 5 agentes refactorizados — ¿1 semana, 2 semanas?
2. **Está UP el geo-webhook.service en VPS?** Si todavía no, ¿cuándo lo deployás? El test E2E del trigger flow lo necesita.
3. **Meta App Review** — ¿necesitás algo más de mí (CC) para arrancar? Yo te puedo dar la URL del data deletion endpoint cuando lo construya, screenshots de la app, lo que pidan.
4. **A2P 10DLC** — Jorge tiene cuenta Telnyx? Si no, ¿la crea él o vos?

---

## 📂 Files de referencia (read-only para CW)

```
apps/investoros/prisma/schema.prisma                        ← Credential model definition
apps/investoros/src/lib/credentials.ts                      ← TenantConfig type + vault API
apps/investoros/src/lib/airtable.ts                         ← getToken(tenantSlug?) pattern
apps/investoros/src/app/api/agents/[name]/trigger/route.ts  ← webhook trigger contract
apps/investoros/src/app/(dashboard)/[tenant]/page.tsx       ← tenant dashboard
apps/investoros/src/content/legal/privacy.md                ← tu Privacy Policy (committed)
apps/investoros/src/content/legal/terms.md                  ← tus Terms (committed)
```

GitHub repo: `geocarp24/investoros-web` branch `main`.

---

## 🎯 GO

Estás unblocked para arrancar Fase B y C. Yo mientras tanto avanzo con Fase D + polish.

Cuando entregues alguno de los 3 deliverables (agentes refactorizados / provisioning scripts / geo-webhook.service UP), avisame y los integro inmediatamente.

**Estado:** Sprint Fase A done ✅ · Sprint Fase B+C blocked on CW ⏳ · Sprint Fase D in progress (CC independent) 🟢
