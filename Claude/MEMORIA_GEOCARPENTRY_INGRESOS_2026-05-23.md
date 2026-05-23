# MEMORIA GEO CARPENTRY — INGRESOS PRIMERO
**Para subir a:** Claude.ai → Project folder "Geo Carpentry"
**Última actualización:** 2026-05-23
**Autor:** ALEX (Claude Opus 4.7) + sesión con Jefe (Jorge Cruz)

---

## ⚡ REGLA #1 — LA PRIORIDAD AHORITA ES GENERAR INGRESOS

**Geo Carpentry necesita facturar YA.** Todo lo demás (refactors, automatizaciones nice-to-have, dashboards, blog posts, polish visual de secciones secundarias) es secundario hasta que entren los primeros contratos pagados de este ciclo.

Cuando una nueva sesión de Claude lea este archivo, antes de proponer cualquier tarea debe preguntarse:

> **"¿Esto trae un lead pagador esta semana, o me distrae?"**

Si la respuesta es "me distrae", proponer otra cosa. Las únicas tareas que importan ahora son:
1. Tapar fugas del funnel (imágenes rotas, form que no se ve, social proof faltante)
2. Activar canales orgánicos de lead-gen (GMB, network blast, FB, door knocking)
3. Cerrar la primera tanda de contratos para validar pricing y unit economics

---

## 📊 ESTADO REAL HOY (2026-05-23)

| Frente | Estado | Bloquea ingresos? |
|---|---|---|
| Sitio live (HTTPS) | ✅ https://geocarpentry.com | No |
| SSL + DNS | ✅ LE cert vigente hasta 2026-08-13 | No |
| WordPress + child theme | ✅ Operacional, filtros con null-safety | No |
| Form de captura (SureForms 2340) | ⚠️ Existe en backend pero **no se ve renderizado en /contact/ ni /quote/ via curl** — verificar en browser | **SÍ — crítico** |
| Airtable CRM (base `appAQpveuAec077jF`) | ✅ 8 tablas creadas, mu-plugin instalado | No |
| Schema markup (LocalBusiness) | ✅ Excelente (17 ciudades, OfferCatalog) | No |
| Posicionador SEO score | 63/100 (subió desde 58 con quick wins) | No (mediano plazo) |
| **Fotos reales de proyectos** | ❌ **0 fotos — placeholders SVG en hero/servicios/portfolio** | **SÍ — crítico** |
| **Testimonios con nombre** | ❌ 0 | **SÍ — crítico** |
| **Reviews Google (GMB)** | ❌ Invite enviado pero no confirmado | **SÍ — crítico** |
| **Pipeline activo de leads** | ❌ 0 leads, 0 contratos cerrados este ciclo | **SÍ — crítico** |
| Cron Posicionador | ⏳ Configurado pero no activado en hPanel | No (no urgente) |
| Escriba (blog automation) | ⏳ 2 artículos planeados, esperan aprobación | No (no urgente) |
| Dashboard InvestorOS | ⏳ Scaffolded, no desplegado | No |

---

## 🎯 PLAN ESTRATÉGICO DE INGRESOS — 30 DÍAS

**Meta numérica:** Pipeline de 5–10 leads cualificados, 2–3 cotizaciones enviadas, **1–2 contratos cerrados ($3K–$10K facturados) antes del 23 de junio 2026.**

### Semana 1 (May 24 – May 31) — DESATASCAR EL FUNNEL
Sin esto, los canales de tráfico no convierten.

**Acciones de Jefe (4–6 h totales):**
- [ ] **Fotos**: tomar 10–15 fotos hi-res de proyectos terminados (iPhone 4K, luz de día — basta). Antes/después si existen. (2 h)
- [ ] **Retrato de Jorge** + foto de la cuadrilla en obra (30 min)
- [ ] **3–5 testimonios con nombre**: llamar a ex-clientes, pedir frase de 2–3 líneas + nombre + ciudad + tipo de proyecto. (30 min)
- [ ] **Aceptar invitación de GMB** a `alexgeocarpentry@gmail.com` (1 min — click email)
- [ ] **Datos faltantes**: WI DSPS license # + carrier de seguro + monto GL + status Workers Comp (15 min — copiar de pólizas)
- [ ] **Decisión sobre form mobile**: ¿se reordena arriba del fold o se deja como está? (1 min)

