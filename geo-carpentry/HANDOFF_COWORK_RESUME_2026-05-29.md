# HANDOFF → COWORK — Resume after session restart

**Fecha:** 2026-05-29
**De:** Claude Code (CC)
**Para:** Cowork (CW)
**Propósito:** Retomar sin perder contexto. **NO RE-HACER trabajo ya entregado.** Catch-up completo en un solo doc.

---

## 🎯 TL;DR — Donde estamos

InvestorOS SaaS está **production-ready en infraestructura** (Fase A done). La plataforma puede:

- ✅ Onboarding wizard de 5 pasos crea Tenants + credentials vault
- ✅ Dashboard tenant-aware (`/[tenant]`) con 5 secciones (Overview / Agents / Leads / Content / Settings / Billing)
- ✅ 27 agentes mostrados en org chart de 8 departamentos
- ✅ Trigger pipeline E2E funciona: Dashboard click → Vercel HMAC → VPS:3003 → spawn agent → Telegram + Airtable write
- ✅ 30 páginas SEO en español publicadas con gray-matter + remark + JSON-LD + per-page OG
- ✅ Sitemap.xml + robots.txt + opengraph-image
- ✅ Privacy Policy + Terms en producción (para Meta App Review)
- ✅ Vault con WP + Google OAuth seeded para Geo Carpentry

**Active agents para Geo Carpentry:** 2 (Rex/Posicionador + Echo/Mercader).

**Próximo objetivo:** activar Eli (Escriba) para que publique las 30 páginas drafted en Content_Queue a `geocarpentry.com` vía WP REST API. **Spec completa en `HANDOFF_ELI_WP_WIRE.md` (este mismo repo, ya pushed).**

---

## ⛔ NO RE-HACER — Lista de lo ya entregado por CW (no toques)

1. ✅ **5 agentes refactorizados tenant-aware**: `analitico`, `audit_meta`, `rastreador`, `oraculo`, `reescritor` (Fase B). Backwards compatible con Pinnacle.
2. ✅ **Persona files**: `agents/tenants/geo-carpentry_persona.md`, `pinnacle_persona.md`, `_template_persona.md`.
3. ✅ **`geo-webhook.service`** UP en VPS ALEX puerto 3003. HMAC-SHA256 validation funcionando. Service file en `/etc/systemd/system/geo-webhook.service`. Router en `/opt/geo-webhook/router.mjs`.
4. ✅ **WEBHOOK_SECRET aligned** entre VPS y Vercel: `c30b4c5a7b18ad63f9429e700b57e9b4e3b17c2b6bb293e6bfb287e716bddd93` (NO regenerar — rompería Vercel).
5. ✅ **Fix Posicionador ENOENT**: `binary_path` corregido en `geo-carpentry.json` + `pinnacle.json` a `/usr/local/bin/claude`. Router agregó `childEnv.HOME = process.env.HOME || "/root"` como red de seguridad.
6. ✅ **Fix Posicionador `mode=default`**: router.mjs ahora skipea `--mode default` cuando llega ese valor.
7. ✅ **Fix Posicionador wrong-table write**: agregaste `seo_table_id: "tbl53FPGfpa4OtafX"` a `geo-carpentry.json` (sin esto Posicionador escribía a Content_Queue tbl pen42pK3YFxGEW). **Verificado escribiendo a SEO_Audits hoy.**

---

## ✅ Lo que CC entregó después de tu último mensaje

### A. Credenciales en el vault (Jorge las seedeó vía `/api/admin/seed-tenant-credential`)

Tenant `geo-carpentry` (id `cmpqfuhhh0000l804ibwll0q9`) ahora tiene en Supabase Credential table:

| service | keyName | metadata | Uso |
|---|---|---|---|
| `wordpress` | `app_password` | `{"username":"geocarpentryllc","url":"https://geocarpentry.com"}` | **Eli** publish vía WP REST API |
| `google_business` | `oauth_client_id` | `{"project_id":"investoros-agents"}` | **Nova** (futuro) |
| `google_business` | `oauth_client_secret` | — | **Nova** (futuro) |
| `airtable` | `api_token` | — | (seed inicial) |
| `airtable` | `base_id` | — | (seed inicial) |

### B. `TenantConfig` TypeScript type extendido

