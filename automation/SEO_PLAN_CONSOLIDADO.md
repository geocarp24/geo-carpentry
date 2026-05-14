# SEO Plan Consolidado — Geo Carpentry

**Última actualización:** 2026-05-14
**Owner:** Jorge Cruz
**Tenant config InvestorOS:** `investoros-web/agents/tenants/geo-carpentry.json`

## 📍 Estado actual

| Item | Status |
|---|---|
| Sitio WordPress | ✅ 80-90% migrado, staging vivo en `blueviolet-gerbil-900105.hostingersite.com` |
| Schema markup | ✅ Instalado (LocalBusiness + FAQ) |
| 18 páginas + 10 posts | ✅ Creadas |
| DNS Cloudflare | ⏳ Pendiente (Jefe lo hace mañana) |
| Google Business Profile | ⏳ Existe — Jefe pasa acceso mañana |
| Posicionador agent | ✅ Code-complete, multi-tenant ready (`investoros-web/agents/posicionador/`) |
| Tenant config Geo | ✅ Creado hoy (`agents/tenants/geo-carpentry.json`) |
| Airtable SEO_Audits | ❌ Por crear |
| Primer SEO audit | ❌ Por correr (después de DNS live) |

## 🎯 Estrategia en 3 fases

### Fase 1 — Foundation (Esta semana, post-DNS)

1. **Cutover DNS** ✅ Jefe mañana (Cloudflare A record → 156.67.74.243)
2. **Validar schema markup** en producción (LocalBusiness + FAQ + Service per page)
3. **GMB optimization:**
   - 10+ fotos jobs recientes
   - Lista de servicios completa con keywords + price ranges
   - 5 review requests a ex-clientes
   - Responder a TODAS las reviews actuales
4. **Submit a directorios gratis:** Google Business, Bing Places, Yelp, Houzz, Angi free, HomeAdvisor free, Thumbtack, BBB
5. **Setup Google Search Console** + **Google Analytics 4**
6. **Verificar páginas indexables:** `site:geocarpentry.com` → 18 páginas

### Fase 2 — Content + Local Authority (Semanas 2-4)

1. **El Posicionador corre semanalmente** (`seo_deep` mode): audit + technical + local + maps + content + drift
2. **Service pages dedicadas:** `/services/custom-carpentry/`, `/services/kitchen-remodeling/`, `/services/bathroom-remodeling/`, `/services/deck-building/`, `/services/home-renovation/`, `/services/general-construction/`
3. **City landing pages:** `/green-bay-contractor/`, `/howard-wi-kitchen-remodel/`, `/de-pere-deck-builder/`, `/appleton-bathroom-remodel/`, `/oshkosh-home-renovation/`
4. **Blog inicial — 5 posts:**
   - "How to Choose a Contractor in Green Bay (2026 Guide)"
   - "Kitchen Remodeling Costs in Wisconsin: What to Expect"
   - "Deck Building Permits in Brown County WI"
   - "Bathroom Remodel ROI in Northeast Wisconsin"
   - "Wisconsin Weather and Your Exterior Carpentry"
5. **Reviews push:** target 10+ Google reviews en 60 días

### Fase 3 — Authority + Backlinks (Mes 2+)

1. 2 blog posts/sem (per tenant config)
2. Backlinks: local news, real estate directories, legal partnerships, WI community sites, Reddit r/Wisconsin / r/GreenBay
3. 1 Reel/sem en FB + IG con timelapse de jobs
4. 5 video testimonials profesionales

## 🤖 Activación El Posicionador para Geo

### Pre-requisitos
- [ ] Tabla `SEO_Audits` en Airtable Geo base (schema en `investoros-web/agents/posicionador/SKILL.md`)
- [ ] `table_id` en `geo-carpentry.json` → `airtable.seo_table_id`
- [ ] Env vars: `AIRTABLE_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_GEO`
- [ ] `claude` CLI autenticado en host

### Dry run (testing, $0)
```bash
cd /path/to/investoros-web
node agents/posicionador/posicionador.mjs --tenant geo-carpentry --mode seo_health --dry-run
```

### Primera auditoría real
```bash
export AIRTABLE_TOKEN=...
export TELEGRAM_BOT_TOKEN=...
node agents/posicionador/posicionador.mjs --tenant geo-carpentry --mode seo_deep
```

Output: MD raw en `runs/`, record Airtable, alerta Telegram.

### Cron permanente
```cron
0 14 */3 * * cd /opt/investoros && node agents/posicionador/posicionador.mjs --tenant geo-carpentry --mode seo_health
0 15 * * 1 cd /opt/investoros && node agents/posicionador/posicionador.mjs --tenant geo-carpentry --mode seo_deep
```

## 🎯 KPIs de éxito

| Mes | SEO Score | Páginas indexadas | Rankings top 10 | GMB views | Organic visitors | Reviews |
|---|---|---|---|---|---|---|
| 1 | >70 | 18+ | 5 keywords | 500+ | 50-100/mes | 5+ |
| 2 | >80 | 25+ | 5 top 5 | 1500+ | 100-200/mes | 10+ |
| 3 | >85 | 35+ | 5+ top 3, 10 long-tail | 3000+ | 200-400/mes | 15+ |

## ⚡ Activación mañana (cuando DNS + GMB)

1. **Yo:** verifico DNS resuelve a Hostinger, valido staging, valido schema en producción
2. **Tú:** pasas acceso GMB + creas tabla `SEO_Audits` en Airtable
3. **Yo:** primer `seo_deep --dry-run` para validar tenant config
4. **Yo:** primer `seo_deep` real → baseline en Airtable + reporte MD
5. **Ambos:** revisamos reporte → priorizamos top 3 fixes
6. **Yo:** aplico fixes via WP-CLI
7. **Cron weekly** hasta target metrics

## 🚧 Bloqueadores

1. DNS Cloudflare → Jefe mañana ✓
2. GMB access → Jefe mañana ✓
3. Airtable SEO_Audits → manual creation
4. claude CLI auth en host
5. Colores workflows (#0d2137 viejos vs #1B2A4A nuevos) → fix antes de re-correr `setup-geocarpentry.yml`

## 📎 Referencias

- `investoros-web/agents/posicionador/SKILL.md` — spec completo del agente
- `investoros-web/agents/tenants/geo-carpentry.json` — config tenant
- `Memory Claude/Geo_Carpentry_Memory_Strategy.md` — estrategia original
- `docs/curated/GEOCARPENTRY_MEMORIA.md` — brand kit + lecciones
- `automation/HOSTINGER_DEPLOY_GUIDE.md` — cómo deployear
- `automation/LEAD_GEN_WEEK_1.md` — bootstrap leads desde cero
