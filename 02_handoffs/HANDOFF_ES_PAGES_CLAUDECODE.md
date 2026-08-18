# HANDOFF — Fix /es/[slug] Pages
> Investoros SaaS · InvestorOS Landing (investoros.tech)
> Generado por: Cowork · Fecha: 2026-05-29
> Propósito: Arreglar las 30 páginas SEO en español que están rotas en producción.

---

## 🔴 PROBLEMA ACTUAL (producción)

URL de ejemplo: `https://www.investoros.tech/es/software-para-contratistas-generales`

**Lo que se ve HOY (mal):**
```
h1: Software Inteligente para Contratistas Generales
targetKeyword: software para contratistas generales
searchVolumeTier: high
hreflang: es
```
↑ Estos campos aparecen como texto plano en el cuerpo del artículo.

**El contenido real del artículo (## headings, párrafos, etc.) NO se renderiza.**

**Las meta tags de SEO (title, description) sí están correctas.**

---

## 🔍 ROOT CAUSE

Dos problemas combinados:

### Problema 1 — Formato de los archivos `.md` fuente
Los archivos `.md` actuales tienen los campos `h1`, `targetKeyword`, `searchVolumeTier`, `hreflang` **fuera del bloque `---` de frontmatter** (o en un formato no estándar). Cuando `gray-matter` los parsea, esos campos terminan en el body en lugar del objeto `data`.

### Problema 2 — El `page.tsx` actual no renderiza markdown
El `page.tsx` actual renderiza el body como texto plano (`<p>{content}</p>`), no como HTML convertido desde markdown. Por eso los `## headings` y el resto del artículo no aparecen.

---

## ✅ FIX COMPLETO — 4 pasos

### Paso 1 — Instalar dependencias

```bash
cd apps/investoros
npm install gray-matter remark remark-html
```

### Paso 2 — Crear directorio de contenido

```bash
mkdir -p apps/investoros/content/es
```

### Paso 3 — Generar los 30 archivos `.md` corregidos

**Archivos entregados por Cowork:**
```
Memory Claude/05_seo-content/convert-es-pages.mjs
Memory Claude/05_seo-content/investoros_es_pages.md   ← fuente con 30 páginas
```

**Ejecutar desde la raíz del repo:**
```bash
# Copiar el script y el archivo fuente a la raíz del repo
cp "Memory Claude/05_seo-content/convert-es-pages.mjs" ./
cp "Memory Claude/05_seo-content/investoros_es_pages.md" ./

# Ejecutar el script
node convert-es-pages.mjs
```

El script genera 30 archivos en `apps/investoros/content/es/`:
```
apps/investoros/content/es/
  software-para-contratistas-generales.md
  automatizacion-de-negocios-de-construccion.md
  crm-para-contratistas-latinos.md
  responder-leads-automaticamente-construccion.md
  software-para-remodelacion-de-banos.md
  software-para-remodelacion-de-cocinas.md
  gestion-de-clientes-para-carpinteros.md
  agentes-de-ia-para-negocios-de-construccion.md
  automatizar-seguimiento-de-clientes-contratistas.md
  software-para-constructores-en-wisconsin.md
  herramientas-digitales-para-contratistas-hispanos.md
  crm-para-negocios-de-remodelacion.md
  automatizar-publicaciones-en-redes-sociales-contratista.md
  responder-mensajes-de-clientes-automaticamente.md
  software-para-presupuestos-de-construccion.md
  gestion-de-resenas-google-para-contratistas.md
  automatizacion-de-marketing-para-contratistas.md
  plataforma-saas-para-negocios-de-construccion-latinos.md
  software-para-carpinteria-y-acabados.md
  lead-management-para-contratistas-generales.md
  notificaciones-automaticas-para-clientes-de-construccion.md
  seguimiento-de-proyectos-de-remodelacion.md
  software-para-contratistas-en-texas.md
  software-para-contratistas-en-california.md
  software-para-contratistas-en-florida.md
  sistema-de-citas-para-contratistas-generales.md
  comunicacion-con-clientes-para-constructores.md
  herramientas-de-negocio-para-contratistas-pequenos.md
  digitalizar-un-negocio-de-construccion.md
  como-conseguir-mas-clientes-como-contratista.md
```

**Formato correcto de cada archivo generado:**
```markdown
---
slug: software-para-contratistas-generales
title: "Software para Contratistas Generales | InvestorOS"
metaDescription: "Automatiza tu negocio de construcción con InvestorOS..."
h1: Software Inteligente para Contratistas Generales
targetKeyword: software para contratistas generales
searchVolumeTier: high
hreflang: es
---

## El Problema que Nadie Habla en Voz Alta

Tienes el trabajo, tienes las manos...
```

### Paso 4 — Reemplazar `page.tsx`

**Archivo entregado por Cowork:**
```
Memory Claude/05_seo-content/es-page-tsx.tsx
```

**Destino:**
```
apps/investoros/src/app/es/[slug]/page.tsx
```

**Comando:**
```bash
cp "Memory Claude/05_seo-content/es-page-tsx.tsx" \
   apps/investoros/src/app/es/[slug]/page.tsx
```

---

## 📦 AgentTeamSection — IMPORTANTE

El `page.tsx` importa `AgentTeamSection` desde:
```typescript
import AgentTeamSection from '@/components/AgentTeamSection';
```

Este componente fue **reescrito en la sesión anterior (Task #22)** y está en:
```
Memory Claude/05_seo-content/AgentTeamSection.tsx
```

**Asegúrate de que esté en:**
```
apps/investoros/src/components/AgentTeamSection.tsx
```

Si no está, cópialo:
```bash
cp "Memory Claude/05_seo-content/AgentTeamSection.tsx" \
   apps/investoros/src/components/AgentTeamSection.tsx
```

---

## 🗂️ RESUMEN DE CAMBIOS

### Archivos NUEVOS que CC debe crear:
```
apps/investoros/content/es/         ← directorio nuevo (30 .md files)
apps/investoros/src/app/es/[slug]/page.tsx   ← reemplaza el actual
apps/investoros/src/components/AgentTeamSection.tsx  ← si no existe
```

### Archivos CC NO debe tocar:
```
agents/                  ← propiedad de Cowork
scripts/provision_*.mjs  ← propiedad de Cowork
Memory Claude/           ← docs de coordinación
```

### Dependencias nuevas en package.json:
```json
{
  "dependencies": {
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1"
  }
}
```

---

## 🔬 VERIFICACIÓN POST-DEPLOY

Después de hacer deploy, verificar que:

1. **H1 renderiza correctamente** (no como texto plano):
   - Ir a: `https://investoros.tech/es/software-para-contratistas-generales`
   - El H1 debe decir "Software Inteligente para Contratistas Generales" (in the styled header, not as body text)

2. **Artículo renderiza como HTML** (no como texto plano):
   - Debe verse `## El Problema...` como `<h2>`, no como texto
   - Los bullets `- item` deben verse como `<ul><li>`

3. **AgentTeamSection aparece** al final del artículo (antes del footer CTA)

4. **Meta tags** correctas:
   ```bash
   curl -s https://investoros.tech/es/software-para-contratistas-generales | grep -E "og:title|description"
   ```

5. **JSON-LD schema** presente:
   ```bash
   curl -s https://investoros.tech/es/software-para-contratistas-generales | grep "application/ld+json"
   ```

6. **Todas las 30 URLs responden 200** (no 404):
   ```bash
   # Test rápido de las primeras 5
   for slug in software-para-contratistas-generales automatizacion-de-negocios-de-construccion crm-para-contratistas-latinos agentes-de-ia-para-negocios-de-construccion software-para-constructores-en-wisconsin; do
     STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://investoros.tech/es/$slug)
     echo "$STATUS — /es/$slug"
   done
   ```

---

## 🧩 ARQUITECTURA FINAL (después del fix)

```
investoros.tech/es/[slug]
  ↓
apps/investoros/src/app/es/[slug]/page.tsx
  → fs.readFileSync(content/es/{slug}.md)
  → gray-matter → { data: frontmatter, content: markdown }
  → remark → HTML string
  ↓ renders:
  <header>  H1 gradient + keyword pill + lead text + CTA button
  <article> markdown HTML con dark theme styles
  <AgentTeamSection />   ← 27 agentes con fotos de /investoros-agents/
  <footer>  CTA card "Empieza hoy — sin riesgo"
```

---

## ⚠️ NOTAS ADICIONALES

### `generateStaticParams` — Build estático
El `page.tsx` usa `generateStaticParams()` que lee el directorio `content/es/` en build time. Esto significa:
- En local dev: Next.js lee los archivos al instante ✅
- En Vercel: los archivos deben estar commiteados al repo ✅
- **Los 30 `.md` files DEBEN estar en git** — no son archivos de runtime

### Imágenes de agentes
El `AgentTeamSection` usa URLs de:
```
/investoros-agents/agent-{slug}.png
```
Estos 27 PNGs ya están en `public/investoros-agents/` de la app Next.js.

### Agregar contenido futuro
Para agregar una página 31 o más:
1. Crear el archivo `.md` en `apps/investoros/content/es/`
2. No necesita cambios en `page.tsx` — `generateStaticParams` los detecta automáticamente

---

## 📅 PRIORIDAD

**URGENTE** — estas páginas están rotas en producción y son las 30 páginas SEO en español que deben rankear en Google. Cada día que siguen rotas es ranking perdido.

Puede hacerse en paralelo con otras tareas (no bloquea nada en el dashboard).

---
*Última actualización: 2026-05-29 · Próxima revisión: al terminar deploy*