`apps/investoros/src/lib/credentials.ts` ahora exporta WP REST + Google OAuth fields cleanly. `getTenantConfigBySlug("geo-carpentry")` devuelve:

```typescript
config.wordpress = {
  url: "https://geocarpentry.com",
  username: "geocarpentryllc",
  appPassword: "xxxx xxxx xxxx xxxx xxxx xxxx", // decrypted just-in-time
  bridgeToken: undefined, // no usar para Geo — Geo usa REST API standard
};

config.googleBusiness = {
  oauthClientId: "1088922070563-...",
  oauthClientSecret: "GOCSPX-...",
  oauthRefreshToken: undefined, // se popula tras OAuth flow (Nova sprint)
  placeId: undefined,
};
```

### C. UI actualizada

- `/[tenant]/agents` — org chart de **27 agentes en 8 departamentos** (SEO / Content / Social / Marketing / Lead Gen / CRM / Local / Operations). Cada agent card con status real (active / code-ready / planned), descripción + scope + Run Now (solo active).
- `/[tenant]/leads` — tabla filtrable de leads con chips Heat (Hot/Warm/Cold)
- `/[tenant]/content` — Content_Queue por status (Kanban 4 cols)
- `/settings` — credenciales en vault mostradas como cards Connected/Pending
- `/billing` — placeholder hasta Sprint B4 Stripe
- `/onboard/[step]` — wizard 5 pasos

### D. Auth + routing fixes

- `/sign-up` ahora redirige a `/onboard` (no a `/geo`)
- `/sign-in` redirige a `/dashboard` que route por tenantId
- Nav landing: "Start free trial" → "Sign up" (no había free trial real)

---

## 🎯 Sprint activo — Eli (Escriba) primero

**Spec completa:** [`HANDOFF_ELI_WP_WIRE.md`](./HANDOFF_ELI_WP_WIRE.md) en este mismo folder.

### Resumen mínimo

CW refactoriza `agents/escriba/escriba.mjs` para:

1. Leer `config.wordpress` (url + username + appPassword) vía `getTenantConfigBySlug(tenantSlug)` o equivalente VPS-side.
2. Query Airtable `Content_Queue` filtrando `status="ready_to_publish" AND tenant_id="geo-carpentry"`.
3. POST a `https://geocarpentry.com/wp-json/wp/v2/posts` con Basic Auth `base64(username:appPassword)`, body con `{title, content (HTML), slug, excerpt, status:"draft"}`.
4. Update Airtable row: `status="published"`, `wp_post_id`, `wp_url`, `published_at`.
5. Telegram-notify Jorge en cada publish exitoso o failure.

### Cron sugerido (después del smoke test)

```cron
0 10 * * 2,5 cd /opt/alex-bot && node agents/escriba/escriba.mjs --tenant geo-carpentry --mode publish_batch --max 2
```

Tu+Fr 10:00 UTC, 2 posts por run = 4/semana. 30 pages drafted = 15 semanas de inventario.

### 5 preguntas para CW (necesito respuesta antes de codear el endpoint que pueda hacer falta)

1. **¿Cómo lee VPS del vault?** HTTP a CC, Postgres directo, o env var fallback? Si HTTP, yo construyo `GET /api/internal/tenant-config` en 30 min.
2. **Yoast SEO vs SureRank** en geocarpentry.com? Cambia los meta field keys del POST.
3. **WP REST API standard vs custom mu-plugin?** Recomiendo REST API standard (más limpio multi-tenant — bridge mu-plugin queda como legacy Pinnacle).
4. **Content_Queue field names**: el schema actual usa `title`, `body_md`, `slug`, `meta_description`, `target_keyword`. Confirma alignment.
5. **Rate limit OK?** 4/semana inicial seguro.

---

## 📋 Roadmap post-Eli (orden Jorge confirmó)

| Orden | Agente | Estado | CW work |
|---|---|---|---|
| 1 | **Eli (Escriba)** — WP publishing | 🟡 Code-ready | **Spec actual — empezar acá** |
| 2 | **Marco (Social Media)** — FB+IG via Buffer | 🟡 Code-ready | Wire Buffer integration + FB Page admin |
| 3 | **Kai (Lead Scorer)** — Airtable lead scoring | 🟡 Code-ready | Wire al Geo Leads schema |
| 4 | **Fer (SMS Receptionist)** — Telnyx SMS | 🔵 Build | Telnyx provisioning + SMS flow |
| 5 | **Viper (Sales Closer)** | 🔵 Build | Después de Fer |
| 6 | **Tracy (Skip Tracer)** | 🟡 Code-ready (Pinnacle) | Wire para Geo |
| 7 | **Scout (Web Scraper)** | 🟡 Code-ready | Config Brown County permits + WI FSBO |
| 8 | **Atlas (Executive Brief)** | 🟡 Code-ready | Weekly cross-dept summary |

