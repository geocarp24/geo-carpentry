# GeoBudget Remodel — Memoria Técnica Completa
**Última actualización:** 2026-07-29  
**Propietario:** Jorge Cruz — Geo Carpentry LLC  
**URL Live:** `geocarpentry.com/budget/remodel/`  
**Archivo fuente:** `C:\Users\Admin\OneDrive\Documents\Geo Carpentry\budget\remodel\index.html`

---

## 1. QUÉ ES ESTA APP

GeoBudget Remodel es una PWA calculadora de cotizaciones para trabajos de remodelación interior. Maneja **demolición de paredes, construcción de paredes nuevas, pisos, y comparación de 3 paquetes de acabado** con precios reales de Menards Green Bay East (**PRE-REBATE / sticker price**, verificados julio 2026). Wisconsin Sales Tax (5.5%) se calcula y muestra por separado encima del total de materiales. El cliente aplica el 11% mail-in rebate de Menards por su cuenta.

**Diferencia clave vs GeoBudget Siding/Roofing/Deck:** Esta es la más avanzada y más completa del portafolio. Incluye lógica de fase (Demo Quote vs Installation Quote separados), salvage credits, patch scars, y labor overrides persistentes.

---

## 2. STACK TÉCNICO

- **Frontend:** HTML5 + CSS3 + JavaScript vanilla — un solo archivo `index.html` (~1668 líneas)
- **Backend:** Ninguno. Todo en el browser (cálculos, storage, impresión)
- **Storage:** `localStorage` — 2 keys:
  - `geobudget_remodel_quotes` — array de quotes guardados
  - `geobudget_remodel_labor_overrides` — objeto con rates customizados del usuario
- **PWA:** `manifest.json` + `service-worker.js` + `icon-192.png`, `icon-180.png` — instalable en mobile
- **Brand:** 🧱 emoji en nav; colores internos `--geo-navy: #1B3A6B` + `--geo-orange: #FF6B00`
- **No dependencias externas** — cero CDN, cero backend, cero npm

---

## 3. ESTRUCTURA DE NAVEGACIÓN (nav en header)

| Botón | Función |
|---|---|
| 💾 My Quotes | Modal — guardar/cargar/borrar quotes por cliente |
| 📊 Package Comparison | Modal — tabla comparativa de los 3 packages con totales |
| 💲 Material Prices | Modal — tabla de precios Menards (solo lectura) |
| 🛠️ Labor Rates | Modal — tabla de rates sugeridos + campo para override |

---

## 4. FLUJO PRINCIPAL (secciones)

### Sección 0: Client Info
Campos: `client-name`, `job-address`, `client-phone`, `client-email`
- El `client-name` es requerido para guardar un quote

### Sección 1: Walls (Paredes)
Cada fila de pared tiene:
- **Nombre** (editable) + **botón borrar**
- **Type:** "New Partition" o "Demolition of Existing Wall"
- **Qty:** multiplicador de paredes idénticas (en vez de duplicar filas)
- **Dimensiones:** `lengthFt` + `lengthIn` + `heightFt` + `heightIn`

**Si es NEW PARTITION:**
- Framing: `Wood 2x4 @ 16" o.c.` o `Metal Stud 25ga @ 24" o.c.`
- Checkbox: Add insulation (R-13)
- Checkbox: Load-bearing wall → campo de ancho de apertura → disclaimer estructural
- Trim: `none` / `baseboard only` / `baseboard + crown`
- Checkbox: Add electrical (new outlets/switches) → disclaimer de electricista
- **Openings (puertas + ventanas):** ver abajo

**Si es DEMOLITION:**
- Framing del muro existente: wood o metal (para calcular salvage)
- Checkbox: Reusable material → campo de % salvageable → aplica crédito
- Checkbox: Patch ceiling + adjacent walls (on by default) → patch band = 2ft
- Checkbox: Has electrical → Action: relocate vs remove & cap