**Acciones de ALEX (en paralelo, basadas en los assets que mande Jefe):**
- Subir fotos al sitio (portfolio + service pages + hero)
- Inyectar bloque de testimonios en homepage
- Render el license # + carrier en el footer y en el LocalBusiness schema
- **Verificar manualmente que el form SureForms 2340 efectivamente renderiza en producción** (abrir en browser, no curl)
- Si el form no renderiza: arreglar antes que cualquier otra cosa

### Semana 2 (Jun 1 – Jun 8) — LEAD-GEN BOOTSTRAP ORGÁNICO
Cero presupuesto en ads. 100% orgánico, ROI más alto primero.

**Prioridad 1 — Network blast (1 h, día 1):**
- 30–50 textos a familia, ex-clientes, ex-compañeros, vecinos, iglesia, gym
- Template en español e inglés ya escrito en `automation/LEAD_GEN_WEEK_1.md`
- **Responder cada respuesta dentro de 1 hora**
- KPI: 30 textos → 5+ respuestas → 2+ visitas agendadas

**Prioridad 2 — Facebook (1 h, día 1–2):**
- Post personal pinneado + post en página Geo Carpentry
- 4 listings en FB Marketplace (Deck / Kitchen / Bathroom / Carpintería general) con fotos reales
- Refresh listings cada 3 días
- Unirse a 10 grupos locales (Green Bay Homeowners, NE WI Home Owners, Brown County, De Pere, Howard, Allouez, etc.)
- KPI: 50+ views por post, 3+ shares, 2+ DMs

**Prioridad 3 — GMB optimización (30 min, día 2):**
- Subir 10 fotos
- Llenar service list con price ranges
- Post inicial con CTA "Get Free Estimate"
- Responder reviews existentes (si hay)
- Pedir review a 5 ex-clientes (template en `automation/LEAD_GEN_WEEK_1.md`)

**Prioridad 4 — Door knocking (días 3–7, 2–3 h/día):**
- Vecindarios target: Howard, De Pere, Allouez, Bellevue, Suamico
- Script + door hanger (imprimir 500 en VistaPrint, ~$50 — único gasto)
- Numbers game: 150 puertas → 5 conversaciones → 1–2 quotes
- Trackear en libreta o app: dirección + resultado

**Prioridad 5 — Craigslist + flyers físicos (1 h, día 2–3):**
- Listing en Craigslist Green Bay (categoría Services)
- 20 flyers en coffee shops, iglesias, Menards/Home Depot/ACE Pro Desk, gyms, librerías

### Semana 3 (Jun 9 – Jun 15) — SEGUIMIENTO Y COTIZACIÓN
- Toda visita agendada se hace dentro de 48 h del primer contacto
- Cada cotización sale el mismo día de la visita
- Follow-up automático: a 24 h por texto, 48 h por email, 7 días recordatorio
- **No bajar precios para cerrar.** Mejor 1 contrato a margen sano que 3 a pérdida.

### Semana 4 (Jun 16 – Jun 23) — CIERRE Y APRENDIZAJE
- Convertir 1–2 cotizaciones en contrato firmado
- Cobrar deposit (típicamente 30–50%)
- **Documentar lo aprendido**: qué canal dio el lead, qué precio aceptaron, qué objeciones hubo
- Pedir foto de "después" + permiso para testimonial al primer cliente cerrado del ciclo

---

## 🚧 FUGAS CRÍTICAS DEL FUNNEL (HALLAZGOS AL REVISAR EL SITIO VIVO 2026-05-23)

