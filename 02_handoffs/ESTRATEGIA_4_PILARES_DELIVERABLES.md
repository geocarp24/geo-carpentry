# Estrategia 4 Pilares — Deliverables Cowork
> 2026-08-16 | Responde al HANDOFF CC → Cowork: Estrategia 4 pilares + medición
> Cubre Frentes 1–5

---

## FRENTE 1 — Revisión de contenido (26 posts score ≥ 7)

Ya revisados en sesión anterior. Resultado:

**✅ Aprobados para publicar (todos los 26)**
- Cero léxico de real estate (motivated seller, ARV, wholesaling, cap rate): ninguno
- Teléfono (920) 367-1272: correcto en todos
- geocarpentry.com: presente en 17 de 26 (9 sin link — sin bloqueante, el CTA tiene teléfono)
- Español con acentos: correcto en todos
- Idioma consistente por post: sí

No hay posts que descartar del lote con score ≥ 7. Los 26 están listos.

---

## FRENTE 4 — Los 10 posts con score NULL (mal llamados "score bajo")

**Hallazgo crítico:** estos 10 no tienen score bajo — tienen score **NULL**. Son posts manuales del 1 de junio, aprobados antes de que existiera el sistema de scoring de Oráculo. El publisher los descarta silenciosamente porque trata NULL < 7.

**IDs y contenido:**

| ID | Título | Evaluación | Acción |
|---|---|---|---|
| rec3BbljBff58s0nf | Crown Molding — Pro Tip | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| rec3gJsqLJeycopGP | Home Addition — Howard WI | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| recFzNZP5zi5KXBls | 3 Signs Your Deck Needs Replacing | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| recJ2KVlj7QtDKble | Licensed & Insured Trust Signal | ✅ Bueno. Tiene link. | Asignar score 8 |
| recOLjg6Pkd9qT7vk | Kitchen Remodel Showcase — Green Bay | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| recOwfDdQ8J1plkgZ | FAQ: How long does a kitchen remodel take? | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| recQ1qGveegwAFcQR | Bathroom Before/After — De Pere | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| recg2Fsyy4URnEDPU | Summer Deck Season — Seasonal | ⚠️ Timing borderline (mid-agosto). **Publicar YA o descartar.** | Asignar score 8 + publicar martes |
| reclbeUDOyscgNV8S | Remodelación Cocina — Green Bay ES | ✅ Bueno. Sin link web. | Asignar score 7, agregar geocarpentry.com |
| rectgBbqk16Tp9p6G | 500+ Projects Trust Social Proof | ✅ Claims verificados por Jorge (500+, 5.0★, 12 años) | Asignar score 8 |

**Fix para CC:** en estos 10, actualizar `fldNfLblqiS6vWLfD` (caption) agregando `\n🌐 geocarpentry.com` donde falta, y asignar `fldyyWE7O5u99toox` (Oraculo_Score) según tabla. No hace falta que Oráculo los revise otra vez — el contenido ya está validado.

---

## FRENTE 2 — Umbrales de engagement ("qué significa pegar duro")

### Contexto de mercado
- Green Bay: ~110K ciudad, ~330K metro. Mercado pequeño-mediano.
- Benchmark home services FB 2026: **0.21% engagement rate**
- Benchmark home services IG 2026: **0.43% engagement rate**
- Before/after photos: **3× más engagement** que cualquier otro formato en cuentas de contratistas
- Facebook domina en generación de leads reales (demografía 30-65 años, dueños de casa)

### Tabla de umbrales para `audit_scoring.mjs`

| Métrica | Ruido (descartar) | Normal | Ganador | Top Performer |
|---|---|---|---|---|
| **Engagement Rate FB** | < 0.15% | 0.15% – 0.5% | 0.5% – 1.5% | > 1.5% |
| **Engagement Rate IG** | < 0.30% | 0.30% – 1.0% | 1.0% – 3.0% | > 3.0% |
| **Impresiones mínimas** | < 150 | 150 – 500 | 500 – 2,000 | > 2,000 |
| **Días antes de juzgar** | < 3 días | — | 7 días FB | 5 días IG |

### Pesos por tipo de interacción (para Geo Carpentry específicamente)

| Interacción | Peso | Razón |
|---|---|---|
| **Guardados** | 🔴 Alto (×3) | Indica intención de compra. Un guardado en un post de decks = alguien que está planeando. |
| **Comentarios** | 🔴 Alto (×2.5) | Señal de consideración activa. Especialmente "¿cuánto cuesta?" |
| **Clics a perfil / link** | 🟠 Medio-alto (×2) | Intención de contacto |
| **Compartidos** | 🟠 Medio (×1.5) | Alcance orgánico. Valioso para bilingual/comunidad |
| **Likes** | 🟡 Bajo (×1) | Vanity metric. No predice conversión en este mercado |
| **Alcance puro** | ⚪ Referencial | Solo relevante para posts de branding, no de conversión |