**Doors & Windows (sub-tabla por pared):**
- Kind: Door / Window
- Action: Install New / Demo Existing
- Category: Residential / Commercial
- Subtype varía por category+kind:
  - Residential door: hollow-core ($105.91), solid-core ($204.70), exterior steel ($235.85), exterior fiberglass ($248.31)
  - Commercial door: commercial steel 36x80 ($653.26)
  - Residential window: vinyl ~28x58 ($231.39)
  - Commercial window: storefront aluminum → ⚠️ NO en Menards, requiere supplier quote, NO incluido en totales
- Dimensiones del opening (ft wide + ft tall)
- Checkbox: Casing (standard 32x80 set $35.59 o por lin ft $1.396/lf si sobredimensionado)

### Sección 2: Flooring (Pisos)
Cada fila de cuarto tiene:
- Nombre + sq ft + material de piso destino (LVP, laminate, carpet tile, carpet roll)
- Checkbox: Remove existing floor → selector de material existente (ceramic, hardwood, vinyl glued, laminate, carpet)
- Checkbox: Subfloor repair/leveling

### Sección 3: Waste Factor & Disposal
- Waste factor: 12% (default) — dropdown: 10%, 12%, 15%, 20%, 25%
- Dumpster: Auto / Include / Don't Include
  - Auto = calcula yardas cúbicas de debris y si > 0.25 yd³ incluye dumpster
  - $425/load, 10 yd³ por load

### Sección 4: Contingency & Overhead
- Contingency: checkbox (default ON) + % (default 10%)
- GC OH&P: checkbox (default ON) + % (default 15%)
- Ambos se aplican UNA VEZ al total del proyecto (materials + labor + disposal)

### Summary Totals (siempre visible)
Muestra en tiempo real: Wall sq ft, Floor sq ft, Stud count, Drywall sheets, Headers, Doors, Windows, Debris yards, Dumpster loads, Salvage credit total

---

## 5. LOS 3 PAQUETES DE ACABADO

| Package | Finish Level | Paint |
|---|---|---|
| Economic | Level 4 (tape + mud joints only) | No paint |
| Standard | Level 4 | 2 coats flat ($13.17/gal Lucite) |
| Premium | Level 5 (full skim coat) | 2 coats eggshell ($33.64/gal Pittsburgh Grand Distinction) |

**Solo aplican a NEW walls.** El finish level NO cambia la demolición ni los pisos.

---

## 6. LOS 5 REPORTES

| Botón | Modal | Audiencia | Contenido |
|---|---|---|---|
| ✅ Package Chosen (N) | `packages-chosen-modal` | Cliente | Cards con precio total + features incluidas |
| 📦 Material List Only (N) | `material-list-only-modal` | Compras | Lista materiales + qty + unidad (sin $) |
| 🔨 Contractor Packages (N) | `contractor-packages-modal` | Subcontratista | Labor + disposal (sin materiales), función email |
| 🪓 Demolition Quote (N) | `demolition-quote-modal` | Cliente / GC | Solo fase demo: materials+labor+disposal+OH&P proporcional |
| 🏗️ Installation Quote (N) | `installation-quote-modal` | Cliente / GC | Solo fase install: materials+labor+OH&P proporcional |

Todos imprimen con el logo, fecha y nombre del cliente.

**Phase split logic:** El OH&P total se divide proporcionalmente por el peso de cada fase (demo $$ / total $$), de manera que Demo + Install siempre suman exactamente al grand total.

---

## 7. PRECIOS (Menards Green Bay East, **PRE-REBATE / sticker price**, verificados julio 2026)

**POLÍTICA DE PRECIOS:** Todos los valores son el precio de sticker en Menards (antes del 11% mail-in rebate). El WI Sales Tax (5.5%) se agrega encima en la cotización. El cliente aplica el rebate de Menards por su cuenta.

`const WI_SALES_TAX = 0.055;` — constante en el código, separada de los materiales.