| # | Problema | Página | Impacto en conversión | Owner |
|---|---|---|---|---|
| 1 | Imágenes hero/servicios/portfolio cargan como **SVG placeholder base64** en vez de fotos reales | Home, Services, Portfolio | 🔴 Mata credibilidad. Visitante asume sitio incompleto. | Jefe (fotos) + ALEX (subir) |
| 2 | NO se ve form embebido en /contact/ ni /quote/ via curl (puede ser que SureForms requiera JS — verificar en browser) | /contact/, /quote/ | 🔴 Si no carga = cero captura | ALEX (verificar) |
| 3 | "Custom Cabinets vs Stock" post (id 2299) en draft, decisión pendiente | Blog | 🟡 Confusión de mensaje | Jefe (decidir delete/rewrite) |
| 4 | Horarios inconsistentes: header dice "Mon-Fri 8am-5pm", footer dice "Mon-Fri 8am-6pm" | Todo el sitio | 🟡 Profesionalismo | ALEX (alinear con Jefe) |
| 5 | Navegación duplicada en algunas vistas | Home | 🟡 UX confuso | ALEX |
| 6 | WhatsApp link no funciona en desktop | Header / CTAs | 🟡 Pérdida de leads desktop | ALEX |
| 7 | License # / carrier de seguro no visibles | Footer / About | 🟡 Trust signal débil | Jefe (datos) + ALEX (render) |
| 8 | Sin precios "starting at" en servicios | /services/* | 🟡 Visitante no se auto-cualifica | Jefe (definir) + ALEX (render) |
| 9 | Sin testimonios con nombre visibles | Home, services | 🔴 Cero social proof | Jefe (recoger) + ALEX (render) |
| 10 | 0 reviews en GMB | Externo | 🔴 Local SEO + social proof | Jefe (pedir) |

**Las 🔴 son las que se atacan en Semana 1. El resto se barre en Semana 2–3.**

---

## 🏢 BRAND FACTS (para que Claude no invente)

**Razón social:** Geo Carpentry LLC
**Dueño:** Jorge Cruz (bilingüe EN/ES)
**Dirección:** 735 E Walnut St Suite 3, Green Bay, WI 54301
**Teléfono:** (920) 367-1272
**WhatsApp:** +1 920 934 0351
**Email:** admin@geocarpentry.com
**Web:** https://geocarpentry.com

**Tagline:** "Built to Last. Crafted with Pride."

**Años en el negocio:** ⚠️ Hay contradicción en docs internos (15+ vs 12+). El sitio en vivo dice **"12+ Years"** — usar ese hasta que Jefe confirme. Fundado ~2014.

**Cobertura geográfica:** Green Bay + radio de 100 millas en NE Wisconsin. 17 ciudades concretas en LocalBusiness schema:
Green Bay, Appleton, Oshkosh, Howard, De Pere, Allouez, Bellevue, Suamico, Sheboygan, Neenah, Menasha, Fond du Lac, Two Rivers, Marinette, Oconto, Little Suamico, Seymour.

### Servicios que SÍ hacen (6, alineados al sitio)
1. **Kitchen Remodeling** ($5K–$30K)
2. **Bathroom Remodeling** ($3K–$15K)
3. **Deck Building & Repair** ($2K–$12K)
4. **Finish Carpentry & Trim** (crown molding, baseboards, casings, hardwood floors, stairs — $500–$8K)
5. **Home Renovation** (basements, additions, room refreshes — $5K–$50K)
6. **General Construction & Custom Builds** (new homes, additions, garages, framing, permits — $3K–$100K+)

### ⚠️ Servicios que NO hacen — NO PROMETER
- Custom cabinets / custom closets
- Custom built-in shelving
- Custom woodwork (en sentido fine-furniture)

Jefe corrigió esto explícitamente el 2026-05-15 y se removieron 7 menciones del sitio. Si una nueva sesión de Claude propone añadir copy sobre "custom cabinets" o similar, **rechazar**.

### Idiomas
Equipo bilingüe EN/ES. El sitio tiene toggle EN/ES. **Regla:** no mezclar EN y ES en el mismo párrafo. Mantener mono-language por elemento.

### Brand colors (current — no usar otros)
- Navy: `#1B2A4A`
- Orange: `#FF6B00`
- Cream: `#FAF7F0`
- Charcoal: `#0A0A0A`
- White: `#FFFFFF`

⚠️ El workflow `setup-geocarpentry.yml` tiene hardcodeados colores VIEJOS (`#0d2137`, `#c85a14`). Si se va a re-correr el workflow, actualizar primero.

### Licensing / seguro
- WI DSPS license #: **TODO(jefe) — falta**
- Carrier de seguro: **TODO(jefe) — falta**
- GL amount: **TODO(jefe) — falta**
- Workers Comp status: **TODO(jefe) — falta**

Hasta tenerlos, dejar placeholders `TODO(jefe)` en el código, NO inventar números.

---

## ⚙️ STACK TÉCNICO OPERACIONAL

### Hosting
- **Hostinger** shared hosting, IP `156.67.74.243`
- SSH: `u433637438@156.67.74.243:65002`
- Key SSH: `geobudgetpro` (RSA 4096 PEM)
- Web root: `/home/u433637438/domains/geocarpentry.com/public_html/`

### DNS
- **Provider: Squarespace** (NO Cloudflare — lección aprendida con dolor)
- Records vivos: A → 156.67.74.243, CNAME www → geocarpentry.com, MX Google Workspace (5 records), Apple verification, Squarespace Domain Connect preset, 2× Google site verification
- **CAA: vacío** (cualquier registro CAA bloquea la renovación SSL de Let's Encrypt — no agregar)

### SSL
- Let's Encrypt vía Hostinger
- Vigente hasta **2026-08-13**, auto-renueva (siempre que CAA siga vacío)

### WordPress
- Versión 6.9.4
- Parent theme: Astra (free)
- Child theme: `geo-carpentry-child`
  - En repo: `automation/wordpress/child-theme/`
  - En live: `wp-content/themes/geo-carpentry-child/`
- Plugins: SureForms, SureRank (SEO), Spectra (page builder), LiteSpeed Cache
- Admin: https://geocarpentry.com/wp-admin (`admin@geocarpentry.com`)

### Páginas clave (IDs)
- 2282 Home · 2283 About · 2284 Services · 2285 Portfolio · 2292 Contact
- Service detail: 2288–2291, 2326

### Form de captura
- SureForms ID **2340**
- Pensado para vivir en `/contact/` (verificar embebido en producción)
- 7 campos: Name, Email, Phone, City, Service Type, Budget, Message
- Button text: "Get My Free Estimate" (antes decía "Submit" 🚨)

### mu-plugin de captura → Airtable
- File: `wp-content/mu-plugins/geo-airtable-lead-capture.php`
- Webhook de SureForms → Airtable
- Constantes en `wp-config.php`: `AIRTABLE_TOKEN`, mapeos de campos
- Test 2026-05-15: submit → row en Airtable Leads en < 2 segundos ✅

### Airtable
- Base ID: `appAQpveuAec077jF`
- Tablas: Contacts, Leads, Jobs, Subcontractors, Activities, Permits, SEO_Audits, Content_Queue (`tblpiN42pK3YFxGEW`)
- URL: https://airtable.com/appAQpveuAec077jF

### Email
- Google Workspace
- Cuenta principal: `admin@geocarpentry.com`
- Cuenta agentes: `alexgeocarpentry@gmail.com`

### Agentes externos (corren fuera del sitio)
- **Posicionador** (SEO audit semanal): `agents/posicionador/posicionador.mjs` — escribe a tabla SEO_Audits
- **Escriba** (generación de blog posts bilingüe): `agents/escriba/` — escribe a Content_Queue
- **Cartógrafo** (analytics GA4 + GSC): pendiente OAuth init local

### Cache
- LiteSpeed Cache. Purga: `wp litespeed-purge all` vía SSH

### Backups
- Convención: `.bak.YYYYMMDD` en cualquier archivo reemplazado
- Backups de WP posts editados: `~/.geo_backups/<id>_<timestamp>.txt`

---

## 🎓 12 LECCIONES NO-NEGOCIABLES (de daño real ya sufrido)

Resumen accionable. Detalle completo en `memoria.md` del repo.

1. **PHP PCRE no soporta lookbehinds de ancho variable.** Usar solo fixed-width.
2. **Todo `preg_replace` sobre `the_content` requiere null-check** antes de reasignar. Sin esto, un fallo de regex tumba el contenido entero del post.
3. **Nunca aplicar `opacity:0` / `display:none` / `visibility:hidden` a clases existentes.** Crear clases NUEVAS opt-in (`.gc-fade-in`).
4. **Screenshots de browser son obligatorios** para cambios visuales. `curl`/WebFetch no ejecutan JS, dan falsos OK.
5. **Cada asset referenciado debe estar commiteado en el mismo PR.** Sin espacios en nombres de archivo.
6. **Mobile-first siempre.** Hero ≤ 85vh en móvil, tap targets ≥ 44px.
7. **SEO score ≠ conversión.** Un sitio puede tener 90/100 en Posicionador y vender cero si no tiene fotos.
8. **DNS es Squarespace, CAA vacío.** Cualquier CAA bloquea renovación SSL.
9. **Filtros en cadena: guarda cada paso.** Un fallo upstream tumba todos los downstream.
10. **Pre-merge checklist obligatorio** (8 items, ver `memoria.md` sec 8).
11. **Anti-regression patterns de PR #3**: assets faltantes, regex agresiva sin null-safety, selectores CSS overly broad, hero ≥88vh.
12. **Comunicación con Jefe**: directo, evidencia con file:line, sin "yo creo / quizás", marcar `TODO(jefe)` para cosas que requieren su input.

---

## 🚦 REGLAS DE TRABAJO PARA FUTURAS SESIONES DE CLAUDE

### Antes de proponer cualquier cosa
1. Leer este archivo entero
2. Leer `memoria.md` del repo para las 12 lecciones detalladas
3. Hacer `git log --oneline -10` para ver qué se hizo recientemente
4. Preguntar: **¿esto genera o acelera ingresos esta semana?**

### División ALEX / Jules (subagentes)
- **ALEX (Claude Opus)** = arquitectura, decisiones, deploys complejos, schema markup, debugging de filtros PHP, comunicación con Jefe
- **Jules** = tareas mecánicas (lint, dead code, broken links, regex hardening, schema markup ya definido)
- **Jules NO rediseña visualmente nada autónomamente.** El diseño se hace en Claude.ai con Artifacts; Jefe lo aprueba; ALEX lo traduce a CSS.

### Flujo de cambios visuales (Artifacts loop)
1. Jefe pide diseño de sección en Claude.ai
2. Claude produce Artifact (HTML/Tailwind preview)
3. Jefe itera hasta que aprueba
4. Jefe manda screenshot del Artifact a ALEX
5. ALEX traduce a CSS en `geo-carpentry-child` y deploya
6. ALEX captura screenshot vivo y confirma parity
7. Siguiente sección

### Antes de cualquier merge
Copiar este checklist al PR:
```
- [ ] No lookbehinds de ancho variable en PCRE
- [ ] Null-check en cada preg_replace antes de reasignar
- [ ] No opacity:0 / display:none en clases existentes
- [ ] Todos los assets referenciados están commiteados (no espacios en nombres)
- [ ] Tested en móvil 375px (sin scroll horizontal, tap targets ≥44px)
- [ ] Hero min-height ≤85vh en móvil
- [ ] Screenshot browser desktop 1400×2400 adjuntado
- [ ] Screenshot browser mobile 375×1200 adjuntado
- [ ] Sin copy de "custom woodwork / custom cabinets"
- [ ] Colores brand: #1B2A4A navy, #FF6B00 orange, #FAF7F0 cream
- [ ] Bilingüe mono-language por elemento (no mezclar EN+ES en mismo párrafo)
- [ ] Filtros existentes siguen funcionando después del cambio
- [ ] LiteSpeed cache purge documentado en pasos de deploy
```

### Idioma
Jefe habla español. PRs, commits y código en inglés. Conversación en español, switch a inglés solo cuando hablamos de código.

---

## 📌 TODO(jefe) — ACCIONES PENDIENTES (ranked por impacto en ingresos)

### Esta semana (May 24–31) — bloquean ingresos
- [ ] Fotos hi-res de 10–15 proyectos (2 h)
- [ ] Retrato Jorge + cuadrilla (30 min)
- [ ] 3–5 testimonios con nombre (30 min)
- [ ] Aceptar invite GMB (1 min)
- [ ] Datos licensing + seguro (15 min)
- [ ] Decisión: form mobile reorder sí/no (1 min)
- [ ] Decisión: post 2299 "Custom Cabinets" delete/rewrite (1 min)

### Próximas 2 semanas — necesarias para arrancar canales
- [ ] Lista de 30–50 contactos personales para network blast (1 h)
- [ ] Crear 4 listings FB Marketplace (1 h)
- [ ] Unirse a 10 grupos FB locales (15 min)
- [ ] Pedir review a 5 ex-clientes vía GMB link (15 min)
- [ ] Imprimir 500 door hangers VistaPrint (~$50, único gasto)
- [ ] Door knocking: 150 puertas en 5 vecindarios (10–15 h en 5 días)

### Operacional / agentes (no urgente pero útil)
- [ ] Activar cron Posicionador en hPanel (2 min)
- [ ] OAuth init Cartógrafo + Search Console en PowerShell Windows (5 min)
- [ ] Aprobar 2 planes de artículos Escriba en Content_Queue (5 min)

### Decisión July
- [ ] Aprobar presupuesto Google Ads $300–500/mes a partir de julio (decisión)
- [ ] Definir plataforma de automatización de follow-up (n8n / Zapier / cron + mu-plugin)

---

## 🗂️ QUICK REFERENCE — ARCHIVOS Y CREDENCIALES

| Cosa | Valor |
|---|---|
| Repo | `geocarp24/geo-carpentry` |
| Production | https://geocarpentry.com |
| Staging (alive) | https://blueviolet-gerbil-900105.hostingersite.com |
| WP Admin | https://geocarpentry.com/wp-admin |
| Hostinger SSH | `u433637438@156.67.74.243:65002` |
| Web root | `/home/u433637438/domains/geocarpentry.com/public_html/` |
| Child theme path | `wp-content/themes/geo-carpentry-child/` |
| mu-plugin | `wp-content/mu-plugins/geo-airtable-lead-capture.php` |
| Form ID | SureForms `2340` en `/contact/` |
| Airtable base | `appAQpveuAec077jF` |
| Content_Queue table | `tblpiN42pK3YFxGEW` |
| GMB email | `alexgeocarpentry@gmail.com` |
| DNS panel | https://account.squarespace.com/domains/managed/geocarpentry.com/dns/dns-settings |
| hPanel | https://hpanel.hostinger.com |
| Airtable UI | https://airtable.com/appAQpveuAec077jF |
| Cache purge | `wp litespeed-purge all` (vía SSH) |
| Backups WP | `~/.geo_backups/<id>_<timestamp>.txt` |

### Archivos clave en el repo
- `memoria.md` — briefing original, 12 lecciones detalladas
- `automation/CUTOVER_STATUS_2026-05-15.md` — estado post-go-live
- `automation/OVERNIGHT_REPORT_2026-05-15.md` — sprint summary
- `automation/LEAD_GEN_WEEK_1.md` — 5 prioridades, templates EN+ES, KPIs
- `automation/SEO_PLAN_CONSOLIDADO.md` — roadmap SEO 3 fases
- `automation/GMB_ACTIVATION_KIT.md` — copy listo para GMB
- `automation/WEBSITE_POLISH_AUDIT.md` — auditoría detallada, 10 prioridades por ROI
- `automation/HOSTINGER_DEPLOY_GUIDE.md` — SSH + workflow + pre-mod checklist
- `docs/curated/GEOCARPENTRY_MEMORIA.md` — estrategia curada, market analysis
- `Claude/MEMORIA_PROYECTO_GeoCarpentry_BudgetBuilder.md` — proyecto budget/estimación

---

## 🔁 ROLLBACK RUNBOOK (si algo truena)

**Si el sitio se cae:**
1. hPanel → File Manager → restaurar `wp-config.php.bak.geo`
2. Restaurar child theme: `cp style.css.bak.20260515 style.css && cp functions.php.bak.20260515 functions.php` (en `/wp-content/themes/geo-carpentry-child/`)
3. WP-CLI: `wp post-content < ~/.geo_backups/<id>_<timestamp>.txt` para páginas individuales

**Si el form rompe:**
1. WP admin → SureForms → Form 2340 → revertir a baseline
2. O `wp post update 2340 --post_status=draft` para sacarlo offline

**Si el cache está stale:**
- `wp litespeed-purge all` desde SSH (cuando sea)

---

## 🧭 DECLARACIÓN DE INTENCIÓN PARA CADA NUEVA SESIÓN

> Soy una sesión nueva de Claude trabajando para Geo Carpentry LLC.
> Mi prioridad #1 no es escribir código bonito, es **generar ingresos para Jefe**.
> Cada propuesta mía pasa primero por: "¿esto trae un contrato esta semana, o me distrae?"
> Si me distrae, propongo otra cosa.
> Si Jefe me pide hacer algo no-prioritario, lo hago sin discutir, pero le aviso que está fuera del path crítico de ingresos.
> Respeto las 12 lecciones. Verifico con browser screenshots cualquier cambio visual.
> Marco `TODO(jefe)` cuando necesito datos suyos en vez de inventar.

— ALEX (`claude-opus-4-7`)
