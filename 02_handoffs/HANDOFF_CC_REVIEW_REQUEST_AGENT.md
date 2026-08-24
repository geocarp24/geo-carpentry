# HANDOFF CC — review_request.mjs (SMS/Email Review Request — Manual desde CRM)

**Fecha:** 2026-08-23 (rediseñado)
**Para:** Claude Code (CC) en VPS
**Estado:** LISTO para implementar
**Prioridad:** CC #6

---

## OBJETIVO

Cuando Jorge marca un job como completado en el CRM, presiona un botón "Request Review" que dispara este agente vía webhook. El agente envía un SMS + email a ese cliente pidiendo Google Review. **No es cron — es disparo manual por job.**

---

## FLUJO COMPLETO

```
CRM UI (botón "Request Review" en record del cliente)
  → POST /trigger en VPS puerto 3003
    { tenant: 'geo-carpentry', agent: 'review_request', lead_id: 'rec...' }
  → review_request.mjs recibe lead_id
  → fetch record de Airtable Geo_Leads
  → validar (DNC, cooldown 30d)
  → enviar SMS vía Twilio + email (si tiene email)
  → actualizar "Review Requested At" en Airtable
  → responder { ok: true } al webhook
```

---

## ARCHIVOS A CREAR / MODIFICAR

1. **CREAR:** `/opt/alex-bot/agents/review_request/review_request.mjs`
2. **MODIFICAR:** El webhook router (`/opt/geo-webhook/`) para enrutar `agent: 'review_request'`
3. **MODIFICAR (UI):** Agregar botón "Request Review" en el CRM — ver sección UI abajo

---

## PREREQUISITOS

### 1. Credenciales en `/opt/alex-bot/.env`
```bash
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
GOOGLE_REVIEW_URL=https://g.page/r/CW11zSNR9BL0EBM/review   # ✅ confirmado Jorge 2026-08-23
```
Si Twilio no está configurado → reportar a Jorge antes de continuar.

### 2. Campo nuevo en Airtable Geo_Leads (`tblaH41HWeVG9ZXLn`)
- **Nombre:** `Review Requested At`
- **Tipo:** Date
- **Propósito:** cooldown — no re-enviar dentro de 30 días al mismo cliente

---

## PATRÓN VPS (igual que otros agentes)

```javascript
import { readFile } from 'fs/promises';

const tenantConfig = JSON.parse(
  await readFile('/opt/alex-bot/agents/tenants/geo-carpentry.json', 'utf8')
);
const airtableToken = process.env[tenantConfig.airtable.token_env]; // AIRTABLE_TOKEN_GEO
const BASE_ID = tenantConfig.airtable.base_id; // appAQpveuAec077jF
const LEADS_TABLE = 'tblaH41HWeVG9ZXLn';
const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL;
```

---

## AGENTE: review_request.mjs

El agente recibe el `lead_id` como argumento (pasado por el webhook router):

```javascript
// El webhook router llama: node review_request.mjs rec6NOxpJuKTiCfBF
const lead_id = process.argv[2];
if (!lead_id) throw new Error('lead_id requerido como argumento');
```

### Paso 1: Fetch record específico

```javascript
const res = await fetch(
  `https://api.airtable.com/v0/${BASE_ID}/${LEADS_TABLE}/${lead_id}`,
  { headers: { Authorization: `Bearer ${airtableToken}` } }
);
const record = await res.json();
const f = record.fields;
```

### Paso 2: Validaciones de seguridad

```javascript
// Field IDs de Geo_Leads:
// fldUTOYSri5bcXSVQ → DNC (boolean)
// fldytSAwcOBwqwUd2 → Status
// flduFtNu4dyhfeBbg → Jobs linked (array)
// fldpKCnwHhMYvREDj → Phone
// fldUqmulwBHGQCcxh → Name
// fld5vXtGIvU1unHuR → Language
// "Review Requested At" → fecha último envío (anotar field ID al crear)

const DNC = f['fldUTOYSri5bcXSVQ'] === true;
if (DNC) throw new Error('BLOCKED: cliente en DNC');

const lastRequest = f['Review Requested At'];
if (lastRequest) {
  const daysSince = (Date.now() - new Date(lastRequest).getTime()) / 86400000;
  if (daysSince < 30) throw new Error(`BLOCKED: enviado hace ${Math.floor(daysSince)} días (cooldown 30d)`);
}

