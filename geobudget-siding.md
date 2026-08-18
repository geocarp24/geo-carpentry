# GEOBUDGET SIDING — Memoria del Proyecto
> Alias: "GeoBudget Siding" · Última actualización: 2026-08-05 (código leído línea por línea — estado real del archivo)
> Propietario: Jorge Cruz — Geo Carpentry LLC

---

## ⚡ ESTADO REAL DEL ARCHIVO (2026-08-05 — leído directamente del código)

**Archivo local:** `C:\Users\Admin\OneDrive\Documents\Geo Carpentry\budget\siding\index.html`
(4,131 líneas, 242 KB, modificado 2026-07-31 — es el archivo con el tax fix y la estandarización ya aplicados)

**URL en producción:** https://geocarpentry.com/budget/siding/
**Hostinger:** `public_html/budget/siding/index.html`

> ⚠️ Estado de sincronización desconocido — el archivo local PUEDE que no esté subido aún a Hostinger.
> Jorge sube manualmente vía File Manager. Confirmar antes de editar si ya está live.

---

## 1. ARQUITECTURA (3 tablas + 1 motor)

1. **Hoja principal** = calculadora de cantidades (LF, SF, piezas)
2. **🧱 Materials** = todos los precios de material + Wisconsin 5.5% tax. Editable en la tabla. Fuente única: `MATERIAL_PRICE_OVERRIDES` + `getMaterialPrice(key)`.
3. **💰 Labor Rates** = todos los precios de mano de obra. Persisten en `localStorage` (`geobudget_siding_labor_rate_overrides`). Editable en la tabla.
4. **Package Comparison** = 11 combos, motor real de cotización. Lee materiales y labor de las fuentes arriba.

---

## 2. CONSTANTES CLAVE (valores reales en el código)

### `SIDING_PACKAGES` (5 paquetes)

| Key | Label | $/Sq Mat | $/Sq Labor | ext | int | trim | starter | jch | undersill | nails | laborCorner | laborTrim |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Economic | Vinyl MainStreet Double 4" | $140.28 | $150 | $17.98 | $13.50 | $7.98 | $4.60 | $7.98 | $5.99 | $23.99 | $20 | $50 |
| Medium | LP SmartSide Lap 3/8x8x16' | $149.87 | $250 | $99.99 | $16.98 | $16.98 | $5.99 | $0 | $5.99 | $65.59 | $40 | $50 |
| LPVertical | LP SmartSide Vertical Plank | $224.90 | $300 | $99.99 | $16.98 | $16.98 | $5.99 | $0 | $5.99 | $65.59 | $40 | $50 |
| Premium | LP SmartSide Nickel Gap | $545.79 | $325 | $99.99 | $16.98 | $16.98 | $5.99 | $0 | $5.99 | $65.59 | $40 | $50 |
| VinylVertical | Vinyl B&B Board & Batten | $283.35 | $180 | $0 | $0 | $0 | $0 | $0 | $0 | $0 | $0 | $0 |

### `EXTRA_LABOR_RATES` (línea 1517)
```javascript
const EXTRA_LABOR_RATES = { boardTransition: 0, pictureFrame: 0 };
```
⚠️ **PENDIENTE: Jorge no ha dado los valores reales. En $0.00 no afectan el total.**

### `FLAT_LABOR_RATES` (línea 1522)
```javascript
const FLAT_LABOR_RATES = { starterPerLf: 1.00, jchPerLf: 1.50 };
```
Confirmado por Jorge 2026-07-15. Se factura sobre PIES LINEALES REALES, no sobre la cantidad redondeada de compra.

### `SOFFIT_FASCIA_LABOR_TIERS` (línea 1513)
```javascript
const SOFFIT_FASCIA_LABOR_TIERS = { tier1: 8, tier2: 9, tier3: 10 }; // <10ft, 10-20ft, 20ft+
```

### `WISCONSIN_SALES_TAX` (línea 3047)
```javascript
const WISCONSIN_SALES_TAX = 0.055; // 5% estado + 0.5% Brown County (Green Bay)
```
**CONFIRMADO FUNCIONANDO en `computeCombinationTotal()`** — se suma AL TOTAL (ya no es solo referencia visual).

---

## 3. LABOR DE SOFITO / FASCIA — FÓRMULA FINAL

Función: `computeCombinedSoffitFasciaLabor()` (línea 1624)

- Se usa **ÚNICAMENTE los pies lineales de FASCIA** (con factor de desperdicio ya aplicado, ej. 12%)
- NO se suman también los LF del Sofito — sería doble-cobro
- Se multiplica × tarifa por altura (`$8/<10ft`, `$9/10-20ft`, `$10/20ft+`)
- El J-Channel de aluminio del sofito/rakes (jchsoffit): solo se cobra su MATERIAL, sin labor propia — la labor ya está incluida en la tarifa de Fascia
- Los materiales de Sofito Vented, Sofito Solid, Fascia y J-Channel de aluminio se siguen cobrando por separado

