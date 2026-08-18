# GEOBUDGET — Estándar Compartido Entre Apps
> Creado: 2026-07-31 · Propietario: Jorge Cruz — Geo Carpentry LLC
> Aplica a: Remodel, Siding, Roofing, Deck (y cualquier app nueva de GeoBudget)

## Por qué existe este archivo
Jorge notó que la app de Siding se sentía menos pulida que la de Remodel mientras cotizaba en vivo.
Al comparar el código real (no solo la documentación) se encontraron gaps reales, algunos de ellos
bugs de dinero. Este documento define el estándar que las 4 apps deben cumplir, y el estado de cada
una después de la corrección del 2026-07-31.

## Los 3 elementos del estándar

### 1. Wisconsin Sales Tax (5.5%) realmente sumado al total
El impuesto debe sumarse al total REAL de la cotización (Package Comparison, contrato, depósito/balance),
no solo mostrarse como referencia en la tabla de Materials.

### 2. Contingency & Overhead (%)
Tarjeta con 2 checkboxes + 2 campos %:
- Contingencia (imprevistos) — default 10%, ON
- GC Overhead & Profit — default 15%, ON
Se aplica UNA sola vez sobre el total del proyecto completo (materiales + tax + labor + demo/dumpster).

### 3. Labor Rate Overrides persistentes
Cualquier tarifa de labor que Jorge edite en el modal "Labor Rates" debe:
- Guardarse automáticamente en `localStorage` (clave distinta por app)
- Restaurarse sola al abrir la app de nuevo (sin tener que reescribirla)
- Tener un botón "↺ Reset to Suggested" que regresa a los valores de fábrica

## Estado por app (después del 2026-07-31)

| App | Tax en total real | Contingency & Overhead | Labor Rates persistentes |
|---|---|---|---|
| **Remodel** | ✅ Ya lo tenía (referencia original) | ✅ Ya lo tenía (referencia original) | ✅ Ya lo tenía (referencia original) |
| **Siding** | 🔴→✅ Bug corregido — el 5.5% NUNCA se sumaba al total real, aunque el contrato decía que sí lo incluía | ✅ Agregado | ✅ Agregado |
| **Roofing** | ✅ Ya lo hacía bien, sin cambios | ✅ Agregado | ✅ Agregado (tarifas eran solo inputs sueltos, ahora se guardan globalmente) |
| **Deck** | 🔴→✅ Bug corregido — mismo bug que Siding, el 5.5% nunca se sumaba al total real | ✅ Agregado | ✅ Agregado |

## ✅ Los 3 archivos (siding/roofing/deck) YA se subieron a Hostinger y Jorge probó en vivo — 2026-07-31

## Verificación técnica realizada
- Sintaxis JS de los 3 archivos verificada con `node --check` (los 3 pasan sin errores).
- Confirmado por grep que los IDs nuevos (`contingency-enabled`, `contingency-pct`, `overhead-enabled`,
  `overhead-pct`) y las funciones de persistencia (`save/load/resetLaborRateOverrides` o equivalente
  por app) están presentes y conectadas en cada archivo.

## 🐛 Incidente post-deploy (2026-07-31) — cotizaciones "desaparecidas" en Siding
Después de subir, a Jorge se le vació `localStorage` del navegador (apagó/encendió la compu — probablemente
una config de "borrar datos al cerrar" o similar) y sus cotizaciones guardadas ya no aparecían en Siding.
Diagnóstico confirmado con Jorge en consola del navegador (`Object.keys(localStorage)` → `[]`, vacío total).
**No fue un bug del código de hoy** — fue el navegador/compu borrando todo. Las cotizaciones de ANTES de
este incidente **no se pudieron recuperar** (solo vivían en ese navegador, nunca en el servidor).

## ✅ NUEVO — Server-side backup de cotizaciones (4to elemento del estándar) — 2026-07-31
Para que esto no vuelva a pasar, se agregó un 4to elemento al estándar compartido, ya implementado en
las 4 apps (Remodel, Siding, Roofing, Deck):
- `save-backup.php` en cada carpeta de app — recibe la lista completa de cotizaciones vía POST (protegido
  con un token compartido `gb_bkp_7f3a9c2e1d8b4f60a2c5e9d1b7f3a8c4`) y la guarda en `./data/quotes-backup.json`.
- `data/.htaccess` en cada carpeta — bloquea acceso web directo al archivo de datos (solo el PHP puede leerlo/escribirlo).
- JS de cada app: `backupQuotesToServer(list)` se llama después de cada save/delete de cotización.
  `restoreQuotesFromServerIfEmpty()` se llama al cargar la página — si el navegador está vacío, trae
  la copia del servidor sola y muestra un toast "☁️ N cotizaciones restauradas".
- Verificado: sintaxis JS de las 4 apps con `node --check` (sin errores), PHP revisado a mano (sin PHP CLI
  disponible en el sandbox para lint automático).

## ✅ Las 4 apps YA tienen el backup subido y VERIFICADO en producción — 2026-07-31
Jorge subió `index.html` + `save-backup.php` + `data/.htaccess` a las 4 carpetas (siding, roofing, deck,
remodel) en Hostinger. Verificado uno por uno guardando una cotización de prueba y confirmando en la
consola del navegador (`fetch('./save-backup.php?token=...')`) que el JSON respondía `{ok: true,
quotes: Array(1)}` en cada app — es decir, el respaldo automático al servidor funciona de verdad, no
solo "sin errores en pantalla". Pendiente real: ninguno. Estándar completo (4/4 elementos) en las 4 apps.

## 🔴 Hallazgo de seguridad — Firestore de GeoBudget Deck abierto al público (2026-07-31)
Mientras se investigaba el incidente de arriba, se encontró que la colección `contracts` en Firestore
(proyecto `geocarpentryllc-8774d`, usada por el flujo abandonado de Documenso en Deck) es **legible por
cualquiera en internet sin autenticación** — confirmado con un GET directo a la REST API de Firestore.
Contiene datos personales reales si algún día se usa: nombre, teléfono, email, IP, y hasta la imagen de
la firma del cliente. Actualmente solo tiene 1 registro (una prueba de Jorge con sus propios datos, no un
cliente real). **Jorge decidió explícitamente posponer el arreglo — no es prioridad ahora mismo (2026-07-31).**
Queda como pendiente de seguridad para cuando Jorge lo priorice: agregar reglas de seguridad en Firebase
Console (Firestore → Rules) para bloquear lectura pública de la colección `contracts`.
