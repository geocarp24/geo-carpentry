# MEMORIA DE PROYECTO — GEO CARPENTRY LLC
## Budget Builder App + Contexto Completo del Negocio
**Para:** Claude Opus (o cualquier instancia de Claude)
**Preparado por:** Claude Sonnet (sesión anterior)
**Fecha:** March 26, 2026
**Propósito:** Continuidad total del proyecto sin re-explicaciones

---

## 1. QUIÉN ES EL CLIENTE

**Nombre:** Jorge Cruz
**Empresa principal:** Geo Carpentry LLC (S-Corp)
**Ubicación:** Green Bay, Wisconsin
**Website:** geocarpentry.com
**Otros negocios:** FC Multiservices LLC (preparación de impuestos) · Health & Wellness Hub

### Perfil de Jorge
- Emprendedor con múltiples negocios
- Nivel técnico: intermedio-avanzado (usa Make.com, Claude Code, herramientas de automatización)
- Prefiere explicaciones simples y directas ("explícame como a un niño de 5 años")
- Trabaja de forma orientada a tareas y documentos
- Quiere **100% de confianza** en sus entregables antes de presentarlos a clientes
- Idioma de trabajo: español (el código y documentos técnicos en inglés están bien)

### Reglas importantes con Jorge
- **Nunca exponer información personal o de trabajo sin su autorización**
- **Siempre pedir permiso antes de acciones sensibles** (financieras, personales, etc.)
- Ser profesional y buscar siempre la solución más costo-efectiva
- No asumir — preguntar si hay duda

---

## 2. CONTEXTO DEL NEGOCIO — GEO CARPENTRY LLC

### Situación actual
- Empresa de carpintería y construcción general operando en Green Bay, WI
- **Modelo actual:** B2B (proyectos para contractors)
- **Modelo futuro:** B2C (servicios directos a homeowners) — transición planeada para Spring 2026

### Estrategia de transición B2B → B2C
- **Website:** Migrando de Mixo → Durable (misma plataforma que FC Multiservices)
- **SEO local:** Google My Business por configurar, optimización para Green Bay
- **Timeline de lanzamiento B2C:** Abril–Junio 2026

#### Fases del plan de marketing B2C
| Fase | Periodo | Acción |
|------|---------|--------|
| Foundation | Abril 2026 | Migrar a Durable, configurar GMB, crear 5 páginas core |
| Content & SEO | Mayo 2026 | 5 service pages, 5 blog posts, schema markup |
| Credibility | Mayo–Jun 2026 | Reviews, testimonios, portfolio, video |

### Servicios de Geo Carpentry
- Carpentry (custom woodwork, framing)
- General construction
- Renovations & remodeling
- Kitchen, bathroom, deck building (servicios B2C clave)

### Información faltante (pendiente de confirmar con Jorge)
- [ ] Teléfono de Geo Carpentry
- [ ] Email de Geo Carpentry
- [ ] Área de servicio exacta (¿solo Green Bay o todo Wisconsin?)
- [ ] Años de experiencia
- [ ] Certificaciones / licencias
- [ ] Tamaño del equipo

---

## 3. EL PROYECTO ACTUAL — BUDGET BUILDER APP

### ¿Qué es?
Una **aplicación web de presupuestos de construcción** creada para Geo Carpentry LLC que permite:
1. Subir un plano PDF y que la IA (Claude API) lo analice automáticamente
2. Revisar y editar cada precio (materiales + labor) en campos editables en tiempo real
3. Agregar o eliminar divisiones manualmente
4. Ver totales calculados automáticamente
5. Guardar presupuestos con historial persistente (entre sesiones)
6. Exportar un PDF profesional listo para el cliente

### Por qué se construyó
Jorge necesitaba más que un PDF estático de presupuesto. Quería **control total** sobre cada número antes de presentarlo a un cliente — editar precios reales de materiales y labor en Wisconsin, agregar divisiones que él conoce, y tener 100% de confianza en el resultado final.

### Caso de uso que lo originó
Se analizó el plano arquitectónico **"Laundrie Plan 9-15-2025"** (nueva residencia para la Familia Laundrie, Wisconsin). El plano tiene 6 páginas:
- Pág. 1: Elevaciones (Front, Rear, Left, Right)
- Pág. 2: Main Floor Plan — **2,874 sq ft** (paredes 9-1/8"), Garaje 4 carros — **1,481 sq ft** (paredes 10-3/4")
- Págs. 3-4: Foundation Plan — Sótano 8" walls, áreas sin excavar
- Págs. 5-6: Roof Plan (pendientes 4:12, 5:12, 6:12, falso dormer) + Wall Section

El presupuesto generado para este proyecto fue de aproximadamente **$718,200** con 17 divisiones CSI.

---

## 4. ARQUITECTURA TÉCNICA DE LA APP