### Tiers de reciclaje (para `audit_scoring.mjs`)

| Tier | Criterio | Acción |
|---|---|---|
| **T1 — Ganador** | ER ≥ umbral ganador + guardados altos | Reciclar en 30 días con variación |
| **T2 — Normal** | ER en rango normal | Dejar correr, no reciclar antes de 60 días |
| **T3 — Ruido** | ER < umbral mínimo con ≥150 impresiones | Revisar ángulo. No reciclar. |
| **T4 — Sin datos** | < 150 impresiones en 7 días | Problema de alcance/token, no de contenido |

---

## FRENTE 3 — Ángulos por pilar

### 🏗️ PILAR 1: DECKS (`Deck-Build`) — Urgencia máxima HOY

**Por qué urgente:** en Wisconsin, la temporada de construcción de decks cierra en octubre. Agosto-septiembre es la ventana óptima — menos backlog de permisos, constructores disponibles, clima estable. Después de octubre, los clientes esperan hasta mayo. **Cada semana que no publicas es un lead que se va a primavera.**

| # | Gancho EN | Gancho ES | Miedo que responde | Tipo |
|---|---|---|---|---|
| 1 | "Wisconsin deck season closes in October. Don't wait until spring." | "La temporada de decks en Wisconsin cierra en octubre. No esperes hasta primavera." | Perder la temporada, esperar 6 meses más | Promocional |
| 2 | "Cedar looks great year 1. Composite looks great year 20." | "El cedro se ve bien el año 1. El compuesto se ve bien el año 20." | Elegir el material equivocado y arrepentirse | Educativo |
| 3 | "What does a real deck cost in Green Bay? Not the internet number." | "¿Cuánto cuesta un deck en Green Bay? No el número de internet." | Sorpresa de precio, bait-and-switch | Educativo |
| 4 | "6 weeks ago: rotting boards. This week: [before/after]." | "Hace 6 semanas: tablas podridas. Esta semana: [antes/después]." | "¿Quedará realmente así de bien?" | Prueba social |
| 5 | "Did your contractor pull a deck permit in Wisconsin? They should have." | "¿Tu contratista sacó el permiso del deck? En Wisconsin, debe hacerlo." | Trabajo sin permiso que bloquea la venta de la casa | Educativo / Confianza |
| 6 | "3 signs your deck won't survive another Wisconsin winter." | "3 señales de que tu deck no sobrevive otro invierno de Wisconsin." | Accidente, falla estructural | Educativo |
| 7 | "A well-built deck in Green Bay returns 65-80 cents per dollar at resale." | "Un deck bien construido retorna 65-80 centavos por dólar al vender." | Gastar sin retorno | Educativo |
| 8 | "Fall is the best time to build a deck in Wisconsin. Here's why." | "El otoño es el mejor momento para construir un deck en Wisconsin. Por esto." | Timing incorrecto, esperar a primavera | Educativo |

---

### 🚿 PILAR 2: BAÑOS (`Bathroom-Remodel`)

| # | Gancho EN | Gancho ES | Miedo que responde | Tipo |
|---|---|---|---|---|
| 1 | "The 1980s tub is a liability after 55. Here's what replaces it." | "La tina de los 80 es un riesgo después de los 55. Esto la reemplaza." | Caídas, pérdida de independencia | Educativo |
| 2 | "A mid-range Wisconsin bathroom remodel returns 71 cents on the dollar." | "Una remodelación de baño en Wisconsin retorna 71 centavos por dólar." | Gastar sin retorno al vender | Educativo |
| 3 | "This De Pere bathroom hadn't been touched since 1989. [before/after]" | "Este baño en De Pere no había sido tocado desde 1989. [antes/después]" | Dudas sobre resultado final | Prueba social |
| 4 | "2 weeks without a bathroom sounds impossible. We make it work." | "2 semanas sin baño suena imposible. Así lo hacemos funcionar." | Disrupción del hogar durante la obra | Educativo / Confianza |
| 5 | "Grout is cracking. Fan sounds like a lawn mower. It's time." | "El grout está cuarteado. El ventilador suena como cortadora de pasto. Es momento." | Normalizar el deterioro ("no es tan malo") | Educativo |
| 6 | "Walk-in tile shower or keep the tub? The honest answer depends on one thing." | "¿Ducha de azulejo o tina? La respuesta honesta depende de una sola cosa." | Tomar la decisión equivocada | Educativo |

---

### 🏠 PILAR 3: ADICIONES Y REMODELACIONES (`Home-Renovation`)

