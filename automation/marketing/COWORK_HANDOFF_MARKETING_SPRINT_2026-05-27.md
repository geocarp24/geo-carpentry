# HANDOFF → COWORK (claude.ai) — Marketing Sprint Geo Carpentry

**De:** Claude Code (Jorge's infra agent)
**Para:** Cowork (claude.ai) — content + creative + strategy agent
**Fecha:** 2026-05-27
**Objetivo:** lead generation + customer acquisition para Geo Carpentry, $0 budget, ROI medible en 30-90 días

---

## ⚡ TL;DR

Jorge necesita **MARKETING REAL para captar clientes**, no más infra. Vos (Cowork) ejecutás 4 campañas integrales de lead gen, yo (Claude Code) deploy/automatizo, Jorge ejecuta tasks físicas (printing, in-person, approve).

**Sprint Semana 1 (ahora):** Campañas 1 + 2 (digital, automatable).
**Sprint Semana 2-3:** Campañas 3 + 4 (networking + físico).

---

## 📋 Contexto necesario antes de empezar

### Quién es Geo Carpentry
- **LLC** fundada 2014, owner **Jorge Cruz**, Green Bay WI
- **General Contractor** (NO "remodeler" — esta es la keyword principal)
- **Bilingüe EN/ES** — owner habla español nativo, sirve audiencia Latino NE Wisconsin (15% pop)
- Website: `https://geocarpentry.com`
- Phone: `(920) 367-1272` | WhatsApp: `+19209340351`
- Email business: `admin@geocarpentry.com` (NUNCA usar `geocarpentryllc@gmail.com` que es personal de Jorge)
- Address: 735 E Walnut St Suite 3, Green Bay, WI

### Tenant config (read this FIRST)
- File: `agents/tenants/geo-carpentry.json` (en repo InvestorOS)
- Tiene: brand colors, 6 servicios con price ranges + keywords, 17 cities target, GBP `place_id_cid: 17587388124165404013`, Airtable base IDs, voice/tone specs

### Brand kit (autoritativo — usar SIEMPRE)
- **Navy primary:** `#1B2A4A`
- **Orange accent:** `#FF6B00`
- **Tagline:** "Built to Last. Crafted with Pride."
- **Voice:** warm + professional + homeowner-friendly + bilingual-aware
- **NO usar** colores viejos `#0d2137` / `#c85a14` (legacy en workflow YAML)

### Constraints absolutos
- $0 budget para ads — todo orgánico
- Jorge disponible ~4h/día (lost his job, full focus en Geo + Pinnacle)
- Revenue target: **$3K/sem PROFIT NETO** (≈ 2 contratos cerrados/sem desde funnel ~24 leads/sem)
- Mobile-first **siempre** (mayoría tráfico real estate viene de mobile)
- License # + insurance carrier son **PRIVADOS** — nunca exponer en marketing público. Usar "Licensed & Insured" genérico.

### Audiencia target (primary persona)
- **Homeowners 35-65** en NE Wisconsin (Brown + Outagamie + Winnebago county)
- Median household income: $58-72K
- Home value: $185K-$340K
- Pain points: desconfían contratistas (timing + cost overruns), buscan "transparent pricing"
- Decision criteria: reviews online + word-of-mouth + GBP photos + license verification
- Hot triggers: kitchen 15+ años old, bathroom moisture damage, deck rotting, basement finish
- **Latino segment 15%** — quiere comunicación en español, valora referrals de familia

### Servicios (6) con ticket sizes
| Service | Ticket | Slug |
|---|---|---|
| Kitchen Remodeling | $5K-$30K | `kitchen-remodeling` |
| Bathroom Remodeling | $3K-$15K | `bathroom-remodeling` |
| Deck Building | $2K-$12K | `deck-building` |
| Finish Carpentry & Trim | $500-$8K | `finish-carpentry` |
| Home Renovation | $5K-$50K | `home-renovation` |
| General Construction | $3K-$100K+ | `general-construction` |

### Páginas existentes (no recrear, linkear desde marketing)
- 30 city-service pages live: `/{service-slug}/{city}-wi/` (Green Bay, Appleton, Oshkosh, De Pere, Howard × 6 servicios)
- 6 service hub pages: `/{service-slug}/`
- Homepage: `/`
- Contact: `/contact/` (con Quote Form ID 2340)
- Thank-you: `/thank-you/` (GTM conversion tracking aquí)

### Airtable Geo (source of truth)
- **Base ID:** `appAQpveuAec077jF`
- **URL:** https://airtable.com/appAQpveuAec077jF
- **Token env var:** `AIRTABLE_TOKEN_GEO` (Cowork debe pedir a Jorge cuando deba escribir)

| Tabla | ID | Uso en marketing |
|---|---|---|
| Contacts | `tbldetnRGCnmHDgFw` | Past clients para Campaña 2 |
| Leads | `tblVqrROrVspFXniG` | Nuevos leads de las campañas |
| Jobs | `tblRlPhcwiGP7J8LS` | Trigger para review request post-completion |
| Subcontractors | `tbldciY36E08UEEua` | (no relevante esta sprint) |
| Activities | `tblWbxNNyGzRhdIwF` | Log de touches (emails, SMS, calls) |
| Marketing_Audits | `tbld7LtJzeN5QTHPo` | Score baseline 58/100 (Mercader detectó) |
| Content_Queue | `tblpiN42pK3YFxGEW` | Donde ya están las 30 city-service pages |

### Marketing baseline (Mercader audit 2026-05-27)
- **Overall: 58/100** (warn)
- Performance mobile: 38 ← LCP killer (hero PNG, fixed con WebP 2026-05-27)
- Accessibility: 74 ← logo alt fixed 2026-05-27
- SEO: 88 ✓
- Conversion/CTA: 52 ← **PRIORIDAD: quote form 7→3 fields, CTAs débiles**
- Mobile-first: 55 ← Sticky CTA OK pero forms no son thumbs-friendly

### Skills Cowork debería invocar
| Tarea | Skill |
|---|---|
| Copy emails / SMS / scripts | `copywriting`, `email-marketing` |
| GBP posts + local SEO | `local-seo`, `gmb-optimization`, `seo-content` |
| Door hanger creative | `print-design`, `direct-mail`, `brand-design` |
| Partner outreach pitch deck | `b2b-sales`, `pitch-deck-design` |
| Lead magnet PDFs | `content-marketing`, `lead-magnet-design` |
| Visual briefs (photos, posts) | `design-taste-frontend`, `imagegen-frontend-mobile`, `brandkit` |
| Translation EN→ES | `bilingual-content`, `latino-marketing` |
| Audience research (zip codes, partners) | `competitive-intel`, `local-research` |
| Conversion copy | `cro-copywriting`, `landing-page-optimization` |

---

## 🎯 CAMPAÑA 1 — Operación "Local Domination" (GBP + Reviews)

**Objetivo:** ser TOP 3 Maps Pack Green Bay para "general contractor" + 5 cities NE WI. Subir reviews 4 → 25 en 60 días.

**Hipótesis revenue:** Maps Pack top 3 = 60% del organic lead flow local. Cada 5 reviews subidos = +0.5 stars = +20% CTR Maps.

### Deliverables Cowork (en este orden)

#### 1.A — 30 GBP Posts (1/día × 30 días)
**Formato output:** crear **nueva tabla** en Airtable Geo base llamada `GBP_Content_Queue` (Cowork debe pedir a Claude Code que la cree primero) con estos campos por record:

| Field | Type | Description |
|---|---|---|
| Day | Number | 1-30 (orden cronológico) |
| Post_Type | Single Select | Update / Offer / Event / Product |
| Service_Tag | Single Select | kitchen / bath / deck / trim / renovation / general |
| City_Tag | Single Select | green-bay / appleton / oshkosh / de-pere / howard / general |
| Headline_EN | Single Line | <300 chars |
| Body_EN | Long Text | <1500 chars, GBP-optimized |
| Headline_ES | Single Line | <300 chars Spanish |
| Body_ES | Long Text | <1500 chars Spanish |
| CTA_Button | Single Select | Learn more / Call now / Get quote / Visit website |
| CTA_URL | URL | Linkea a /{service}/{city}-wi/ relevante o /contact/ |
| Visual_Brief | Long Text | Qué fotografiar (ángulo, lighting, before/after specs) |
| Visual_Style | Single Select | Real_Project / Branded_Graphic / Quote_Card |
| Hashtags | Long Text | 5-10 hashtags relevantes |
| Schedule_DateTime | DateTime | Mar/Jue/Sab 10am-12pm CST (optimal GBP engagement window) |
| Status | Single Select | Draft / Approved / Published |

**Topic mix (30 posts):**
- 8 project showcases (before/after de jobs reales — Cowork escribe template, Jorge llena fotos)
- 6 educational (kitchen cost guide, bath ROI, deck permit Brown County, etc.)
- 4 seasonal CTAs (spring refresh, holiday-ready, winter prep)
- 4 testimonials de clientes existentes
- 4 service spotlights (uno por servicio top 4)
- 2 community involvement (sponsorships, local events si Jorge tiene)
- 2 team intro (Jorge presentation, bilingual)

#### 1.B — 20 Q&A Pre-pobladas para GBP
Same Airtable, tabla `GBP_QA_Bank`:
| Field | Type |
|---|---|
| Question_EN | Long Text |
| Answer_EN | Long Text (<500 chars, conversational) |
| Question_ES | Long Text |
| Answer_ES | Long Text |
| Category | Single Select (Pricing / Process / Service / Trust / Other) |
| Priority | Number 1-3 |

**Topics:**
- "How much does a kitchen remodel cost in Green Bay?"
- "Are you licensed and insured?"
- "Do you speak Spanish?" (yes — diferenciador competitivo)
- "How long does a bathroom remodel take?"
- "Do you offer financing?"
- "What areas do you serve?"
- ... (20 total, Cowork research común queries)

#### 1.C — Review Request System
**Output:** archivo en repo `automation/marketing/review_request_system.md` con:
1. **SMS template** (2 variants — neutral + warm/Latino-friendly) — <160 chars, link directo a Google review shortlink
2. **Email template** (HTML responsive, branded Navy+Orange) — subject + body + button
3. **Verbal script** para Jorge cuando entrega final invoice — exactamente qué decir + cómo manejar objeciones ("no tengo cuenta Google")
4. **Follow-up template** 7 días después si no hay review (gentle nudge)
5. **Google review shortlink** instrucciones (Cowork investiga el shortlink format usando place_id_cid `17587388124165404013`)

#### 1.D — Photo Brief Mensual
**Output:** archivo `automation/marketing/photo_brief_monthly.md` — Jorge va a renovar fotos GBP cada mes. Cowork escribe:
- 10 angles obligatorios por proyecto (wide kitchen, close-up cabinet detail, before/after side-by-side, etc.)
- Lighting requirements (golden hour vs flash, no fluorescent)
- Composition rules (rule of thirds, lead lines, scale references)
- Alt text auto-generation template (con ciudad + servicio para SEO)
- File naming convention para upload al Library

### Mi rol (Claude Code) post-Cowork
1. Crear tablas Airtable `GBP_Content_Queue` + `GBP_QA_Bank` con schemas above
2. Wire **OttoKit GBP module** para publicar 1 post/día desde Airtable (status=Approved → publish a GBP)
3. Wire **automation post-Job completion**: cuando Jorge mueve un Job a "Completed" → trigger SMS via SureMail/OttoKit con review link → log en Activities
4. Deploy review shortlink en homepage footer + /thank-you page

### Jorge tasks
1. Approve 30 GBP posts en batch (Airtable Filter View `Status=Draft`)
2. Subir fotos según brief (10 min × 4 días = 40 min/mes)
3. Responder Q&As que GBP genere orgánicamente (5 min/sem)
4. Pedir review verbal en cada job final (script + automation backup)

**Timeline:** Cowork entrega en 3-4 días. Deploy Claude Code 1 día. First posts live día 5.

---

## 🎯 CAMPAÑA 2 — Past Client Reactivation Blitz

**Objetivo:** monetizar clientes 2014-2025 — el activo subutilizado #1. Cada past client = potencial referral + repeat revenue.

**Hipótesis revenue:** 12 años × ~30 clientes/año = 360 contactos potenciales en Airtable Contacts. Con 1% conversion = 3-4 leads/mes desde este canal solo.

### Deliverables Cowork

#### 2.A — Past Client Audit
**Output:** archivo `automation/marketing/past_client_audit.md` con:
- Conteo real (Cowork pide acceso a Airtable Contacts via Jorge)
- Segmentación: Year_of_Job × Service × City × Last_Contact
- Identificar "warm" (último contacto <12 meses) vs "cold" (>12 meses)
- Flag clientes con `Source="Word of Mouth"` o `Notes` mentioning referral (= ya son advocates, prioritize)

#### 2.B — 5-Touch Reactivation Sequence (EN + ES)
**Output:** archivo `automation/marketing/reactivation_sequence.md` con 5 emails + SMS variants:

| Touch | Day | Channel | Subject_EN | Subject_ES | Goal |
|---|---|---|---|---|---|
| 1 | 0 | Email | "Hi {first_name} — Jorge from Geo Carpentry" | "Hola {first_name} — Jorge de Geo Carpentry" | Re-introduce, no pitch |
| 2 | 7 | Email | "Spring touch-ups for {city} homeowners" | "Refresh de primavera para {city}" | Seasonal soft offer |
| 3 | 14 | SMS | "Hey {first_name}! Quick favor..." | "Hola {first_name}! Un favor..." | Referral incentive |
| 4 | 21 | Email | "What we just finished in {neighborhood}" | "Lo que acabamos en {neighborhood}" | Case study, local proof |
| 5 | 30 | WhatsApp | "Personal check-in" | "Saludos personal" | Direct convo invite |

Cada touch incluye:
- HTML email responsive (use existing brand kit Navy+Orange)
- Plain text fallback
- Subject line A/B test variants (2 per email)
- Personalization tokens: `{first_name}`, `{city}`, `{last_service}`, `{years_since_job}`
- CTA button text + URL

#### 2.C — Referral Program
**Output:** archivo `automation/marketing/referral_program.md` con:
- **Offer:** "$200 Home Depot gift card por cada referido que firme contrato ≥$3K"
- **Landing page copy** para `/refer-a-friend` (EN + ES) — Cowork escribe full page HTML
- **Tracking mechanism:** formulario simple "Who referred you?" en lead capture
- **Reward fulfillment** workflow (Cowork escribe email template + Jorge envía physical card)
- **Social shareable cards** (4 variants para FB/WhatsApp share — Cowork visual brief)

#### 2.D — Landing page `/refer-a-friend`
**Output:** archivo `automation/marketing/landing_refer_a_friend.md` con:
- Full HTML body (será injected via WPCode snippet)
- Mobile-first responsive CSS inline
- Form fields: Referrer name + Referee name + Referee phone + Service interest
- Trust elements: testimonials de past clients, "How it works" 3-step visual
- Bilingual toggle EN/ES (or 2 separate pages /refer-a-friend + /referencia)

### Mi rol (Claude Code) post-Cowork
1. **Wire 5-touch sequence** via SureMail (drip) + OttoKit (SMS + WhatsApp) — cada touch tiene trigger condicional (no send si lead respondió ya)
2. **Deploy landing page** `/refer-a-friend` como WP page + WPCode snippet con form handler
3. **Airtable automation:** cuando llega referral → auto-tag referrer en Activities + start sequence "thank referrer" → notify Jorge en Telegram
4. **Track conversion** via UTM params + Airtable Source="Referral - {referrer_name}"

### Jorge tasks
1. Approve all 5 emails + SMS copy (1 lectura + ajustes minores)
2. Decide referral incentive amount ($200? $300? gift card vs cash?)
3. Subir fotos de proyectos para Touch 4 (case study)
4. Recibir + responder personal Touch 5 (WhatsApp directo — Jorge hace este touch él mismo)

**Timeline:** Cowork entrega en 2-3 días. Deploy Claude Code 1 día. First emails send día 4 a primer batch 20 past clients.

---

## 🎯 CAMPAÑA 3 — Realtor + Home Inspector Partnership Network

**Objetivo:** crear referral network de 30 profesionales que YA hablan con homeowners listos para renovar.

**Hipótesis revenue:** 1 realtor activo = 1-3 referrals/mes. Goal 5 partners activos en 60 días = 5-15 leads/mes calificados (high-intent).

### Deliverables Cowork

#### 3.A — Partner Research List
**Output:** crear nueva tabla en Airtable Geo llamada `Partners` (Claude Code crea schema):

| Field | Type |
|---|---|
| Name | Single Line |
| Role | Single Select (Realtor / Home Inspector / Architect / Designer / Other) |
| Company | Single Line |
| Email | Email |
| Phone | Phone |
| LinkedIn | URL |
| City | Single Select |
| Sales_Volume_Annual | Number (realtors only) |
| Years_Experience | Number |
| Stage | Single Select (Researched / Contacted / Meeting Scheduled / Active / Inactive) |
| Last_Contact | Date |
| Notes | Long Text |
| Source_of_Lead | Single Line (Zillow, Realtor.com, NWAR, etc.) |

**Research scope:**
- **20 Realtors** top-volume NE Wisconsin (Green Bay, Howard, De Pere, Appleton priority). Sources: Zillow agent finder, Realtor.com, Northeast WI Realtors Assn (NWAR), LinkedIn.
- **10 Home Inspectors** Brown + Outagamie county. Sources: ASHI directory, InterNACHI, Yelp.

Cada record con datos verificables (Cowork no inventa — usa `competitive-intel` skill + web research).

#### 3.B — Pitch Deck PDF (8 slides)
**Output:** archivo `automation/marketing/partner_pitch_deck.md` con HTML+CSS source que Claude Code renderea a PDF (Puppeteer).

**Slides:**
1. Cover: "Preferred Contractor para tus clientes" + Jorge photo
2. Quien es Geo Carpentry (12 yrs, licensed, bilingual)
3. Why partner con nosotros (3 reasons: speed, reliability, communication)
4. Servicios offered + ticket sizes (table)
5. Process: cliente referred → walkthrough → estimate → contract → completion (5 steps with timeline)
6. **Commission structure:** **5% del valor del contrato pagado al partner al cierre** (Cowork formula este pitch)
7. Social proof: 3 testimonials + photo grid past projects
8. Next steps: "15-min call to walk through"

**Style:** clean, professional, Navy+Orange branded, EN-first (ES version Phase 2 si se justifica).

#### 3.C — 4-Touch Outreach Sequence
**Output:** archivo `automation/marketing/partner_outreach.md` con:

| Touch | Channel | Day | Goal |
|---|---|---|---|
| 1 | Email + LinkedIn DM | 0 | Cold intro, mention 1 specific thing from their LinkedIn (humanize) |
| 2 | Email | 3 | Soft follow-up + send pitch deck PDF |
| 3 | LinkedIn DM | 7 | "Did you see my email? Happy to grab coffee" |
| 4 | Email | 14 | Final touch + provide value (free article: "Top 5 contractor questions buyers ask") |

Cada touch:
- Subject line (2 A/B variants)
- Email body con tokens: `{first_name}`, `{company}`, `{specific_thing_about_them}`
- Personalization research checklist para Jorge (qué buscar en LinkedIn antes de mandar Touch 1)

#### 3.D — One-Page Collateral
**Output:** archivo `automation/marketing/partner_collateral_one_pager.md` — un printable PDF que partners pueden entregar a clientes:
- Front: Jorge headshot + "Recommended General Contractor" + 3 servicios top + phone + QR a website
- Back: 3 testimonials + photos before/after + "Mention {Partner_Company} for priority scheduling"

### Mi rol (Claude Code) post-Cowork
1. Crear tabla `Partners` en Airtable Geo + import los 30 records
2. Render pitch deck Markdown → PDF via Puppeteer (output `/automation/marketing/output/Geo_Partner_Pitch_2026.pdf`)
3. Wire outreach sequence via Gmail API (Jorge sends from `admin@geocarpentry.com`)
4. **Weekly reminder cron:** cada lunes, ALEX manda Telegram a Jorge: "Esta semana follow-up con: {Partner1, Partner2, Partner3}" basado en `Last_Contact` + `Stage`
5. Track conversion: cuando entra lead via Partner → auto-tag Source="Partner - {Partner_Name}" + notify partner via email

### Jorge tasks
1. Approve pitch deck design
2. Approve outreach sequence copy
3. Personalize Touch 1 emails (5 min/partner × 30 = 2.5h spread over 2 weeks)
4. Take 5-10 coffee meetings (1h × 5-10 = 5-10h spread over 4 weeks)
5. Maintain `Partners` table — update `Stage` después de cada touch

**Timeline:** Cowork research + content 4-5 días. Claude Code deploy 2 días. First outreach send día 7. Expected first partner-sourced lead día 30.

---

## 🎯 CAMPAÑA 4 — Door Hanger + Direct Mail Localized

**Objetivo:** dominio físico de 3 neighborhoods Green Bay con high-intent profile (median income + home age + density).

**Hipótesis revenue:** 5,000 door hangers × 1-3% response = 50-150 inquiries × 10% qualified = 5-15 estimates × 30% close rate = 1-4 contracts. ROI: $150 print cost vs $5K-$30K kitchen contract = positive en 1 conversión.

### Deliverables Cowork

#### 4.A — Neighborhood Research
**Output:** archivo `automation/marketing/neighborhood_targeting.md` con:
- **3 Green Bay neighborhoods priority** ranked by:
  - Median income $65K-$95K (afford remodels)
  - Home age 25+ años (need remodels)
  - Owner-occupied % > 70% (no rentals)
  - Recent Geo project nearby (social proof)
- Por neighborhood: zip code, est. household count, demographic notes, why this neighborhood

Sugerencias preliminares (Cowork valida con data):
- **East Side Green Bay** (54302 / 54311) — mature homes, mid-high income
- **Howard / Suamico corridor** — new growth, families remodeling first homes
- **De Pere West** — established, owner-occupied, kitchen-remodel age cohort

#### 4.B — Door Hanger Design (3 variants)
**Output:** 3 PDFs print-ready en `automation/marketing/door_hangers/` + source HTML en `automation/marketing/door_hangers_source.md`

**Each hanger:**
- 4.25" × 11" trim, full bleed
- **Front:** Hero photo de proyecto local real (Jorge proporciona 3 fotos) + headline + tagline
- **Back:** 3 service offerings + "Free 30-min consultation" CTA + QR code + phone + license badge "Licensed & Insured"
- **Bilingual:** EN dominant, ES secondary line per section
- **Variants:**
  - V1 — Kitchen (target neighborhoods with kitchens 15+ yrs)
  - V2 — Deck (target neighborhoods with backyards)
  - V3 — Bathroom (mass-market, all neighborhoods)

**QR codes:** unique per neighborhood-variant combo (= 9 QR codes total) → tracking landing `/promo-{neighborhood}-{variant}` → Airtable Source field captures.

#### 4.C — 3 Promo Landing Pages
**Output:** `automation/marketing/promo_landings.md` con HTML+CSS de las 3 promo pages:
- `/promo-east-side-green-bay` (V1 kitchen + V3 bath)
- `/promo-howard-suamico` (V2 deck + V3 bath)
- `/promo-de-pere-west` (V1 kitchen + V2 deck)

Cada page:
- Hero localized ("Hi East Side neighbor!") con nombre del neighborhood
- 3-field form (Name + Phone + "What are you thinking about?")
- Trust elements: "X projects completed in your neighborhood" (Jorge confirma número real)
- Mobile-first, < 2.5s LCP, no fluff

#### 4.D — Distribution Playbook
**Output:** `automation/marketing/door_hanger_playbook.md`:
- Print specs (paper weight, finish, vendor recs: Vistaprint $0.03/each, GotPrint, local printer Green Bay)
- Distribution methodology (door knob hangers vs porch placement, time of day, weather considerations)
- Legal/local rules (Green Bay solicitation ordinances if any)
- Tracking sheet template (zip × variant × day distributed × response rate)
- Hiring teen distributor script ($50/day, 500 hangers/day rate)

### Mi rol (Claude Code) post-Cowork
1. Render door hanger HTML → print-ready PDF via Puppeteer (CMYK + bleeds)
2. Generate 9 QR codes con goqr.me or qrcode lib → unique tracking URLs
3. Deploy 3 promo landing pages en WP (page templates inheritando service-city template)
4. Wire promo landings form → Airtable Leads con Source="Door Hanger - {zip}-{variant}"

### Jorge tasks
1. Approve 3 door hanger designs (Slack/preview before print)
2. Send 3 project photos para hero (1 photo × neighborhood)
3. Order print (~$150 for 5,000 hangers Vistaprint)
4. Distribute (himself Sundays 9-12am or hire teen $50/day × 10 days = $500)
5. Walk neighborhoods personally during distribution — extra trust signal

**Timeline:** Cowork creative 3-4 días. Claude Code render + deploy 2 días. Print order day 7. Distribution start day 10. First leads expected day 12-14.

---

## 📅 EJECUCIÓN SEQUENCING

### Semana 1 (May 28 - Jun 3) — Digital Quick Wins
- **Day 1-3:** Cowork ejecuta Campaña 2 (Past Client Reactivation) — fastest, leverage existing assets
- **Day 1-3 (paralelo):** Cowork audit Airtable Contacts + entrega lista past clients
- **Day 4-5:** Jorge approves Campaña 2 + Claude Code deploys
- **Day 4-7:** Cowork ejecuta Campaña 1 (GBP + Reviews) — 30 days content batch

### Semana 2 (Jun 4 - Jun 10) — Networking + Físico
- **Day 8-12:** Cowork ejecuta Campaña 3 (Partnerships) — research-heavy
- **Day 11-14:** Cowork ejecuta Campaña 4 (Door Hangers) — creative-heavy

### Semana 3 (Jun 11 - Jun 17) — Deploy + Launch
- **Day 15-17:** Claude Code deploys Campañas 3 + 4
- **Day 17-18:** Jorge approves print + outreach
- **Day 19-21:** Jorge starts distribution + outreach

### Semana 4-12 (Jun 18 - Sep) — Optimization
- Mercader audits weekly tracking score deltas
- Posicionador tracks rank progression
- Jorge + ALEX adjust based on conversion data
- Goal: **5 leads/sem** desde campañas combinadas para Septiembre

---

## 🚦 APPROVAL GATES (Jorge)

Cowork **NO ejecuta** sin estos approvals:

| Gate | When | What |
|---|---|---|
| G1 | Antes Campaña 1 | Approve GBP voice tone (Cowork manda 3 sample posts) |
| G2 | Antes Campaña 2 | Approve referral incentive ($200 vs $300 vs other) |
| G3 | Antes Campaña 3 | Approve pitch deck design + commission % (5% vs other) |
| G4 | Antes Campaña 4 | Approve neighborhood targeting + door hanger design |
| G5 | Antes Claude Code deploy | Jorge revisa final Airtable batch + da go |

Cowork manda samples via handoff back a Claude Code, Claude Code muestra a Jorge en Telegram/IDE.

---

## 📤 HANDOFF BACK A CLAUDE CODE

Cuando Cowork termine cada deliverable, devuelve un handoff message structured así:

```
HANDOFF → CLAUDE CODE
Campaign: {Campaña #}
Deliverable: {1.A / 2.B / etc.}
Status: complete | needs_jorge_approval | blocked

Location:
- Airtable: {base + table + filter}
- Files added: {paths in geo-carpentry repo}
- Files modified: {paths}

Jorge actions required (with time estimate):
- {action 1 — X min}
- {action 2 — Y min}

Claude Code next actions:
- {task 1}
- {task 2}

Dependencies:
- {what must exist before next step}

Notes / decisions Cowork hizo unilateralmente:
- {decision + reasoning}
```

---

## 🔐 SECURITY + ACCESS

**Lo que Cowork NO puede tocar:**
- Wordpress wp-admin directo (Jorge edita manual — regla #2 de feedback memory)
- Credenciales (`AIRTABLE_TOKEN_GEO`, `WEBHOOK_SECRET`, `SSH_PASSWORD`, GHCR tokens) — nunca en chat ni en archivos repo
- License # + insurance carrier (privados — regla feedback)
- Personal email Jorge `geocarpentryllc@gmail.com` — usar siempre `admin@geocarpentry.com`

**Lo que Cowork SÍ hace:**
- Airtable reads (con su Airtable MCP tool, base ID público)
- Repo file writes (markdown, HTML, CSS source)
- Research web (Bing/Google search) para partner lists, neighborhood demographics, competitor intel
- Sample copy generation para approval

**Lo que Claude Code hace post-Cowork:**
- Airtable writes con token (table creation, batch import)
- Wordpress deploys via SSH (mu-plugins, WPCode snippets, page templates)
- Vercel deploys (landing pages bajo InvestorOS dashboard si aplica)
- Automation wiring (OttoKit, SureMail, Telegram)
- Render Markdown → PDF via Puppeteer

---

## 🎯 SUCCESS METRICS (medibles 60-90 días)

| Metric | Baseline | 60-day target | 90-day target | Source |
|---|---|---|---|---|
| GBP reviews | 4 | 15 | 25 | Google Business Profile |
| Maps Pack ranking Green Bay "general contractor" | Not in top 10 | Top 5 | Top 3 | Posicionador maps_deep |
| Past client reactivation leads | 0 | 4 | 8 | Airtable Leads Source filter |
| Partner-sourced leads | 0 | 3 | 8 | Airtable Source="Partner - *" |
| Door hanger leads | 0 | 8 | 15 | Airtable Source="Door Hanger - *" |
| Total monthly leads | ~5 (current) | 25 | 40 | Airtable Leads count by month |
| Contracts closed/month | ~2 | 5 | 8 | Airtable Jobs Stage="Won" |
| Marketing audit score | 58 | 75 | 82 | Mercader cron weekly |

---

## ❓ COWORK TIENE PREGUNTAS?

Si Cowork necesita clarification antes de empezar, pingear a Claude Code (yo) via handoff message format:

```
HANDOFF → CLAUDE CODE (QUESTION)
Re: Campaign {#}, Deliverable {X.Y}
Question: {specific question}
Why blocking: {why this matters}
Cowork's preferred default if no answer in 2h: {default plan}
```

Yo respondo en <2h con clarification del Jefe (Jorge) o asumo el default si Jorge no responde.

---

## 🟢 GO LIVE

Jorge gives go-ahead → Claude Code envía este file a Cowork (paste el contenido o referencia URL repo `geocarp24/geo-carpentry/automation/marketing/COWORK_HANDOFF_MARKETING_SPRINT_2026-05-27.md`) → Cowork lee context + empezás Campaña 2 (highest priority, fastest path to revenue).

**Comando para empezar a Cowork:**
> "Ejecutá el Sprint Marketing Geo Carpentry según `automation/marketing/COWORK_HANDOFF_MARKETING_SPRINT_2026-05-27.md`. Empezá por Campaña 2 — Past Client Reactivation. Mandame samples cuando termines deliverable 2.A para approval gate G2."
