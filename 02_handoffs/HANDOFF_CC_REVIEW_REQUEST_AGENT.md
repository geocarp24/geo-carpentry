# HANDOFF CC — review_request.mjs (VPS SMS Review Agent)

**Fecha:** 2026-08-19  
**Para:** Claude Code (CC) en VPS  
**Estado:** LISTO para implementar  
**Prioridad:** CC #2 (después de meta_ads.mjs)

---

## OBJETIVO

Enviar SMS de solicitud de Google Review a clientes confirmados de Geo Carpentry. Solo a clientes reales (con Job linked en Airtable), nunca a leads fríos, nunca a DNC.

---

## ARCHIVO A CREAR

```
/opt/alex-bot/agents/review_request/review_request.mjs
```

---

## PREREQUISITOS (verificar antes de codear)

### 1. Credenciales SMS en VPS `.env`
El agente necesita Twilio u otro proveedor SMS. Verificar en `/opt/alex-bot/.env`:
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
```
Si no existe Twilio configurado → reportar a Jorge antes de continuar.

### 2. Google Review URL
Agregar a `/opt/alex-bot/.env`:
```
GOOGLE_REVIEW_URL=https://g.page/r/[PLACE_ID]/review
```
Jorge debe proveer el Place ID o el link completo. Pedírselo antes de primera ejecución.

### 3. Campo nuevo en Airtable (Geo_Leads)
CC debe crear este campo vía API o desde Airtable UI:
- **Tabla:** `tblaH41HWeVG9ZXLn` (Geo_Leads)
- **Nombre:** `Review Requested At`
- **Tipo:** Date (include time: false)
- **Propósito:** Prevenir re-envíos dentro de 30 días

---

## PATRÓN VPS (igual que otros agentes)

```javascript
import { readFile } from 'fs/promises';

const tenantConfig = JSON.parse(
  await readFile(`/opt/alex-bot/agents/tenants/geo-carpentry.json`, 'utf8')
);
const airtableToken = process.env[tenantConfig.airtable.token_env]; // AIRTABLE_TOKEN_GEO
const BASE_ID = tenantConfig.airtable.base_id; // appAQpveuAec077jF
```

---

## LÓGICA DEL AGENTE

### Paso 1: Fetch Geo_Leads

```javascript
const res = await fetch(
  `https://api.airtable.com/v0/${BASE_ID}/tblaH41HWeVG9ZXLn?` +
  new URLSearchParams({ pageSize: '100' }),
  { headers: { Authorization: `Bearer ${airtableToken}` } }
);
const { records } = await res.json();
```

### Paso 2: Filtrar elegibles en JS

```javascript
const SKIP_STATUSES = ['Not Interested', 'DNC', 'Spam'];
const COOLDOWN_DAYS = 30;

const eligible = records.filter(r => {
  const f = r.cellValuesByFieldId ?? r.fields;

  // Debe tener job linked
  const hasJob = (f['flduFtNu4dyhfeBbg'] ?? []).length > 0;
  if (!hasJob) return false;

  // No DNC
  if (f['fldUTOYSri5bcXSVQ'] === true) return false;

  // Status válido
  const status = f['fldytSAwcOBwqwUd2']?.name ?? f['fldytSAwcOBwqwUd2'] ?? '';
  if (SKIP_STATUSES.includes(status)) return false;

  // Cooldown de 30 días
  const lastRequest = f['Review Requested At']; // nombre del campo nuevo
  if (lastRequest) {
    const daysSince = (Date.now() - new Date(lastRequest).getTime()) / 86400000;
    if (daysSince < COOLDOWN_DAYS) return false;
  }

  return true;
});
```

**Nota sobre field IDs vs field names:** Los registros devuelven field IDs si se usa `cellValuesByFieldId`. El campo `Review Requested At` (nuevo) — usar su field name o field ID una vez creado. Para los campos existentes, los IDs son:
- `fldpKCnwHhMYvREDj` → teléfono (formato: "19204285771" o "+17077060205")
- `fldUqmulwBHGQCcxh` → nombre del lead
- `fld5vXtGIvU1unHuR` → language (`{name: "English"}` o `{name: "Spanish"}`)
- `fldUTOYSri5bcXSVQ` → DNC (boolean)
- `fldytSAwcOBwqwUd2` → Status (`{name: "Offer Approved"}`)
- `flduFtNu4dyhfeBbg` → Jobs linked (array de `{id, name}`)

### Paso 3: Normalizar teléfono

```javascript
function normalizePhone(raw) {
  // Quitar todo excepto dígitos y +
  let digits = String(raw).replace(/[^\d]/g, '');
  // Asegurar E.164 para Twilio
  if (digits.length === 10) digits = '1' + digits;
  return '+' + digits;
}
```

### Paso 4: Templates SMS

```javascript
const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL;

