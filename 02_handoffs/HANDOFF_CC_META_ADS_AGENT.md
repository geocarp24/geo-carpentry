# HANDOFF — CC: Agente Meta Ads (meta_ads.mjs)
> Cowork → Claude Code | 2026-08-17
> APROBADO por Jorge: campañas, creativos, y presupuesto de $50/semana
> Objetivo: crear y lanzar las dos campañas en Meta con los creativos seleccionados

---

## Contexto rápido

- Geo Carpentry LLC tiene 6 followers en FB y 5 en IG → reach orgánico de ~3 personas
- Pipeline de contenido funciona (23 posts en Visual Listo, score ≥ 7)
- Problema: distribución, no contenido
- Solución aprobada: Meta Ads con objetivo Messages, $50/semana total
- Jorge revisó configuración y creativos → aprobación explícita documentada

---

## Estructura de campañas aprobada

### Campaña A — English speakers
| Parámetro | Valor |
|---|---|
| Nombre | `GEO_EN_Messages_2026` |
| Objetivo | `OUTCOME_ENGAGEMENT` → Messages |
| Presupuesto | $25/semana (weekly budget) |
| Plataformas | FB + IG |
| Targeting — Geo | Green Bay WI + 25 millas radio |
| Targeting — Edad | 35–65 |
| Targeting — Idioma | English |
| Targeting — Intereses | Home improvement, Kitchen remodel, Bathroom remodel, Deck building |
| Targeting — Income | Top 50% (equivale a ~$60k+ HH en esa área) |

### Campaña B — Hispanohablantes
| Parámetro | Valor |
|---|---|
| Nombre | `GEO_ES_Messages_2026` |
| Objetivo | `OUTCOME_ENGAGEMENT` → Messages |
| Presupuesto | $25/semana (weekly budget) |
| Plataformas | FB + IG |
| Targeting — Geo | Green Bay WI + 25 millas radio |
| Targeting — Edad | 30–60 |
| Targeting — Idioma | Spanish |
| Targeting — Intereses | Mejoras del hogar, Hispanic homeowners, Construcción |

---

## Creativos aprobados (6 posts, de Airtable Geo_Posts)

### Campaña A — English (3 posts)

| Record ID | Descripción | Plataforma | Score |
|---|---|---|---|
| `recwZtAefTuKE38MK` | Walk-In Tile Shower vs Tub — NE Wisconsin | IG | 9 |
| `recfsbjY7orovpqtW` | Walk-In Shower or Keep the Tub? Honest Answer | IG | 9 |
| `recRkHPWuZeyGUdY8` | You Asked for a Number. We Gave You One. | FB + IG | 8 |

### Campaña B — Spanish (3 posts)

| Record ID | Descripción | Plataforma | Score |
|---|---|---|---|
| `recoC1SMskMxPioXa` | Ducha de azulejo o tina — NE Wisconsin | IG | 9 |
| `rechU6hg8wNvz7ypS` | Cedro vs compuesto — inviernos de Wisconsin | FB | 9 |
| `rec8cthYFwuH6eE06` | Cocina de los 90s — Green Bay | IG | 8 |

Para cada record, obtener de Airtable:
- `Caption` → texto del anuncio
- `Image_URL` (o campo de imagen en Cloudinary) → creative visual
- `Target_Platform` → para saber si crear ad en FB, IG, o ambos

---

## Implementación técnica

### Paso 1 — Verificar pre-requisitos en VPS

```bash
ssh root@187.77.215.146

# 1. Confirmar que el token Meta tiene permisos ads_management
curl -s "https://graph.facebook.com/v19.0/me/permissions?access_token=$META_PAGE_TOKEN" | jq '.data[] | select(.permission | test("ads"))'
# Debe mostrar: ads_management + ads_read → granted

# 2. Obtener el Ad Account ID del negocio
curl -s "https://graph.facebook.com/v19.0/me/adaccounts?access_token=$META_PAGE_TOKEN&fields=id,name,account_status" | jq '.data'
# Guardar el "id" que empieza con "act_" → es el AD_ACCOUNT_ID

# 3. Verificar FB Page ID
# Conocido: 723873447473999

# 4. Verificar IG Business Account ID  
curl -s "https://graph.facebook.com/v19.0/723873447473999?fields=instagram_business_account&access_token=$META_PAGE_TOKEN" | jq '.instagram_business_account.id'
```

### Paso 2 — Crear el agente `meta_ads.mjs`

**Ruta:** `/opt/alex-bot/agents/meta_ads/meta_ads.mjs`