### Materiales
| Material | Precio (Pre-Rebate) |
|---|---|
| Wood Stud 2x4x8 | $4.35/pc |
| Metal Stud 25ga 10ft | $5.80/pc |
| Metal Track 25ga 10ft | $5.25/pc |
| Drywall 1/2"x4x8 (32 sq ft) | $13.48/sheet |
| Joint Compound 3.5qt pail | $10.28 (~100 sq ft L4 / ~50 sq ft L5) |
| Drywall Tape 500ft roll | $13.99 |
| Drywall Screws 5lb box (825 screws) | $15.98 |
| R-13 Insulation bag (106.56 sq ft) | $62.47 |
| LVL Header 1-3/4"x9-1/2" | $5.60/lf |
| OSB Subfloor 3/4"x4x8 (32 sq ft) | $31.48/sheet |
| LVP Flooring | $1.99/sq ft |
| Laminate | $1.39/sq ft |
| Carpet Tile | $0.99/sq ft |
| Carpet Roll | $1.56/sq ft |
| Carpet Pad 7/16" rebond | $0.44/sq ft |
| Paint — Flat (Standard pkg) | $14.80/gal (350 sq ft coverage) |
| Paint — Eggshell (Premium pkg) | $37.80/gal |
| Door — Hollow-Core 30x80 | $119.00 |
| Door — Solid-Core 30x80 | $230.00 |
| Door — Exterior Steel 36x80 | $265.00 |
| Door — Exterior Fiberglass 36x80 | $279.00 |
| Door — Commercial Steel 36x80 | $734.00 |
| Window — Vinyl Residential ~28x58 | $260.00 |
| Window — Commercial Aluminum Storefront | ⚠️ NO EN MENARDS — requiere supplier quote |
| Baseboard 4-1/4" Colonial | $1.749/lf |
| Crown Molding 4-1/4" Colonial | $1.980/lf |
| Door Casing Set (fits 32x80) | $39.99/set |
| Casing per lf | $1.569/lf |
| Ceiling Tile Drop 2'×2' (Armstrong) | $0.67/sq ft ($42.72/case = 64 sq ft) |
| Ceiling Tile Glue-Up 12"×12" (Armstrong Baltic) | $1.37/sq ft ($54.80/case = 40 sq ft) |

### Labor Rates (sugeridos, sobreescribibles)

**Walls:**
- Demo pared: $2.50/sq ft
- Framing wood: $3.00/sq ft
- Framing metal: $2.75/sq ft
- Drywall hang: $1.25/sq ft/side
- Finish L4: $1.00/sq ft/side
- Finish L5: $3.00/sq ft/side
- Paint: $0.40/sq ft/coat
- Header non-load-bearing (wood): $150 flat
- Header non-load-bearing (metal): $125 flat
- Header LOAD-BEARING + shoring: $450 flat

**Flooring:**
- Demo ceramic tile: $2.75/sq ft
- Demo hardwood: $2.25/sq ft
- Demo vinyl glued: $2.00/sq ft
- Demo laminate: $0.85/sq ft
- Demo carpet: $0.75/sq ft
- Subfloor repair: $1.50/sq ft
- Install LVP: $1.75/sq ft
- Install laminate: $1.75/sq ft
- Install carpet tile: $1.00/sq ft
- Install carpet roll: $1.25/sq ft

**Doors, Windows & Trim:**
- Door install — hollow-core: $75
- Door install — solid-core: $100
- Door install — exterior: $150
- Door install — commercial: $250
- Window install — residential: $125
- Demo existing door/window: $60
- Baseboard: $1.25/lf
- Crown: $1.50/lf
- Door casing set: $40 flat
- Casing per lf: $1.00/lf

**Patch & Electrical:**
- Patch drywall ceiling/wall (cut-in, finish, texture match): $8.00/sq ft
- Patch drop ceiling tile 2'×2': $2.50/sq ft (lift out, cut to fit, drop in)
- Patch glue-up ceiling tile 12"×12": $3.00/sq ft (pry old, clean substrate, glue, re-caulk)
- Electrical relocate: $250/wall
- Electrical remove & cap: $125/wall
- Electrical new install: $300/wall

**Dumpster:** $425/load (10 yd³/load)

---

## 8. LÓGICA DE CÁLCULO CLAVE