const hasJob = (f['flduFtNu4dyhfeBbg'] ?? []).length > 0;
if (!hasJob) throw new Error('BLOCKED: sin job linked');
```

### Paso 3: Normalizar teléfono

```javascript
function normalizePhone(raw) {
  let digits = String(raw).replace(/[^\d]/g, '');
  if (digits.length === 10) digits = '1' + digits;
  return '+' + digits;
}
```

### Paso 4: Templates SMS

```javascript
function buildSMS(name, lang) {
  const firstName = name?.split(' ')[0] ?? 'there';
  if (lang === 'Spanish') {
    return `¡Hola ${firstName}! Soy Jorge de Geo Carpentry. Fue un placer trabajar en su proyecto. Si quedó contento, le agradecería mucho una reseña rápida en Google — ayuda mucho a nuestro pequeño negocio. ${GOOGLE_REVIEW_URL} ¡Gracias!`;
  }
  return `Hi ${firstName}! It's Jorge from Geo Carpentry. We really enjoyed working on your project. If you're happy with the results, a quick Google review would mean the world to us. ${GOOGLE_REVIEW_URL} Thanks so much!`;
}
```

### Paso 5: Enviar SMS vía Twilio

```javascript
import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, body) {
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY_RUN] TO: ${to}\nMSG: ${body}`);
    return { sid: 'dry_run' };
  }
  return await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER,
    to,
    body,
  });
}
```

### Paso 6: Actualizar `Review Requested At` en Airtable

```javascript
async function markRequested(recordId, reviewFieldId) {
  if (process.env.DRY_RUN === 'true') return;
  await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${LEADS_TABLE}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: { [reviewFieldId]: new Date().toISOString().slice(0, 10) },
      }),
    }
  );
}
```

`reviewFieldId` = field ID de `Review Requested At` una vez creado. Anotarlo en este handoff.

### Paso 7: Main

```javascript
const phone = normalizePhone(f['fldpKCnwHhMYvREDj'] ?? '');
const name  = f['fldUqmulwBHGQCcxh'] ?? '';
const lang  = f['fld5vXtGIvU1unHuR']?.name ?? 'English';

if (!phone || phone.length < 12) throw new Error(`Teléfono inválido: ${phone}`);

const msg = buildSMS(name, lang);
console.log(`[SEND] ${name} (${phone}) [${lang}]`);

const result = await sendSMS(phone, msg);
console.log(`[OK] SID: ${result.sid}`);

const REVIEW_FIELD_ID = 'REEMPLAZAR_CON_FIELD_ID_REAL';
await markRequested(record.id, REVIEW_FIELD_ID);

console.log('✅ Review request enviada');
```

---

## WEBHOOK ROUTER — modificación requerida

En el router del geo-webhook, agregar el case `review_request`:

```javascript
case 'review_request':
  // payload debe incluir lead_id
  const { lead_id } = body;
  if (!lead_id) return res.status(400).json({ error: 'lead_id requerido' });
  spawnAgent('review_request/review_request.mjs', [lead_id]);
  return res.json({ ok: true, queued: true });
```

---

## UI — Botón en CRM

En la app del CRM (dashboard o Geo Social), agregar botón **"📩 Request Review"** en el detalle de un lead/job completado.

Al hacer click:

```javascript
async function requestReview(leadId) {
  const res = await fetch('/api/agents/review_request/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant: 'geo-carpentry',
      agent: 'review_request',
      lead_id: leadId,
    }),
  });
  const data = await res.json();
  if (data.ok) alert('✅ Review request enviada!');
  else alert('❌ Error: ' + data.error);
}
```

El botón debe:
- Mostrarse solo si el job está marcado como completado
- Deshabilitarse si `Review Requested At` tiene fecha dentro de 30 días (para evitar duplicados visibles)

---

## CLIENTES ELEGIBLES HOY (2026-08-19)

| Record ID | Nombre | Teléfono | Job | Lang |
|---|---|---|---|---|
| rec6NOxpJuKTiCfBF | Nedd & Jill Schommer | +19204285771 | 224 paradise ln, little chute | EN |
| recNkc9RWxslm0Ywl | Robin | +19208831500 | Egg harbor job | EN |
| recukaLRzAUBDfJKW | Andrea Vandermeulen | +19204129544 | 1340 Harvey st | EN |

---

## CHECKLIST PARA CC

- [ ] Verificar `TWILIO_*` credentials en `/opt/alex-bot/.env`
- [x] `GOOGLE_REVIEW_URL` confirmado: `https://g.page/r/CW11zSNR9BL0EBM/review` ✅ 2026-08-23
- [ ] Crear campo `Review Requested At` (Date) en Geo_Leads vía Airtable API
- [ ] Anotar field ID del nuevo campo y reemplazar `REEMPLAZAR_CON_FIELD_ID_REAL` en el código
- [ ] Instalar twilio: `cd /opt/alex-bot && npm install twilio`
- [ ] Modificar webhook router para enrutar `agent: 'review_request'` con `lead_id`
- [ ] Agregar botón "Request Review" en CRM UI
- [ ] Primera prueba: `DRY_RUN=true node agents/review_request/review_request.mjs rec6NOxpJuKTiCfBF`
- [ ] Mostrar output a Jorge para aprobación
- [ ] Ejecución real solo con OK de Jorge

---

## SEGURIDAD

- NUNCA enviar a DNC=true
- NUNCA re-enviar dentro de 30 días al mismo cliente
- NUNCA agregar cron para este agente — es manual únicamente
- DRY_RUN=true obligatorio en primera prueba
- Loggear cada envío en `/opt/alex-bot/logs/review_request.log`