**Stop point por ahora**: Jorge solo necesita SEO + Marketing + Social Media + Lead Gen + CRM en 4 departamentos. Cuando esos 4 trabajen 100% para Geo, abrimos Pinnacle como tenant #2.

---

## 🗄️ Infraestructura — referencias rápidas

### URLs
- Production: https://www.investoros.tech
- Dashboard tenant: https://www.investoros.tech/geo-carpentry
- Sign-up: https://www.investoros.tech/sign-up
- Onboard wizard: https://www.investoros.tech/onboard
- Privacy/Terms (live para Meta App Review): /privacy + /terms
- ES SEO pages: /es/[slug] (30 prerendered con SSG)
- Sitemap: /sitemap.xml
- Repo Next.js: https://github.com/geocarp24/investoros-web (branch `main`)
- Repo Geo Carpentry (handoffs): https://github.com/geocarp24/geo-carpentry (branch `master`)

### VPS ALEX
- Host: `root@187.77.215.146` puerto 22 (alias SSH: `alex-vps`)
- App path: `/opt/alex-bot/` (agentes + tenant configs)
- Webhook: `geo-webhook.service` en puerto **3003** (NO 3001, está ocupado)
- Crontab gestionado entre `# === BEGIN: <agent> <tenant> cron (managed by Claude Code) ===` y `# === END ===`

### Vercel
- Project: `investoros-web` en team `jorge-saas-investoros`
- Env vars: `DATABASE_URL`, `DIRECT_URL`, `ENCRYPTION_KEY`, `WEBHOOK_SECRET`, `VPS_WEBHOOK_URL=http://187.77.215.146:3003/trigger`, `AIRTABLE_TOKEN_GEO`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Auto-deploys on push a `main`

### Supabase
- Project ID: `kyatblshmtwawtwxdjmv` (region us-west-1)
- Tables: `Tenant`, `User`, `Credential`, `Contact`, `Lead`, `Deal`, `Subscription`, `ApiKey`, `AuditLog`
- 2 tenant rows: `geo-carpentry` (id `cmpqfuhhh0000l804ibwll0q9`), `pinnacle` (id `cmpqfuipj00005l804yodklte8`)

### Airtable Geo Carpentry
- Base: `appAQpveuAec077jF`
- Tables: Contacts `tbldetnRGCnmHDgFw`, Leads `tblVqrROrVspFXniG`, Jobs `tblRlPhcwiGP7J8LS`, Subcontractors `tbldciY36E08UEEua`, Activities `tblWbxNNyGzRhdIwF`, Permits `tblz1qVWHJZFjQzqX`, **SEO_Audits `tbl53FPGfpa4OtafX`**, Content_Queue `tblpiN42pK3YFxGEW`, Marketing_Audits `tbld7LtJzeN5QTHPo`
- **Decisions_Log: `tbluHpgWlVNqSveVi`** (mismo base) — usalo según la regla persistente del proyecto

### Secrets críticos (NO regenerar sin coordinación)
- `WEBHOOK_SECRET=c30b4c5a7b18ad63f9429e700b57e9b4e3b17c2b6bb293e6bfb287e716bddd93` (alineado VPS ↔ Vercel)
- `ENCRYPTION_KEY` (vault AES-256-GCM) — vive en `~/investoros-secrets-2026-05-28.txt` en máquina de Jorge + Vercel env vars
- WP Application Password de Geo: encripted en vault (Jorge va a rotar después del smoke test)
- Google OAuth `client_secret` para Nova: encripted en vault

---

## 📜 Decisions_Log recientes (referencia para entender cómo llegamos acá)

