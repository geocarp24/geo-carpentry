# Geo Carpentry CRM — Airtable Schema Spec

**Plan:** Fase 0 Track B — Setup Airtable CRM Geo (clonado de Pinnacle, simplificado).

**Cómo crear la base:**
1. Login a https://airtable.com
2. Add a base → "Start from scratch" → nombrarla **"Geo Carpentry CRM"**
3. Crear las 6 tablas abajo (orden importa por relaciones)
4. Compartir base con `deals@pinnaclegroupwi.com` con permisos `Creator` para que el sistema pueda escribir/leer
5. Copiar el Base ID (algo como `appXXXXXXXXXX`) y pasarmelo

**Equivalencia con InvestorOS:** este schema es la plantilla del módulo **CRM Multi-Tenant** que cualquier tenant nuevo recibe al onboarding.

---

## Tabla 1: **Contacts** (clientes y prospectos)

| Campo | Tipo | Notas |
|---|---|---|
| Name | Single line text | Primary field |
| Email | Email | |
| Phone | Phone | |
| Address | Single line text | Calle + número |
| City | Single select | Green Bay, Howard, De Pere, Allouez, Bellevue, Suamico, Appleton, Oshkosh, Other |
| Source | Single select | Google, Facebook Page, FB Marketplace, FB Group, Google Maps, Referral, Door Hanger, Permits Scraper, Walk-in, Repeat Customer, Other |
| Tags | Multi-select | VIP, Hot, Warm, Cold, Repeat, Referrer |
| First contact date | Date | Auto-fill al crear |
| Last contact date | Date | Update con cada actividad |
| Notes | Long text | |
| Leads (link) | Link to Leads | Multiple |
| Jobs (link) | Link to Jobs | Multiple |
| Referrer (link) | Link to Contacts | Self-reference para programa de referidos |

---

## Tabla 2: **Leads** (oportunidades antes de cerrar contrato)

| Campo | Tipo | Notas |
|---|---|---|
| Lead ID | Autonumber | Primary |
| Contact (link) | Link to Contacts | Single |
| Service | Single select | Deck Building, Deck Repair, Kitchen Remodel, Bathroom Remodel, Home Addition, Framing, Drywall, Painting, Roofing, Finish Carpentry, General Repair, Custom |
| Description | Long text | Lo que pide el cliente, alcance |
| Photos | Attachments | Fotos enviadas por el cliente |
| Stage | Single select | New, Quote Requested, Quote Sent, Negotiating, Won, Lost, Ghost |
| Estimated value | Currency (USD) | |
| Probability | Number (0-100) | |
| Estimated profit | Formula | `{Estimated value} * 0.3` (default 30% margin) |
| Created date | Created time | Auto |
| Next action | Single line text | Ej: "Llamar para visit", "Mandar quote" |
| Next action date | Date | |
| Assigned to | Single select | Jorge (default), [futuros sales] |
| Quote sent date | Date | |
| Won/Lost date | Date | |
| Loss reason | Single select | Price too high, Timeline, Hired Another, No Response, Out of scope, Other |
| Activities (link) | Link to Activities | Multiple |
| Job (link) | Link to Jobs | Single (si stage=Won) |

---

## Tabla 3: **Jobs** (contratos cerrados en ejecución)

| Campo | Tipo | Notas |
|---|---|---|
| Job ID | Autonumber | Primary |
| Lead (link) | Link to Leads | Single |
| Contact (lookup) | Lookup from Lead | |
| Service (lookup) | Lookup from Lead | |
| Contract value | Currency | |
| Materials cost | Currency | |
| Labor cost | Currency | (incluye subs) |
| Other costs | Currency | (permits, travel, etc.) |
| Total cost | Formula | `{Materials cost} + {Labor cost} + {Other costs}` |
| Profit | Formula | `{Contract value} - {Total cost}` |
| Margin % | Formula | `({Profit} / {Contract value}) * 100` |
| Start date | Date | |
| Estimated end date | Date | |
| Actual end date | Date | |
| Status | Single select | Scheduled, In Progress, On Hold, Completed, Cancelled |
| Subcontractors (link) | Link to Subcontractors | Multiple |
| Payment status | Single select | Unpaid, Deposit Paid (30%), Mid-payment (50%+30%), Paid Full |
| Invoice URL | URL | Link a Stripe invoice o PDF |
| Photos before | Attachments | |
| Photos during | Attachments | |
| Photos after | Attachments | |
| Review requested | Checkbox | True después de Completed |
| Review received | Checkbox | |

---

