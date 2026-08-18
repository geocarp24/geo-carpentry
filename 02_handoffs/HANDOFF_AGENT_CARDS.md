# HANDOFF — Interactive Agent Cards for /es/[slug] Pages
> Cowork → Claude Code · 2026-05-29

---

## QUÉ HACER

Agregar la sección "Tu equipo de 27 agentes AI" a todas las páginas `/es/[slug]` del sitio investoros.tech.

---

## ARCHIVOS ENTREGADOS

| Archivo | Ruta en Memory Claude | Qué es |
|---|---|---|
| `AgentTeamSection.tsx` | `05_seo-content/AgentTeamSection.tsx` | Componente React completo, listo para copiar |
| `agent-team-preview.html` | `05_seo-content/agent-team-preview.html` | Preview HTML interactivo — abrir en browser para ver cómo queda |

---

## IMPLEMENTACIÓN (3 pasos)

### Paso 1 — Copiar el componente

```bash
cp AgentTeamSection.tsx apps/investoros/src/components/AgentTeamSection.tsx
```

### Paso 2 — Importar en la página /es/[slug]

En `apps/investoros/src/app/es/[slug]/page.tsx`, agregar:

```tsx
import AgentTeamSection from "@/components/AgentTeamSection";

// Dentro del JSX, después del contenido principal de la página:
<AgentTeamSection />
```

### Paso 3 — Verificar imágenes

Las imágenes ya existen en `apps/investoros/public/investoros-agents/agent-NAME.png` (27 PNGs, subidos en commit 7f79c34). El componente las referencia como `/investoros-agents/agent-SLUG.png`. No se necesita ningún cambio adicional.

---

## COMPORTAMIENTO DEL COMPONENTE

- **Grid responsive**: `auto-fill minmax(130px, 1fr)` — 9 columnas desktop / 6 tablet / 3-4 mobile
- **Hover**: card eleva + glow en color del status (verde/ámbar/índigo)
- **Click**: abre modal con retrato grande, descripción completa, tech pills, CTA → `investoros.tech/#pricing`
- **Filtros**: Todos / En producción (12) / Listos para deploy (12) / Próximamente (3)
- **Keyboard**: ESC cierra modal
- **Fallback**: si imagen no carga → muestra inicial del agente
- **Zero deps**: solo React + inline styles, sin CSS modules ni librerías externas

---

## DATOS

Los 27 agentes están hardcodeados en el componente con descripciones en español.

Si en el futuro quieres cargar los datos dinámicamente desde una API o un archivo JSON, el array `AGENTS` está al inicio del componente y es fácil de extraer.

---

## NOTA SOBRE DARK MODE

El componente usa fondo `#07080d` / `#0f1117` que ya coincide con el tema dark de investoros.tech. Si la página /es/ tiene un fondo diferente, ajustar `background` del `<section>` (línea ~380 del componente).

---

## DECISIÓN CONFIRMADA POR JORGE (2026-05-29)

Jorge pidió explícitamente:
> "cada agente debe de tener nombre y rostro, a como lo tenemos en la pagina principal y deben de ser totalmente interactivos"

Implementado exactamente así: retratos de `public/investoros-agents/`, nombres visibles, modal interactivo al click. Mismos colores de status que la landing page.