| Record ID | Decision |
|---|---|
| `recNUpfbNnklSOGO9` | Sent CW handoff to wire Eli (Escriba) WordPress publishing for Geo |
| `recvK0VpcFKEA4Hsr` | Fixed Run Now sending missing mode flag |
| `recM9a8Pstjteb5cD` | CW + CC double-fix for silent Posicionador exit on missing mode |
| `recXAqrRMjp2ZzNvv` | Started Paso 2 — Dashboard UI dark theme polish |
| `recJqKi6dYJNPkzEE` | Shipped Paso 2 dashboard dark theme + sidebar + topbar |
| `recR9aK62fx9RJCoE` | Built 5 missing dashboard pages + functional Run Now |
| `recZ3dpi3EOSgTIU8` | Shipped 30 ES pages + sitemap + robots + OG image (CW deliverables) |
| `recLxkpez75wOS1vp` | Adopted CW gray-matter fix for broken /es pages |
| `recBPBuDEt2HiomAh` | Shipped Fase D 5-step onboarding wizard |
| `recuTXncHMIF4Gap3` | Validated credential vault end-to-end via seed run |
| `recCrv8HxMecUybC0` | Built seed script + admin endpoint to migrate env tokens into vault |
| `recUmeRGlhV99xsEC` | Aligned WEBHOOK_SECRET to CW pre-existing VPS value |
| `recMsMmDU8M5JAFJ9` | Confirmed VPS_WEBHOOK_URL port 3003 (CW response) |

Para query completo: `curl https://api.airtable.com/v0/appAQpveuAec077jF/tbluHpgWlVNqSveVi?sort[0][field]=Date&sort[0][direction]=desc` con tu PAT.

---

## 🚦 Action items para CW (en orden de prioridad)

### 🟢 INMEDIATO

1. **Leé `HANDOFF_ELI_WP_WIRE.md`** (mismo folder) — spec completa de qué cambiar en Escriba.
2. **Respondé las 5 preguntas técnicas** del handoff (VPS-vault read pattern, Yoast vs SureRank, REST API vs mu-plugin, Content_Queue schema, rate limit).
3. **Ship Escriba refactor** consumiendo `config.wordpress`. Empezá con `status:"draft"` en el POST para que Jorge revise antes de publish.

### 🟡 PARALELO

4. **Confirmá que Posicionador + Mercader sigan corriendo en cron** (Tu/Fr cada 3 días + Lunes 12:00 UTC para deep). Los últimos runs fueron exitosos hoy con el `seo_table_id` fix.
5. **No regenerar `WEBHOOK_SECRET`** ni cambiar puerto `3003` sin avisar — son alineados con Vercel.

### 🔵 SIGUIENTE (post-Eli)

6. Marco (Social Media) via Buffer
7. Kai (Lead Scorer) wire al schema de Geo Leads
8. Fer (Telnyx SMS) — requiere Fase C provisioning script primero

---

## 💬 Cómo coordinamos

- **Avisame con el commit SHA** cuando termines cada agente refactor (push a `geocarp24/alex-bot` o donde viva el código del agent en VPS).
- **Loggea cada decision en Airtable Decisions_Log** (`tbluHpgWlVNqSveVi`) con `Owner="Cowork"`. Ver `feedback_decisions_log_airtable.md` para field map.
- **Si encontrás un blocker que requiere CC** (endpoint nuevo, env var, etc.), pingueame con detalle y lo construyo.
- **Después de cada agent active**, smoke test conjunto vía dashboard Run Now → Jorge ve resultado en Telegram + Airtable.

---

## ✅ Checklist de retomada (chequeá antes de empezar)

- [ ] Leíste `HANDOFF_ELI_WP_WIRE.md` (spec específica del trabajo activo)
- [ ] Conocés el WEBHOOK_SECRET aligned (`c30b4c...`) — no regenerar
- [ ] VPS_WEBHOOK_URL es puerto 3003
- [ ] Posicionador `seo_table_id` está fixed en `geo-carpentry.json`
- [ ] Confirmaste que tenés acceso al repo `geocarp24/investoros-web` para leer `apps/investoros/src/lib/credentials.ts` (TenantConfig type definition)
- [ ] Confirmaste que `agents/escriba/` está en tu working state (tu domain, no tocado por CC)

---

**Fecha de este handoff:** 2026-05-29
**Status post-restart:** Eli sprint activo. CW respond + ship.
**Próximo sync:** cuando CW reporte commit SHA del Escriba refactor.