**Patrón de tenant config (igual que otros agentes):**
```javascript
import { readFile } from 'fs/promises';

const tenantSlug = process.env.TENANT_SLUG || 'geo-carpentry';
const tenantConfig = JSON.parse(
  await readFile(`/opt/alex-bot/agents/tenants/${tenantSlug}.json`, 'utf8')
);
// token_env contiene el NOMBRE de la variable de entorno, no el valor
const airtableToken = process.env[tenantConfig.airtable.token_env]; // → AIRTABLE_TOKEN_GEO
const baseId = tenantConfig.airtable.baseId; // → appAQpveuAec077jF
const metaToken = process.env.META_PAGE_TOKEN; // o equivalente en tenant config
```

**Flujo de creación (Meta Marketing API):**

```
1. Para cada campaña (A_EN y B_ES):
   a. POST /act_{AD_ACCOUNT_ID}/campaigns → obtener campaign_id
   b. POST /act_{AD_ACCOUNT_ID}/adsets → obtener adset_id (con targeting)
   c. Para cada creative (3 por campaña):
      i.  Leer caption + image_url de Airtable
      ii. POST /act_{AD_ACCOUNT_ID}/adcreatives → obtener creative_id
      iii. POST /act_{AD_ACCOUNT_ID}/ads → crear el ad (linking adset + creative)
```

**Endpoints principales:**

```javascript
const META_API = 'https://graph.facebook.com/v19.0';
const AD_ACCOUNT = 'act_XXXXXXXXX'; // reemplazar con el ID real del paso 1

// Crear campaña
await fetch(`${META_API}/${AD_ACCOUNT}/campaigns`, {
  method: 'POST',
  body: new URLSearchParams({
    name: 'GEO_EN_Messages_2026',
    objective: 'OUTCOME_ENGAGEMENT',
    status: 'PAUSED', // ← SIEMPRE PAUSED al crear, Jorge activa manualmente
    special_ad_categories: '[]',
    access_token: metaToken,
  })
});

// Crear ad set con targeting
await fetch(`${META_API}/${AD_ACCOUNT}/adsets`, {
  method: 'POST',
  body: new URLSearchParams({
    name: 'GEO_EN_HomeOwners_35_65_GreenBay',
    campaign_id: campaignId,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'CONVERSATIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    weekly_budget: '2500', // en centavos → $25
    targeting: JSON.stringify({
      geo_locations: {
        cities: [{ key: '2418943', radius: 25, distance_unit: 'mile' }]
        // Green Bay, WI → key '2418943' (verificar en API)
      },
      age_min: 35,
      age_max: 65,
      locales: [6], // English
      household_composition: [], // considerar homeowner targeting via interests
      interests: [
        { id: '6003107902433', name: 'Home improvement' },
        { id: '6003148068584', name: 'Bathroom remodeling' },
        { id: '6003140375555', name: 'Kitchen remodel' },
      ]
    }),
    status: 'PAUSED',
    access_token: metaToken,
  })
});
```

**⚠️ IMPORTANTE — Verificar location key de Green Bay:**
```bash
curl -s "https://graph.facebook.com/v19.0/search?type=adgeolocation&q=Green+Bay&location_types=city&access_token=$META_PAGE_TOKEN" | jq '.data[] | select(.region_id == "3873")' 
# region_id 3873 = Wisconsin
```

### Paso 3 — Leer creativos desde Airtable