**Studs wood:** `ceil(lengthFt / (16/12)) + 1` studs + `2 * ceil(L/8)` plates
**Studs metal:** `ceil(L/2) + 1` studs + `2 * ceil(L/10)` track
**Drywall:** Ambos lados × (1 + waste%) → sheets round up
**Patch band:** 5/12 ft (~5") — `PATCH_BAND_WIDTH_FT = 5/12` — `ceiling scar = L × (5/12)` + `wall end scars = H × (5/12) × 2 adjacent walls`
**Ceiling scar tipo tile:** Si `ceilType = 'tile_2x2'` o `'tile_12x12'`, el ceiling scar usa tile material + tile labor; los wall-end scars siempre usan drywall. Si `ceilType = 'drywall'` (default), ambas scars usan drywall patch unificado.
**WI Sales Tax:** `salesTaxAmount = materialsTotal × 0.055` — se agrega al total y se muestra por separado en Installation Quote y tabla de comparación.
**Header sizing (budgetary IRC):** ≤4ft→2x8, ≤6ft→2x10, ≤8ft→2x12, >8ft→engineered beam
**Salvage credit:** Solo studs/track (no drywall), % configurable × price × qty
**Debris:** 3 yd³/600 sq ft de pared; 2.5 yd³/600 sq ft de piso
**Dumpster trigger:** > 0.25 yd³ total debris en modo Auto

---

## 9. QUOTE MANAGEMENT

- localStorage key `geobudget_remodel_quotes` — array JSON
- Cada quote guarda: id, clientName, jobAddress, clientPhone, clientEmail, wallRows, floorRows, combinations, wasteFactor, dumpsterMode, savedAt
- IDs de walls/floors/openings se reseed al cargar para evitar colisiones
- Búsqueda por client name en el modal de quotes
- El client name es REQUERIDO para guardar

---

## 10. ESTADO ACTUAL (2026-07-29)

**✅ COMPLETO — NO hay features pendientes en el código**

El código está finalizado. Todas las funcionalidades están implementadas y funcionando:
- Walls (new + demo) con todos los sub-features
- **ceilType selector** en demo walls: drywall / tile_2x2 / tile_12x12 (ceiling patch inteligente)
- **Salvage credit** — activo en tipo "Demolition" + checkbox "Reusable material" → `addCredit()` descuenta de materialsTotal
- Flooring con demo + subfloor repair
- Doors & windows per wall
- 3 finish packages
- 5 tipos de reportes (client-facing + internal)
- Phase quotes (demo separado de install)
- **Wisconsin Sales Tax (5.5%)** — calculada sobre materialsTotal, mostrada por separado en Installation Quote + tabla comparativa
- **Precios PRE-REBATE** — todos los valores en PRICES son sticker price de Menards. Cliente aplica 11% rebate por su cuenta.
- Labor overrides persistentes
- Quote save/load/delete
- PWA installable

**No hay bugs conocidos ni comentarios TODO en el código.**

---

## 11. DEPLOY / UBICACIÓN

- **Live URL:** `https://geocarpentry.com/budget/remodel/`  
- **Archivos fuente:** `C:\Users\Admin\OneDrive\Documents\Geo Carpentry\budget\remodel\`
  - `index.html` — app completa (~1668 líneas)
  - `manifest.json` — PWA manifest
  - `service-worker.js` — SW para offline
  - `icon-192.png`, `icon-180.png` — icons PWA

---

## 12. APPS HERMANAS (mismo portafolio GeoBudget)

| App | URL | Folder | Estado |
|---|---|---|---|
| GeoBudget Remodel | geocarpentry.com/budget/remodel/ | budget/remodel/ | ✅ Completo |
| GeoBudget Siding | geocarpentry.com/budget/siding/ | budget/siding/ | ✅ v3 (ver geobudget-siding.md) |
| GeoBudget Roofing | geocarpentry.com/budget/roofing/ | budget/roofing/ | 🟡 Existente, no documentado aún |
| GeoBudget Deck | geocarpentry.com/budget/deck/ | budget/deck/ | 🟡 Existente, no documentado aún |
| GeoBudget Pro (Budget Builder + Takeoff) | pinnaclegroupwi.com/GeoBudget/ | budget/ (raíz) | Ver MEMORIA.md — PDF bug pendiente |
