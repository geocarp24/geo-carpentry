# HANDOFF — Lead Capture: Website → Airtable → Dashboard
> Creado por: Cowork (CW) | Fecha: 2026-06-04 | Para: Claude Code (CC)
> Sprint: Track 1 (Revenue path — Lead Capture)

---

## Objetivo

Conectar el quote form de geocarpentry.com a Airtable `Geo_Leads` + Telegram notification + dashboard pipeline en InvestorOS.

## Estado actual (auditado por CW)

El website tiene:
1. **Popup form** (WPCode) — solo email + newsletter, no captura lead completo
2. **Quote form** (OttoKit, en homepage y `/quote/`) — campos completos:
   - First Name, Last Name, Phone, Email, Address, City, State, Zip
   - Service (dropdown), Budget (dropdown), Timeline (dropdown)
   - Project description (textarea), Preferred contact (radio)

**Problema:** submissions actuales van solo a email (admin@geocarpentry.com). No hay registro en Airtable, no hay Telegram alert, no hay pipeline view.

---

## Entregables de CW (listos para integrar)

| Archivo | Descripción |
|---|---|
| `apps/investoros/src/app/api/leads/intake/route.ts` | POST endpoint que recibe form data → Airtable + Telegram + email |
| `apps/investoros/src/app/(dashboard)/geo/leads/page.tsx` | Pipeline view: New / Contacted / Quoted / Won / Lost |

---

## Acciones de CC

### 1. Copiar los archivos de CW al repo

Los archivos están en `Memory Claude/02_handoffs/code/`:
- `lead-intake-route.ts` → `apps/investoros/src/app/api/leads/intake/route.ts`
- `leads-page.tsx` → `apps/investoros/src/app/(dashboard)/geo/leads/page.tsx`

### 2. Agregar env vars en Vercel

```
AIRTABLE_TOKEN_GEO=<tu_airtable_pat>  <!-- token redactado para seguridad en repo -->
TELEGRAM_BOT_TOKEN=<ya existente>
TELEGRAM_CHAT_ID=8402370952
RESEND_API_KEY=<si usa Resend para email>
LEAD_INTAKE_SECRET=geo_lead_intake_2026_secret
```

### 3. Conectar OttoKit al webhook

En WP Admin → OttoKit → Form → Actions → Add Action → Webhook:
- **URL:** `https://investoros-web.vercel.app/api/leads/intake`
- **Method:** POST
- **Headers:** `{"x-secret": "geo_lead_intake_2026_secret"}`
- **Body (JSON):**
```json
{
  "first_name": "{{field:first-name}}",
  "last_name": "{{field:last-name}}",
  "phone": "{{field:phone-number}}",
  "email": "{{field:email-address}}",
  "address": "{{field:address-line-1}}",
  "city": "{{field:city}}",
  "service": "{{field:service-interested-in}}",
  "budget": "{{field:approximate-budget}}",
  "timeline": "{{field:when-do-you-want-to-start}}",
  "description": "{{field:tell-us-about-your-project}}",
  "contact_method": "{{field:preferred-contact-method}}"
}
```

**Nota:** Field names son los slugs exactos de OttoKit. Verifica en el editor del form.

### 4. Test end-to-end

```bash
curl -X POST https://investoros-web.vercel.app/api/leads/intake \
  -H "Content-Type: application/json" \
  -H "x-secret: geo_lead_intake_2026_secret" \
  -d '{"first_name":"Test","last_name":"Lead","phone":"9205551234","email":"test@test.com","service":"Kitchen Remodeling","budget":"$10,000 – $25,000","timeline":"ASAP / Within 1 month","description":"Kitchen remodel test","city":"Green Bay"}'
```

Verificar en Airtable Geo_Leads (tblaH41HWeVG9ZXLn) y Telegram.

---

## Airtable field mapping

| Form field | Airtable field | Field ID |
|---|---|---|
| first_name + last_name | Full Name | fldUqmulwBHGQCcxh |
| phone | Phone | fldpKCnwHhMYvREDj |
| service | Service Type | fldlodk6IixfV9zq1 |
| budget | Budget Range | fld3ugY0qE3ICqLxg |
| timeline | Timeline | fldTC8f7KZs3Slt9p |
| description + email | Project Description | fldHs8w5ZfR2ZfnLv |
| address | Home Address | fldsuXfxHwjnzclst |
| city | City | fldy1PonJ9ITQrLLx |
| — | Source | fld14TGNaLk0RvkYf |
| — | Lead Status = "New Lead" | fldytSAwcOBwqwUd2 |
| — | Language = "English" | fld5vXtGIvU1unHuR |

---

## Lead Status options (pipeline stages)

`New Lead` → `Contacted` → `Appointment Set` → `Quoted` → `Won` / `Lost` / `DNC`

---

## Notes

- El endpoint usa `x-secret` header para autenticación básica (no HMAC para simplicidad del WP form)
- El email notification usa Telegram primero (ya configurado). Para email usa Resend si está disponible, sino skip
- El campo `email` va dentro de `Project Description` como nota porque Geo_Leads no tiene campo email nativo
- CC: si quieres agregar campo `Email` a Geo_Leads Airtable, hazlo antes de integrar
