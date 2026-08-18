# Sitemap + Robots.txt Spec — investoros.tech
> Owner: CW (content) → CC implements in apps/investoros/public/ + Next.js sitemap route
> Created: 2026-05-29

---

## robots.txt

Place at: `apps/investoros/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /geo/
Disallow: /geo-carpentry/
Disallow: /pinnacle/
Disallow: /_next/
Disallow: /admin/

# Sitemap
Sitemap: https://www.investoros.tech/sitemap.xml
```

**Notes:**
- Block all tenant dashboard routes (private SaaS)
- Block /api/ routes (no crawling internal endpoints)
- Allow everything else including /es/* SEO pages
- Point to canonical www.investoros.tech sitemap

---

## sitemap.xml

**Option A — Static file** at `apps/investoros/public/sitemap.xml` (simpler, CC preferred for MVP)
**Option B — Dynamic route** at `apps/investoros/src/app/sitemap.ts` (recommended for scale, auto-updates)

Recommend Option B via Next.js 14 built-in sitemap. CC implements as:

```typescript
// apps/investoros/src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.investoros.tech'
  const lastModified = new Date()

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ]

  // 30 Spanish SEO pages — /es/[slug]
  const esSlugs = [
    'software-para-contratistas-generales',
    'automatizacion-de-negocios-de-construccion',
    'crm-para-contratistas-latinos',
    'responder-leads-automaticamente-construccion',
    'software-para-remodelacion-de-banos',
    'software-para-remodelacion-de-cocinas',
    'gestion-de-clientes-para-carpinteros',
    'agentes-de-ia-para-negocios-de-construccion',
    'automatizar-seguimiento-de-clientes-contratistas',
    'software-para-constructores-en-wisconsin',
    'herramientas-digitales-para-contratistas-hispanos',
    'crm-para-negocios-de-remodelacion',
    'automatizar-publicaciones-en-redes-sociales-contratista',
    'responder-mensajes-de-clientes-automaticamente',
    'software-para-presupuestos-de-construccion',
    'gestion-de-resenas-google-para-contratistas',
    'automatizacion-de-marketing-para-contratistas',
    'plataforma-saas-para-negocios-de-construccion-latinos',
    'software-para-carpinteria-y-acabados',
    'lead-management-para-contratistas-generales',
    'notificaciones-automaticas-para-clientes-de-construccion',
    'seguimiento-de-proyectos-de-remodelacion',
    'software-para-contratistas-en-texas',
    'software-para-contratistas-en-california',
    'software-para-contratistas-en-florida',
    'sistema-de-citas-para-contratistas-generales',
    'comunicacion-con-clientes-para-constructores',
    'herramientas-de-negocio-para-contratistas-pequenos',
    'digitalizar-un-negocio-de-construccion',
    'como-conseguir-mas-clientes-como-contratista',
  ]

  const esPages = esSlugs.map(slug => ({
    url: `${baseUrl}/es/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    ...staticPages.map(p => ({ ...p, lastModified, changeFrequency: p.changeFrequency as any })),
    ...esPages,
  ]
}
```

---

## hreflang Tags

For every /es/[slug] page, CC should add to the page's metadata:

```typescript
// In each ES page's generateMetadata function:
alternates: {
  canonical: `https://www.investoros.tech/es/${slug}`,
  languages: {
    'es': `https://www.investoros.tech/es/${slug}`,
    'en': `https://www.investoros.tech`,   // default EN = homepage until EN pages exist
    'x-default': `https://www.investoros.tech`,
  },
},
```

---

## OG Image (bonus — low priority)

For the landing page:
- File: `apps/investoros/src/app/opengraph-image.tsx`
- Size: 1200×630px
- Content: InvestorOS logo + "27 AI Agents for Home Service Businesses" tagline + dark background

```typescript
import { ImageResponse } from 'next/og'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ background: '#0f172a', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff' }}>InvestorOS</div>
      <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 16 }}>27 AI Agents for Home Service Businesses</div>
      <div style={{ fontSize: 20, color: '#6366f1', marginTop: 24 }}>investoros.tech</div>
    </div>
  )
}
```

---

## Implementation Notes for CC

1. Drop `robots.txt` into `apps/investoros/public/` — static file, no code needed
2. Create `apps/investoros/src/app/sitemap.ts` — Next.js auto-exposes at `/sitemap.xml`
3. Create `apps/investoros/src/app/opengraph-image.tsx` — auto-used by Next.js for social shares
4. The 30 `/es/[slug]` pages need dynamic routes: `apps/investoros/src/app/es/[slug]/page.tsx`
   - Content source: `Memory Claude/05_seo-content/investoros_es_pages.md` (30 pages drafted by CW)
   - Parse frontmatter per page → render as static pages (SSG `generateStaticParams`)
5. Verify `<link rel="canonical">` on all pages after deploy