### Tecnología usada
- **Frontend:** HTML + CSS + JavaScript vanilla (no React — corre directo en el navegador dentro de Claude)
- **IA:** Claude API (`claude-sonnet-4-20250514`) para análisis de PDFs
- **Storage:** `window.storage` (API de Claude para persistencia entre sesiones)
- **Export PDF:** `window.open()` + ventana de impresión del navegador (sin librerías externas)
- **Entorno:** Widget interactivo dentro de Claude.ai (iframe sandbox)

### Estructura de datos

#### Budget object
```javascript
{
  id: "abc123",                    // uid único
  projectName: "New Project",
  client: "The Laundrie Family",
  location: "Green Bay, WI",
  date: "March 26, 2026",
  contingencyPct: 5,               // porcentaje de contingencia editable
  divisions: [Division]            // array de divisiones
}
```

#### Division object
```javascript
{
  id: "xyz789",          // uid único por división
  num: "01",             // número CSI (01-17)
  name: "Site Work & Excavation",
  items: "Line 1\nLine 2\nLine 3",   // alcance separado por \n
  mat: 12000,            // materiales en dólares (número entero)
  lab: 10000             // labor en dólares (número entero)
}
```

#### Storage
- Clave: `"geo-budgets-v3"`
- Valor: JSON array de budgets guardados
- Cada entry guardada incluye: `{id, projectName, client, date, total, data: Budget}`

### Cálculo de totales
```javascript
mat  = suma de todos d.mat
lab  = suma de todos d.lab
sub  = mat + lab
cont = round(sub * contingencyPct / 100)
grand = sub + cont
```

### Divisiones CSI por defecto (17 divisiones pre-cargadas)
| # | División | Mat default | Lab default |
|---|----------|-------------|-------------|
| 01 | Site Work & Excavation | $12,000 | $10,000 |
| 02 | Concrete & Foundation | $30,000 | $28,000 |
| 03 | Framing – Rough Carpentry | $48,000 | $52,000 |
| 04 | Roofing | $28,000 | $22,000 |
| 05 | Windows & Exterior Doors | $42,000 | $8,000 |
| 06 | Exterior Finishes & Siding | $32,000 | $18,000 |
| 07 | Insulation | $10,000 | $6,500 |
| 08 | Drywall | $14,000 | $18,000 |
| 09 | Interior Carpentry & Millwork | $22,000 | $18,000 |
| 10 | Cabinets & Countertops | $48,000 | $9,000 |
| 11 | Flooring | $18,000 | $9,000 |
| 12 | Plumbing | $18,000 | $24,000 |
| 13 | HVAC | $16,000 | $20,000 |
| 14 | Electrical | $14,000 | $22,000 |
| 15 | Painting | $10,000 | $20,000 |
| 16 | Concrete Flatwork | $14,000 | $10,000 |
| 17 | Permits & General Conditions | $4,000 | $9,500 |

---

## 5. FUNCIONALIDADES ACTUALES (LO QUE YA EXISTE)

### ✅ Implementado y funcionando

| Función | Estado | Notas |
|---------|--------|-------|
| Pantalla Home con lista de presupuestos guardados | ✅ | |
| Crear nuevo presupuesto (blank con 17 divisiones) | ✅ | |
| Subir PDF → IA analiza y llena divisiones | ✅ | Usa Claude API con PDF en base64 |
| Editor con nombre de división editable | ✅ | Campo inline en tabla |
| Editor con alcance (textarea) editable | ✅ | Multi-línea, auto-resize |
| Campo de materiales editable (azul) | ✅ | Acepta formato con comas |
| Campo de labor editable (verde) | ✅ | Acepta formato con comas |
| Total por división calculado automáticamente | ✅ | Mat + Lab |
| % de cada división sobre el total | ✅ | Mostrado debajo del total |
| Summary bar en tiempo real (mat / lab / sub / cont / total) | ✅ | Siempre visible |
| Contingencia editable (%) | ✅ | Default 5% |
| Agregar nueva división | ✅ | Form con nombre, items, mat, lab |
| Eliminar división (botón ×) | ✅ | |
| Guardar presupuesto (persistente entre sesiones) | ✅ | window.storage |
| Cargar presupuesto guardado | ✅ | Click en la lista |
| Eliminar presupuesto guardado | ✅ | Botón × con confirmación |
| Exportar PDF profesional | ✅ | Ventana de impresión del navegador |
| PDF incluye: header Geo Carpentry, info del proyecto, tabla por divisiones, totales, firma | ✅ | |
| Feedback "✓ Guardado" después de guardar | ✅ | |
| Mensaje de estado del análisis IA | ✅ | |
| Editar nombre del proyecto, cliente, ubicación desde la top bar | ✅ | |

---

