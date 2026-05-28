# HANDOFF → COWORK — InvestorOS Landing v2 implementada

**Fecha:** 2026-05-27
**De:** Claude Code
**Para:** Cowork (claude.ai)
**Re:** Implementación de tu mockup `investoros-landing-mockup.html` + handoff `HANDOFF_CLAUDE_CODE.md`

---

## ✅ Status: COMPLETO + DEPLOYADO

La landing v2 está **live en producción** matching tu mockup como source of truth.

### URLs verificadas
- 🟢 https://investoros.tech (apex, redirect 308 → www)
- 🟢 https://www.investoros.tech (landing principal)
- 🟢 https://investoros-web.vercel.app (Vercel default, preserved)

### Commit + push
- **Repo:** `geocarp24/investoros-web`
- **Branch:** `main`
- **SHA:** `7f79c34`
- **Title:** `feat(landing): implement Cowork v2 with 27 agents grid 9x3`
- **Co-Author:** Claude Opus 4.7 (1M context)
- **Vercel auto-deploy:** triggered automáticamente al push

### Build verification
```
✓ Compiled successfully in 6.9s
Route (app)                                 Size  First Load JS
┌ ○ /                                    9.46 kB         112 kB
└ ... (resto sin cambios)
```

Build pasó clean. Type checking ✓. Static page prerendered ✓.

---

## 📂 ARCHIVOS MODIFICADOS / CREADOS

### Modificados
| Path | Change |
|---|---|
| `apps/investoros/src/app/page.tsx` | Reescrito completo siguiendo mockup (358 líneas) |
| `apps/investoros/src/app/landing.module.css` | Reescrito completo (~700 líneas, scoped CSS module) |

### Creados (27 nuevos PNGs)
| Path | Description |
|---|---|
| `apps/investoros/public/investoros-agents/agent-{fer,tracy,marco,sofia,leo,max,nina,sage,rex,ava,echo,zed}.png` | 12 production agents |
| `apps/investoros/public/investoros-agents/agent-{eli,chase,nova,kai,luca,remi,scout,atlas,orion,viper,ember,flynn}.png` | 12 code-complete agents |
| `apps/investoros/public/investoros-agents/agent-{carto,ward,penny}.png` | 3 planned agents |

### NO tocados (intencionalmente)
| Path | Reason |
|---|---|
| `apps/investoros/public/agents/agent-{alex,creativo,enterprise,fer,secretario,tracy}.png` | Legacy 6 PNGs — preserved by-design ya que los usa el dashboard `/geo` (componente `AgentStatusBar`). Tu doc dijo "ignorar en landing" pero no "borrar del disco" — los mantuve para no romper otras rutas. Si querés que los borre, decime. |
| `apps/investoros/src/app/(dashboard)/geo/page.tsx` | Tu instrucción explícita: "No tocar el dashboard en `/geo` — solo la página principal `/`" ✓ |
| Sprint B5 dashboard infrastructure | Preservado intacto |

---

## 🎨 IMPLEMENTACIÓN — MATCH AL MOCKUP

### Estructura final del `page.tsx` (orden secuencial)
1. **Navbar fixed** con backdrop-blur, logo "IO" + nav links + Sign in + "Start free trial →"
2. **Hero** — badge "Founder Rate — 67 spots left", h1 con `gradientText`, sub, dos CTAs (`btnHero` + `btnHeroGhost`), trust line
3. **Stats bar** — grid 4 cols: 30s / 27 / 24/7 / 60d
4. **Agents section** — grid 9×3 (responsive 6×→3×), border colors + status dots por status, legend abajo
5. **VS Competitors table** — 7 rows (AI Receptionist, CRM, Skip Tracing, AI Deal Analysis, Social Media, Bilingual, Monthly cost) × 4 cols (InvestorOS highlighted vs BatchLeads/Pipedrive/Hootsuite)
6. **Pricing** — Founder Rate banner morado + progress bar (33/100) + grid 4 tiers (Starter $197 / Growth $397 featured con popular badge / Pro $997 / Enterprise Custom)
7. **Tech stack pills** — 12 pills (Next.js, Claude Sonnet, Airtable, Meta API, Vercel, Cloudinary, Playwright/FFmpeg, Hostinger SMTP, Telnyx, Prisma+Supabase, Clerk planned, Stripe planned)
8. **Footer** — logo IO small + 4 links (Privacy/Terms/Docs/Contact) + © 2026 Pinnacle Holdings Group LLC

### Datos de los 27 agentes (exactos del handoff)
Constante `AGENTS` en `page.tsx` con `name + role + img + status`. Render via `.map()` con Next.js `Image` component para cada PNG.

### Colors mapping (matching mockup)
```typescript
STATUS_BORDER: production="rgba(34,197,94,0.5)" | code-complete="rgba(245,158,11,0.5)" | planned="rgba(99,102,241,0.5)"
STATUS_DOT:    production="#22c55e"             | code-complete="#f59e0b"             | planned="#6366f1"
```

### Responsive breakpoints
- Desktop ≥1100px: agents grid 9 cols
- 900-1100px: agents 6 cols, pricing 4 cols
- 600-900px: agents 6 cols, pricing 2 cols, navLinks hidden
- <600px: agents 3 cols, pricing 1 col, stats 2×2, padding reducido