---

## 4. PACKAGE COMPARISON — 11 COMBOS

Definidos en `defaultCombinations()` (línea 2354):

| # | Nombre | Paquete base | Acento | Aberturas | Gable | Board | Picture Frame |
|---|---|---|---|---|---|---|---|
| 1 | Básico | Economic | — | JOnly | Same | — | — |
| 2 | Básico 1 | Economic | — | Both | Same | — | — |
| 3 | Básico 2 | Economic | VinylVertical | Both | DifferentMaterial | LP (+Drip Cap) | — |
| 4 | Medium | Medium | — | None | Same | — | — |
| 5 | Medium 1 | Medium | — | TrimOnly | Same | — | — |
| 6 | Medium 2 | Medium | LPVertical | TrimOnly | DifferentMaterial | LP (+Drip Cap) | — |
| 7 | Medium 3 | Medium | LPVertical | TrimOnly | DifferentMaterial | LP (+Drip Cap) | LP |
| 8 | Premium 1 | Premium | — | TrimOnly | Same | — | — |
| 9 | Premium 2 | Premium | LPVertical | TrimOnly | DifferentMaterial | PVC (sin drip cap) | — |
| 10 | Premium 3 | Premium | LPVertical | TrimOnly | DifferentMaterial | PVC | PVC |
| 11 | Deluxe | LPVertical | — | TrimOnly | BoardOnly | PVC | PVC |

**`computeCombinationTotal()`** produce: `{total, breakdown, materialsTotal, laborTotal, demoTotal, materials, laborBreakdown, salesTaxAmount, contingencyEnabled, contingencyPct, contingencyAmount, overheadEnabled, overheadPct, overheadAmount, contingencyOverheadTotal}`

---

## 5. CARTA DE MATERIALES Y VARIANTES

### `SIDING_PANEL_MATERIALS` (5 SKUs de paneles reales)
| key | Label | pieceLen | defaultPrice | cartonSize |
|---|---|---|---|---|
| panelEconomic | MainStreet Double 4" Spruce | 12.5 ft | $11.69 | 24 |
| panelMedium | LP SmartSide 3/8x8x16' Cedar Texture | 16 ft | $13.98 | null |
| panelPremium | LP SmartSide 1/2x8x16' Nickel Gap | 16 ft | $49.99 | null |
| panelLPVertical | LP SmartSide 3/8x16x16' Cedar Texture | 16 ft | $47.95 | null |
| panelVinylVertical | Board & Batten Single 8" Snow | 10 ft | $18.89 | 15 (full carton ONLY) |

### `MATERIAL_VARIANTS` (SKUs alternativos LP vs Vinyl)
| key | Label | pieceLen | defaultPrice |
|---|---|---|---|
| ext_lp | Exterior Corner Post - LP SmartSide (Sherwin-Williams) | 10 ft | $99.99 |
| int_lp | Interior Corner - LP SmartSide (Multiuso Trim Board) | 16 ft | $16.98 |
| starter_lp | Starter/Z-Flashing - Steel (LP SmartSide) | 10 ft | $5.99 |

⚠️ **LP Nails NO están en MATERIAL_VARIANTS** — falta el peso por caja del Grip Fast 2-3/16in ($65.59/caja 3,000pza). Pendiente de Jorge.

### `EXTRA_MATERIAL_ITEMS` (Gable Board + Picture Frame Trim en LP y PVC)
| key | Label | pieceLen | defaultPrice |
|---|---|---|---|
| gableboard_lp | Gable Transition Board - LP SmartSide (16ft) | 16 ft | $64.99 |
| gableboard_pvc | Gable Transition Board - PVC (12ft) | 12 ft | $51.98 |
| pictureframe_lp | Picture Frame Trim - LP SmartSide (16ft) | 16 ft | $16.98 |
| pictureframe_pvc | Picture Frame Trim - PVC (16ft) | 16 ft | $33.96 |

### `BOARD_MATERIALS` y `PICTURE_FRAME_MATERIALS`
- Board: None / LP ($64.99/16ft, **necesita Drip Cap**) / PVC ($51.98/12ft, sin Drip Cap)
- PictureFrame: None / LP ($16.98/16ft) / PVC ($33.96/16ft)

### `CARTON_SIZES` (piezas por caja — solo vinyl confirmado)
```javascript
const CARTON_SIZES = { ext: 10, int: 10, jch: 40, starter: 50, undersill: 50 };
```

---

## 6. PERSISTENCIA DE LABOR RATES (implementado, funciona)