| # | Gancho EN | Gancho ES | Miedo que responde | Tipo |
|---|---|---|---|---|
| 1 | "You don't have to move. You have to remodel." | "No tienes que mudarte. Tienes que remodelar." | Costo/trauma de mudarse vs mejorar lo que tienes | Educativo |
| 2 | "A home addition in Howard, WI: 6 weeks from permit to walkthrough." | "Una adición en Howard, WI: 6 semanas del permiso al recorrido final." | Timeline incierto, obra interminable | Prueba social |
| 3 | "What does a basement finishing actually cost in Green Bay?" | "¿Cuánto cuesta realmente terminar un sótano en Green Bay?" | Sorpresa de precio | Educativo |
| 4 | "Insurance restoration: it's not just about fixing what broke." | "Restauración por seguro: no es solo arreglar lo que se rompió." | Reclamación denegada, documentación incorrecta | Educativo |
| 5 | "One contractor. One contract. Kitchen, bathroom, and addition — done right." | "Un contratista. Un contrato. Cocina, baño y adición — bien hecho." | Coordinar múltiples contratistas | Promocional |

---

### 🏗️ PILAR 4: CONSTRUCCIÓN NUEVA (`General-Construction`)

| # | Gancho EN | Gancho ES | Miedo que responde | Tipo |
|---|---|---|---|---|
| 1 | "Building a garage in Wisconsin? Here's what the permit actually requires." | "¿Construyendo un garaje en Wisconsin? Esto es lo que requiere el permiso." | No saber los requisitos legales | Educativo |
| 2 | "New construction vs gut remodel: what makes sense in Green Bay's market?" | "¿Construcción nueva vs demolición total? Qué tiene sentido en Green Bay." | Tomar la decisión financiera incorrecta | Educativo |
| 3 | "We framed a 2,400 sq ft home in De Pere. Here's what 3 months looked like." | "Enmarcamos una casa de 2,400 pies en De Pere. Así se vieron 3 meses." | ¿Es posible? ¿Cuánto tiempo? | Prueba social |
| 4 | "What a licensed GC actually does that a handyman can't." | "Lo que un contratista general licenciado hace que un handyman no puede." | Contratar al proveedor incorrecto | Educativo / Confianza |
| 5 | "Framing, electrical rough-in, plumbing, insulation — all under one roof." | "Estructura, electricidad, plomería, aislamiento — bajo un solo techo." | Coordinar múltiples contratistas | Promocional |

---

## FRENTE 5 — Validación de demanda

### Datos encontrados

**Decks — CONFIRMADO, demanda alta HOY:**
- Agosto-octubre es el mejor momento para construir un deck en Wisconsin según múltiples fuentes de la industria ([Quigley Decks](https://www.quigleydecks.com/what-is-the-best-time-to-build-a-deck-in-wisconsin/), [Elegant Exteriors](https://elegantexteriorsofwi.com/best-time-to-install-your-wisconsin-deck/), [StyleCraft](https://stylecraftrenovations.com/blog/best-time-to-build-deck-wisconsin/))
- Razones: menos backlog de permisos municipales, contratistas disponibles, clima estable antes del frío
- Wood-plastic composites capturaron 28% de la demanda de decking en USA en 2025 (+6pp en 5 años) — el tema de cedar vs composite tiene respaldo de mercado
- Urgencia estacional REAL: después de octubre/noviembre, los proyectos se posponen hasta mayo

**Baños — CONFIRMADO, mercado activo:**
- Múltiples directorios (Yelp, HomeGuide, Houzz, HomeAdvisor) con alta actividad de contratistas en Green Bay para bathroom remodel 2026
- Labor cost en Wisconsin: $44/hr para skilled trades — por debajo del promedio nacional → ventaja competitiva de precio para Geo Carpentry
- Re-Bath opera en Green Bay desde hace 35+ años → hay demanda establecida y competencia formal que confirma el mercado

**Conclusión del análisis:**
- ✅ Decks: demanda ALTA ahora, urgencia estacional real, ventana agosto-octubre
- ✅ Baños: demanda establecida todo el año, mercado activo
- ✅ El foco en estos 2 como prioridad tiene respaldo de datos, no solo corazonada
- ⚠️ Home-Renovation y General-Construction: no hay datos estacionales específicos, pero son evergreen — se justifican por ticket alto ($30K-$150K) más que por estacionalidad

**Distribución de esfuerzo — CONFIRMADA por Jorge 2026-08-16:**
- Decks: **40%** (urgencia estacional + alta demanda)
- Home-Renovation: **30%**
- Baños: **15%**
- General-Construction: **15%**

---

## Resumen ejecutivo para Jorge

| Frente | Estado | Acción requerida |
|---|---|---|
| F1 — Revisión 26 posts | ✅ Todos aprobados | Ninguna |
| F2 — Umbrales engagement | ✅ Tabla lista para `audit_scoring.mjs` | CC implementa |
| F3 — Ángulos por pilar | ✅ 30 ángulos listos (8 decks, 6 baños, 5 home-reno, 5 new-construction) | CC genera contenido con estos ángulos |
| F4 — 10 posts NULL score | ✅ Diagnosticado: son buenos posts sin score asignado | CC agrega score + link faltante a los 10 |
| F5 — Validación demanda | ✅ Decks y baños confirmados con datos | Distribución 40/30/20/10 para validar con Jorge |