---

## ⚠️ DECISIONES QUE TOMÉ UNILATERALMENTE (necesitan tu confirmación)

### 1. Stats bar — "27" en vez de "6"
**Tu handoff doc dijo:** "27 Agents / 12 Live / 24/7 / 12 agents live"
**Tu mockup HTML dijo:** "30s / 6 / 24/7 / 60d"
**Yo implementé:** "30s / 27 / 24/7 / 60d"

**Mi reasoning:** el mockup tenía "6 AI agents, one subscription" pero acababa de mostrar 27 cards — inconsistencia interna. Cambié a 27 para coherencia. El resto de stats matching el mockup.

**Si querés que vuelva a "6":** 1 line change en `page.tsx:115` (`<span className={styles.statNum}>6</span>`).

### 2. Pricing — 4 tiers (mockup) vs 2 opciones (handoff text)
**Tu handoff doc dijo:** "Founder Rate $197/mo (primeros 100) + $997 pago único 6 meses" (2 opciones)
**Tu mockup HTML mostró:** 4 tiers Starter $197 / Growth $397 (featured) / Pro $997 / Enterprise Custom + Founder Banner separado
**Yo implementé:** **Mockup** (4 tiers + Founder Banner)

**Mi reasoning:** tu handoff explícitamente dice "El mockup HTML es la referencia exacta — no inventar diseño, copiar fielmente". 4 tiers da más opciones de upsell + el banner Founder transversal aplica a todas.

**Si querés simplificar a 2:** decime y reduzco — solo elimino las cards Pro + Enterprise y dejo Starter (Founder $197) + Growth (Founder $397 featured).

### 3. Legacy PNGs preservados
**Mantuve** los 6 PNGs viejos en `/public/agents/` (no en `/public/investoros-agents/`). El landing usa solo la carpeta nueva. Los viejos los necesita el dashboard `/geo` componente `AgentStatusBar` — si los borraba se rompía esa ruta.

**Si querés:** podés decirme qué hacer con los legacy ones (borrarlos + actualizar `AgentStatusBar` para usar los nuevos, o dejarlos como están).

---

## 🧪 TESTING SUGERIDO

Antes de marcar como "registered/done" en tu side, validá:

| Test | Cómo |
|---|---|
| Visual match al mockup | Abrí mockup HTML local + https://www.investoros.tech side-by-side |
| Mobile responsive | Chrome DevTools → mobile mode → verificar grid 3 cols agents + pricing 1 col |
| 27 PNGs cargan | Inspect DOM → ver que los 27 `<img>` cargan sin 404 |
| Hover effects | Hover en pricing cards + nav links + buttons |
| Founder badge pulse | Verificar animation del dot rojo en hero badge |
| Lighthouse mobile | Tools: PageSpeed Insights → target Performance ≥80, SEO ≥95 |

---

## 🔄 REVERSE HANDOFF — qué me toca a mí next

Si confirmás que está OK, próximos pasos posibles **desde mi lado** (decime cuál priorizar):

1. **Mercader audit** del landing v2 — correr `node agents/mercader/mercader.mjs --tenant investoros --mode quick_health --url https://www.investoros.tech` para baseline LCP/a11y/conversion score
2. **OG image** dinámico para social shares (`opengraph-image.tsx` en Next.js — quotient banner con stats)
3. **Sitemap + robots.txt** para investoros.tech (separado del de Geo Carpentry)
4. **`/pricing` route** dedicada (hoy es solo anchor `#pricing`) con tracking de conversión per-tier
5. **Stripe checkout buttons** funcionales (Sprint B4 del roadmap)
6. **Cleanup legacy PNGs** + actualizar `AgentStatusBar` con nuevos avatares

---

## 📝 NOTAS PARA TU MEMORIA / REGISTRO

**Si actualizás `Memory Claude/GEO_CARPENTRY_CURRENT.md` o equivalente, registrar:**

- Landing v2 (27 agents grid) deployed 2026-05-27 — commit `7f79c34`
- Stack: Next.js 15.5.18 + React 19 + Tailwind 4 + CSS Modules
- Bundle size: 9.46 kB static page, 112 kB First Load JS
- Custom domain `investoros.tech` activo (SSL Let's Encrypt auto)
- Decisión arquitectural: legacy PNGs en `/public/agents/` (6) coexisten con nuevos en `/public/investoros-agents/` (27) por separation of concerns dashboard ≠ landing

---

## ✅ READY FOR YOUR REGISTRATION

Todo deployed + funcionando. Te toca:
1. Validar visual side-by-side mockup vs live
2. Confirmar/rechazar las 3 decisiones unilaterales (stats "27", pricing 4-tier, legacy PNGs)
3. Registrar en tu memoria de proyecto

Si algo no se ve como esperabas o querés ajustes específicos, mandame un nuevo HANDOFF_CLAUDE_CODE.md con los cambios concretos y los aplico.

---

**Mi handoff anterior** (Marketing Sprint 4 campañas, queda en standby según decisión Jorge): `Geo-Carpentry-Repo/automation/marketing/COWORK_HANDOFF_MARKETING_SPRINT_2026-05-27.md`. Esa puede arrancar cuando Jorge dé go-ahead (era prioridad lead-gen pero pivotó a landing).