```javascript
const LABOR_RATES_STORAGE_KEY = 'geobudget_siding_labor_rate_overrides';
```
- `saveLaborRateOverrides()` — guarda en localStorage en cada edición
- `loadLaborRateOverrides()` — restaura al cargar la página
- `resetAllLaborRateOverrides()` — botón "Reset to Suggested" en la tabla

Los defaults viven en `LABOR_RATE_DEFAULTS` — incluye paquetes, soffit/fascia tiers, extraRates, flatRates.

---

## 7. GENERACIÓN DE CONTRATO (implementado y completo)

**Botón:** `📝 Generate Contract` (línea 333) → `openContractModal()`
**Función principal:** `buildContractHtml()` (línea 2686)

### Modal de configuración (inputs):
- `contract-number` — auto-generado: `GC-YYYYMMDD-XX`
- `client-name`, `client-address`, `client-phone`
- `contract-package-select` — dropdown de las 11 combinaciones (con badge "✅ client approved")
- `contract-deposit-pct` — % de depósito (default 50%)
- `contract-start-date` — fecha estimada de inicio
- `contract-permits` — default: "No Permit Required for this job. A request to the city was submitted and will be part of this contract..."
- `contract-workmanship-warranty` — texto de garantía de mano de obra
- `contract-offsite-sale` — checkbox: activa FTC Cooling-Off Rule (Sección 10 + Notice of Cancellation ×2)

### Secciones del contrato generado:
1. **Parties** — Geo Carpentry LLC, 735 E Walnut St, Suite #3, Green Bay, WI 54301 + datos del cliente
2. **Description of Work** — paquete + lista de lo que incluye (generada por `buildComboIncludesList()`)
3. **Contract Price** — precio total (materials + tax + labor + demo + contingency + overhead)
4. **Payment Terms** — depósito % + balance + penalidad 10% por pago tardío >5 días + derechos de lien (Wis. Stat. § 779.06)
5. **Insurance** — COI tras firma + depósito confirmado
6. **Permits** — texto editable (default: "No Permit Required...ciudad notificada...")
7. **Schedule** — "ordered/scheduled only after deposit clears", 1–2 business days, start date, completion date (1-2 biz days), weather permitting
8. **Warranty** — garantía del fabricante (por sistema de siding instalado) + garantía de mano de obra
9. **Changes** — sin cambios válidos sin escrito firmado por ambas partes
10. **Buyer's Right to Cancel** (solo si off-site sale) — FTC 16 CFR 429.1, deadline = 3 business days
- **Página 2:** Lien Waiver Notice (Wis. Admin. Code § ATCP 110.025)
- **Páginas 3-4:** Notice of Cancellation (2 copias) — solo si off-site sale

### Lógica de fecha de cancelación:
`addBusinessDays(contractDate, 3)` con `isFederalBusinessDay()` — excluye domingos y los 9 holidays federales exactos (no inventa).

### Acciones del modal de preview:
- **Preview** → `previewContract()` — muestra en modal
- **Print** → `printContract()` — imprime directamente

---

## 8. MY QUOTES (cotizaciones guardadas)

```javascript
const QUOTES_KEY = 'geobudget_siding_quotes_v1';   // línea 3801
```
- `backupQuotesToServer(list)` (línea 3818) — backup automático via `save-backup.php` en el servidor

---

## 9. CONTINGENCY & OVERHEAD

Mismo estándar que GeoBudget Remodel. Checkboxes independientes:
- `#contingency-enabled` + `#contingency-pct` — default 10%
- `#overhead-enabled` + `#overhead-pct`
- Se aplica UNA SOLA VEZ sobre el total completo (materials + tax + labor + demo)
- Línea en breakdown: "Contingency + GC Overhead & Profit"

---

## 10. DROPDOWN OCULTO `#siding-package`

**Línea 430:** `<select id="siding-package" onchange="applySidingPackage()" style="display:none">`

Aún en uso por:
1. `updateAccessoryBoxes()` — labor de Corners/Trim (`currentPkg.laborCorner`, `currentPkg.laborTrim`)
2. `cartonSizeLabelFor()` — etiqueta de caja de Nails según precio
3. `renderRatesTable()` — renderizado de la tabla de Labor Rates

**No se puede borrar aún** sin romper estas 3 cosas.

---

## 11. CÁLCULO DE SOFITO (técnica real de paneles)

Panel: 16" ancho × 12ft (144") largo.
- Se corta en tiras según el overhang de cada pared
- Cada tira cubre 16" de recorrido lineal
- Paredes con mismo overhang se agrupan para aprovechar sobrantes
- +12% desperdicio por grupo
- Función: `computeSoffitPanelsForVentType(ventType)` (vented vs solid por separado)

---

## 12. PENDIENTES REALES (estado al 2026-08-05)