function buildMessage(name, lang) {
  const firstName = name?.split(' ')[0] ?? 'there';
  if (lang === 'Spanish') {
    return `¡Hola ${firstName}! Soy Jorge de Geo Carpentry. Fue un placer trabajar en su proyecto. Si quedó contento con el resultado, agradecería mucho una reseña rápida en Google — ayuda mucho a nuestro pequeño negocio. ${GOOGLE_REVIEW_URL} ¡Muchas gracias!`;
  }
  return `Hi ${firstName}! It's Jorge from Geo Carpentry. We really enjoyed working on your project. If you're happy with the results, a quick Google review would mean the world to us — it really helps our small business. ${GOOGLE_REVIEW_URL} Thanks so much!`;
}
```

### Paso 5: Enviar SMS vía Twilio

```javascript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, body) {
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY_RUN] TO: ${to} | MSG: ${body}`);
    return { status: 'dry_run' };
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
async function markRequested(recordId, fieldId) {
  if (process.env.DRY_RUN === 'true') return;

  await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/tblaH41HWeVG9ZXLn/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: { [fieldId]: new Date().toISOString().slice(0, 10) }, // YYYY-MM-DD
      }),
    }
  );
}
```

`fieldId` = el field ID de `Review Requested At` una vez creado en Airtable.

### Paso 7: Loop principal

```javascript
let sent = 0;

for (const record of eligible) {
  const f = record.fields; // ajustar si API devuelve cellValuesByFieldId
  const phone = normalizePhone(f['fldpKCnwHhMYvREDj'] ?? '');
  const name = f['fldUqmulwBHGQCcxh'] ?? '';
  const lang = f['fld5vXtGIvU1unHuR']?.name ?? 'English';

  if (!phone || phone.length < 10) {
    console.log(`[SKIP] ${name} — teléfono inválido: ${phone}`);
    continue;
  }

  const msg = buildMessage(name, lang);
  console.log(`[SEND] ${name} (${phone}) [${lang}]`);

  try {
    const result = await sendSMS(phone, msg);
    console.log(`[OK] SID: ${result.sid ?? 'dry_run'}`);
    await markRequested(record.id, 'FIELD_ID_REVIEW_REQUESTED_AT'); // reemplazar con field ID real
    sent++;
  } catch (err) {
    console.error(`[ERROR] ${name}: ${err.message}`);
  }

  // Pausa entre envíos (evitar rate limiting)
  await new Promise(r => setTimeout(r, 1000));
}

console.log(`\n✅ Review requests enviadas: ${sent} / ${eligible.length}`);
```

---

## CLIENTES ELEGIBLES HOY (2026-08-19)

De 10 records en Geo_Leads, **3 son elegibles**:

| Record ID | Nombre | Teléfono | Job | Lang |
|---|---|---|---|---|
| rec6NOxpJuKTiCfBF | Nedd & Jill Schommer | 19204285771 | 224 paradise ln, little chute | EN |
| recNkc9RWxslm0Ywl | Robin | 19208831500 | Egg harbor job | EN |
| recukaLRzAUBDfJKW | Andrea Vandermeulen | 19204129544 | 1340 Harvey st | EN |

Ningún cliente con job confirmado en español aún.

**Excluidos:**
- recELeU1mkLz3IV7i (Inbound 2026-06-03) — DNC=true
- recH6SIUOtgrWdftr (Joseph) — DNC=true
- 5 records sin job linked (leads en pipeline, no clientes)

---

## SCHEDULE / EJECUCIÓN

Correr **manualmente por Jorge** la primera vez con `DRY_RUN=true` para verificar output.

Después del OK de Jorge → correr sin DRY_RUN.

Frecuencia sugerida: **semanal** (viernes o lunes por la mañana). Agregar al crontab:
```bash
# Review requests — lunes 9am Central (15:00 UTC)
0 15 * * 1 cd /opt/alex-bot && DRY_RUN=false node agents/review_request/review_request.mjs >> /opt/alex-bot/logs/review_request.log 2>&1
```

**IMPORTANTE:** Confirmar el crontab entry con Jorge antes de agregar.

---

## CHECKLIST PARA CC

- [ ] Verificar `TWILIO_*` credentials en `/opt/alex-bot/.env`
- [ ] Confirmar `GOOGLE_REVIEW_URL` con Jorge (agregar al `.env`)
- [ ] Crear campo `Review Requested At` (Date) en Geo_Leads via Airtable
- [ ] Anotar el field ID del nuevo campo y actualizar `markRequested()`
- [ ] Instalar twilio: `cd /opt/alex-bot && npm install twilio`
- [ ] Primera ejecución: `DRY_RUN=true node agents/review_request/review_request.mjs`
- [ ] Mostrar output a Jorge para aprobación
- [ ] Ejecución real solo después de OK de Jorge

---

## SEGURIDAD

- NUNCA enviar a DNC=true
- NUNCA re-enviar dentro de 30 días
- NUNCA tocar `/opt/alex-bot` crontab sin confirmar con Jorge
- DRY_RUN=true obligatorio en primera prueba
- Loggear cada envío con timestamp en `/opt/alex-bot/logs/review_request.log`