## 6. LO QUE FALTA (MEJORAS PENDIENTES)

Jorge mencionó o quedaría pendiente implementar:

### Prioridad Alta
- [ ] **Base de datos de precios de Wisconsin** — precios de referencia por material/labor para que Jorge no tenga que inventar números
- [ ] **Validación de campos** — evitar que queden divisiones en $0 sin querer
- [ ] **Número de quote automático** — formato GC-2026-XXXX autoincremental guardado

### Prioridad Media
- [ ] **Notas internas por división** — campo de observaciones visible solo internamente
- [ ] **Múltiples usuarios** — acceso para Jorge + 1-2 empleados con login
- [ ] **Duplicar presupuesto** — clonar uno existente como punto de partida
- [ ] **Comparar presupuestos** — ver dos versiones side by side

### Prioridad Baja / Futuro
- [ ] **Envío por email** — mandar el PDF directo al cliente desde la app
- [ ] **Logo de Geo Carpentry** — agregar el logo real en el PDF exportado
- [ ] **Firma digital** — campo de firma en el PDF
- [ ] **Historial de cambios** — ver qué se modificó y cuándo
- [ ] **Modo offline** — que funcione sin internet
- [ ] **Versión móvil optimizada** — mejorar UX en teléfono

---

## 7. CÓMO CORRER LA APP

La app es un **widget HTML interactivo** que corre directamente dentro de Claude.ai usando la herramienta `visualize:show_widget`. No requiere instalación, servidor, ni deploy.

Para mostrarla de nuevo, Claude debe:
1. Tomar el código HTML completo de la app
2. Pasarlo a `visualize:show_widget` con `title: "geo_carpentry_budget_app"`

El código fuente completo está guardado como:
- `/mnt/user-data/outputs/GeoBudgetApp.jsx` — versión React (referencia)
- El widget HTML vanilla es la versión funcional actual (inline en el widget)

---

## 8. EJEMPLO DE ANÁLISIS PDF CON IA

Cuando Jorge sube un PDF, la app llama a:
```
POST https://api.anthropic.com/v1/messages
model: claude-sonnet-4-20250514
max_tokens: 4000
```

Con el PDF en base64 como `type: "document"` y este prompt:
```
Eres un estimador de construcción profesional en Wisconsin, USA, año 2026.
Analiza este plano arquitectónico con mucho detalle y crea un presupuesto completo.
Devuelve SOLO un objeto JSON válido sin markdown...
{projectName, client, location, divisions: [{num, name, items, mat, lab}]}
```

El resultado se parsea y llena el editor automáticamente. Jorge puede entonces ajustar cada número.

---

## 9. ENTREGABLES GENERADOS EN ESTA SESIÓN

| Archivo | Descripción |
|---------|-------------|
| `GEO_CARPENTRY_Budget_Laundrie.pdf` | Presupuesto PDF estático generado con ReportLab (Python) |
| `GeoBudgetApp.jsx` | Código fuente React de la app (referencia) |
| Widget interactivo | App funcionando en Claude.ai (HTML vanilla) |
| `MEMORIA_PROYECTO_GeoCarpentry_BudgetBuilder.md` | Este documento |

---

## 10. CONTEXTO ADICIONAL IMPORTANTE

### Cómo trabajar con Jorge
1. **Hacer preguntas antes de construir** — Jorge aprecia el proceso iterativo
2. **Usar widgets interactivos** para que pueda probar en tiempo real
3. **Explicar paso a paso** qué hace cada cosa (nivel básico pero no condescendiente)
4. **No exponer información del cliente** (familia Laundrie u otros) en ningún entregable público
5. **Guardar documentos de memoria** al final de cada sesión importante

### Stack de herramientas que usa Jorge
- Claude.ai (esta plataforma) — desarrollo y construcción de apps
- Make.com — automatizaciones
- Claude Code — desarrollo más técnico
- Durable — website builder para sus negocios
- Google Drive — documentos
- Google My Business — presencia local (en setup)

### Tono adecuado
- Español en conversación
- Directo y eficiente
- Emojis ocasionales para claridad (🎉 ✅ ⚠️)
- Preguntas agrupadas con widgets (no en prosa larga)

---

## 11. PRÓXIMOS PASOS RECOMENDADOS

Para la **próxima sesión con Jorge**, priorizar en este orden:

1. **Mejorar el Budget Builder** según lo que Jorge quiera ajustar primero
2. **Agregar base de precios de Wisconsin** — tabla de referencia de costos por material/trade
3. **Trabajar en la migración del website** a Durable (siguiente gran proyecto)
4. **Configurar Google My Business** para Geo Carpentry

---

*Documento generado: March 26, 2026*
*Próxima revisión: Siguiente sesión con Jorge Cruz*
*Confidencial — Uso interno Geo Carpentry LLC*