```javascript
const CREATIVE_RECORD_IDS_EN = [
  'recwZtAefTuKE38MK',
  'recfsbjY7orovpqtW',
  'recRkHPWuZeyGUdY8',
];
const CREATIVE_RECORD_IDS_ES = [
  'recoC1SMskMxPioXa',
  'rechU6hg8wNvz7ypS',
  'rec8cthYFwuH6eE06',
];

// Leer cada record para obtener Caption e Image URL
async function getPostData(recordId) {
  const r = await fetch(
    `https://api.airtable.com/v0/${baseId}/tblBbSbpzzANl74y0/${recordId}`,
    { headers: { Authorization: `Bearer ${airtableToken}` } }
  );
  if (!r.ok) throw new Error(`Airtable ${r.status} for ${recordId}`);
  const { fields } = await r.json();
  return {
    caption: fields.Caption,
    imageUrl: fields.Image_URL ?? fields.Cloudinary_URL, // verificar nombre exacto del campo
    platform: fields.Target_Platform,
  };
}
```

**⚠️ CC: verificar nombre exacto del campo de imagen en Geo_Posts antes de usar.**
```bash
curl -s "https://api.airtable.com/v0/appAQpveuAec077jF/tblBbSbpzzANl74y0/recwZtAefTuKE38MK" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN_GEO" | jq '.fields | keys'
```

### Paso 4 — Crear ad creative (image ad)

```javascript
async function createAdCreative(imageUrl, caption, pageId) {
  const r = await fetch(`${META_API}/${AD_ACCOUNT}/adcreatives`, {
    method: 'POST',
    body: new URLSearchParams({
      name: `GEO_Creative_${Date.now()}`,
      object_story_spec: JSON.stringify({
        page_id: pageId, // '723873447473999'
        link_data: {
          image_url: imageUrl,
          message: caption,
          call_to_action: {
            type: 'SEND_MESSAGE',
            value: { app_destination: 'MESSENGER' }
          }
        }
      }),
      access_token: metaToken,
    })
  });
  // ...
}
```

---

## Reglas de seguridad del agente

```javascript
// 1. SIEMPRE crear campañas en PAUSED — nunca STATUS=ACTIVE sin aprobación
// 2. DRY_RUN=true → solo loggear qué crearía, sin hacer ningún POST
// 3. Si ya existe una campaña con ese nombre → NO duplicar, loggear y salir
// 4. Loggear todos los IDs creados para poder hacer rollback si algo falla
// 5. Escribir los campaign_ids a Airtable (campo a definir) o a un log persistente
```

**Verificación de idempotencia:**
```javascript
// Antes de crear: buscar si ya existe campaña con ese nombre
const existing = await fetch(
  `${META_API}/${AD_ACCOUNT}/campaigns?fields=id,name&access_token=${metaToken}`
);
const campaigns = await existing.json();
if (campaigns.data.some(c => c.name === 'GEO_EN_Messages_2026')) {
  console.log('[meta_ads] Campaign already exists, skipping creation');
  process.exit(0);
}
```

---

## Flujo de ejecución para CC

```bash
# 1. Crear directorio del agente
mkdir -p /opt/alex-bot/agents/meta_ads

# 2. Escribir meta_ads.mjs con DRY_RUN=true por defecto

# 3. Dry run — verificar que lee todos los creativos y loggea lo que crearía
DRY_RUN=true node /opt/alex-bot/agents/meta_ads/meta_ads.mjs 2>&1
# Debe mostrar: 2 campañas, 2 ad sets, 6 creativos, 6 ads — SIN hacer ningún POST

# 4. Confirmar con Jorge los campaign IDs antes de activar
# → Jorge activa manualmente las campañas desde el Meta Ads Manager

# 5. NO agregar al crontab por ahora — este agente corre UNA VEZ para setup
# Fase 2 (futura): agente de reporting que lee métricas diarias
```

---

## Checklist antes de hacer cualquier POST

```
[ ] AD_ACCOUNT_ID confirmado (act_XXXXXXXXX)
[ ] Green Bay location key confirmado
[ ] Meta token tiene ads_management permission → verified
[ ] IG Business Account ID confirmado
[ ] Nombre exacto del campo imagen en Geo_Posts → verificado
[ ] Dry run corre sin errores
[ ] Jorge fue notificado de IDs creados para activar manualmente
[ ] Todas las campañas creadas en PAUSED
```

---

## Referencia rápida

- VPS: `root@187.77.215.146`
- FB Page ID: `723873447473999`
- Airtable base: `appAQpveuAec077jF`
- Tabla Posts: `tblBbSbpzzANl74y0`
- Token env var: `AIRTABLE_TOKEN_GEO` (leer via `token_env` del tenant config)
- Tenant config: `/opt/alex-bot/agents/tenants/geo-carpentry.json`
- Presupuesto: $25/semana por campaña (= `2500` centavos en la API)
- Meta API version: `v19.0`

---

## Resumen ejecutivo para CC

> Crear `/opt/alex-bot/agents/meta_ads/meta_ads.mjs`.
> Lee 6 posts de Airtable (3 EN + 3 ES por record ID), obtiene Caption e Image_URL de cada uno.
> Crea via Meta Marketing API: 2 campañas → 2 ad sets (targeting diferenciado) → 6 ad creatives → 6 ads.
> TODAS las campañas se crean en `PAUSED` — Jorge las activa manualmente desde Meta Ads Manager.
> Primero DRY_RUN antes de cualquier POST.
> El agente es idempotente: si las campañas ya existen, no las duplica.
> No agregar al crontab — es un agente de setup, no periódico.