| # | Pendiente | Blocking? |
|---|---|---|
| P1 | `EXTRA_LABOR_RATES.boardTransition` = $0.00 — falta tarifa real de Jorge | NO (se suma $0 hasta que lo llene) |
| P2 | `EXTRA_LABOR_RATES.pictureFrame` = $0.00 — idem | NO |
| P3 | LP Nails: falta peso/caja del Grip Fast 2-3/16in para auto-calcular cajas | Parcial |
| P4 | Carton sizes de LP/PVC para Corners, Trim, etc. — Jorge no los ha dado | Solo visual |
| P5 | Dropdown `#siding-package` oculto — reemplazar con filas explícitas por material | Técnico |
| ✅ P6 | RESUELTO: Archivo listo para Hostinger (Jorge sube manualmente) | — |
| P7 | Ficha final visual para el cliente (tarjetas de paquetes para mostrar al cliente) | Futuro |

---

## 13. REGLAS DE PRECIOS (no negociables)

- Todos los precios de materiales son **pre-rebate (precio del sticker en Menards)** — el cliente aplica el 11% rebate por su cuenta
- Jorge manda SIEMPRE foto de Menards antes de agregar material nuevo — sacar SKU/precio/medidas exactas de la foto
- Nunca adivinar specs que falten — preguntar

---

## 14. HISTORIAL CONDENSADO

- **2026-07-15** — v2 Pro documentada; Labor Rates modal; sofito por paneles; gable treatment; flat rates (starter $1.00/lf, jch $1.50/lf); combined soffit+fascia labor (solo fascia LF); EXTRA_LABOR_RATES en $0.00
- **2026-07-16** — Vertical Trim (16" o.c.); MATERIAL_PRICE_OVERRIDES fuente única; SIDING_PANEL_MATERIALS; MATERIAL_VARIANTS; EXTRA_MATERIAL_ITEMS; CARTON_SIZES; 11 combos Package Comparison
- **2026-07-31** — Bug fix: WI sales tax ahora SÍ suma al total; Contingency & Overhead implementado; Labor Rates persistentes en localStorage (mismo estándar que Remodel)
- **2026-08-05** — **Labor Only contract type**: radio buttons en modal, `isLaborOnly` flag, `contractTotal` sin materiales/tax, Secciones 2/3/7/8 ajustadas, save/load/clear actualizados. **`buildComboIncludesList()` dinámico**: eliminados hardcodes de Corners/Soffit/Sealant — ahora lee `result.materials` y `result.laborBreakdown`. **Contractor Packages overhead fix**: `contractorPackagesBase/Overhead/Total()` helpers — modal, print, email, Best Value badge usan precio con overhead incluido. Línea "Overhead & Profit" visible en desglose del cliente.

## 15. CONTRACT TYPE — LABOR ONLY (implementado 2026-08-05)

**Radio buttons en modal** (cerca de línea 1013):
- `full` = Full Contract (default) — materials + labor + tax + overhead
- `labor-only` = Labor Only — labor + demo + overhead/contingency ÚNICAMENTE (sin materiales, sin WI tax)

**`buildContractHtml()` — lógica clave:**
```javascript
const isLaborOnly = contractType === 'labor-only';
// Labor Only total:
const laborDemoBase = result.laborTotal + result.demoTotal;
const extraPct = (result.contingencyEnabled ? result.contingencyPct : 0) + (result.overheadEnabled ? result.overheadPct : 0);
contractTotal = laborDemoBase * (1 + extraPct);
// Full: contractTotal = result.total (ya tiene overhead de computeCombinationTotal)
```

**Cláusulas modificadas:**
- Sección 2: nota de "Owner-Supplied Materials" + prefix "Install" en lista de items
- Sección 3: precio sin WI tax line
- Sección 7: schedule espera materiales on-site (no solo depósito)
- Sección 8: warranty del fabricante = N/A; solo workmanship warranty

## 16. CONTRACTOR PACKAGES — OVERHEAD FIX (2026-08-05)

**Helpers nuevos** (antes de `renderContractorPackagesList`):
```javascript
function contractorPackagesBase(result){ return result.laborTotal + result.demoTotal; }
function contractorPackagesOverhead(result){
    const base = contractorPackagesBase(result);
    const extraPct = (result.contingencyEnabled ? result.contingencyPct : 0) + (result.overheadEnabled ? result.overheadPct : 0);
    return base * extraPct;
}
function contractorPackagesTotal(result){ return contractorPackagesBase(result) + contractorPackagesOverhead(result); }
```

**Todos los puntos de display** usan `contractorPackagesTotal(result)`:
- Modal card price (`priceDiv`)
- Print card price
- `applyBestValueBadge` comparación
- cheapestId en print section
- Email body
- `buildContractorLaborList` muestra "Overhead & Profit" como línea separada