## Tabla 4: **Subcontractors**

| Campo | Tipo | Notas |
|---|---|---|
| Name | Single line text | Primary |
| Phone | Phone | |
| Email | Email | |
| Specialty | Multi-select | Framing, Electrical, Plumbing, Drywall, Painting, Roofing, Finish Carpentry, General, Tile, Concrete |
| Rate type | Single select | Hourly, Per project, Mixed |
| Rate value | Currency | (USD/hr o promedio per project) |
| Has license | Checkbox | |
| Has insurance | Checkbox | |
| Has truck | Checkbox | |
| Referenced by | Single line text | |
| Rating | Rating (1-5) | |
| Active | Checkbox | |
| Joined date | Date | |
| Jobs (link) | Link to Jobs | Multiple |
| Notes | Long text | |

---

## Tabla 5: **Activities** (log de cada interacción)

| Campo | Tipo | Notas |
|---|---|---|
| Activity ID | Autonumber | Primary |
| Date | Date with time | |
| Type | Single select | Call, Email Sent, Email Received, SMS Sent, SMS Received, Visit, Quote Sent, Estimate Visit, Job Update, Payment Received, Review |
| Contact (link) | Link to Contacts | Single |
| Lead (link) | Link to Leads | Single (opcional) |
| Job (link) | Link to Jobs | Single (opcional) |
| Outcome | Single line text | Ej: "Quote aceptado", "Sin respuesta", "Reagenda visita" |
| Notes | Long text | |
| Created by | Single select | Jorge, ALEX bot, Auto-system |

---

## Tabla 6: **Permits Intel** (de Permits Scraper — Fase 2)

| Campo | Tipo | Notas |
|---|---|---|
| Permit number | Single line text | Primary |
| Date issued | Date | |
| County | Single select | Brown, Outagamie, Winnebago, Calumet, Door, Marinette, Other WI |
| Owner name | Single line text | |
| Address | Single line text | |
| City | Single line text | |
| Service type | Single select | Deck, Kitchen, Bathroom, Addition, Framing, Roof, Garage, New Build, Other |
| Estimated project value | Currency | (si el permit lo declara) |
| Status | Single select | New, Called, Quoted, Won, Lost, No Contact Info |
| First call date | Date | |
| Contact (link) | Link to Contacts | Si se logra contactar |
| Lead (link) | Link to Leads | Si se convierte |
| Notes | Long text | |

---

## Views recomendadas (post-creación)

**Leads:**
- "🔥 Hot This Week" — filter: Stage=Negotiating OR Quote Sent, Next action date ≤ 7 días
- "📋 Need Quote" — Stage=New OR Quote Requested
- "💸 Won Recent" — Stage=Won, sorted by Won/Lost date desc
- "❄️ Cold Pipeline" — Stage=Ghost, sorted by Last contact date asc (re-engage candidates)

**Jobs:**
- "🚧 In Progress" — Status=In Progress
- "💰 Awaiting Payment" — Status=Completed AND Payment status≠Paid Full
- "📸 Need Photos" — Status=Completed AND Photos after is empty (review trigger)

**Contacts:**
- "⭐ VIP & Repeat" — Tags contains VIP OR Repeat
- "🎁 Referral Sources" — Tags contains Referrer

**Activities:**
- "📞 This Week's Calls" — Type=Call, Date last 7 days

---

## Métricas a calcular (dashboards)

Una vez con datos:
- **Conversion lead→quote:** count Leads Stage=Quote Sent / count Leads
- **Conversion quote→close:** count Leads Stage=Won / count Leads Stage=Quote Sent
- **Avg contract value:** avg Contract value en Jobs status=Completed
- **Avg margin %:** avg Margin % en Jobs status=Completed
- **Pipeline value:** sum(Estimated value × Probability) for Stage in [Quote Sent, Negotiating]
- **Profit this week:** sum Profit for Jobs with Actual end date in last 7 days

---

## Next steps

1. Jorge crea base "Geo Carpentry CRM" en Airtable con las 6 tablas
2. Jorge comparte con `deals@pinnaclegroupwi.com` con permisos Creator
3. Jorge me pasa el Base ID
4. Yo escribo helper scripts (`automation/airtable/upsert_lead.py`, etc.) para integraciones automáticas
5. Yo conecto el formulario WP → Airtable (Fase 1)

**Tiempo estimado para crear la base manualmente: 30-40 min.**

**Alternativa rápida:** Jorge crea base vacía + me da Base ID, yo populo todas las tablas + campos via API en ~5 min.
