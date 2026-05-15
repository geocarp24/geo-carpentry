# Geo Carpentry Website Polish Audit
**Site:** https://geocarpentry.com
**Audited:** 2026-05-15
**Status at audit:** Live in HTTPS, "starter theme + basic copy" stage
**Brand context:** Navy `#1B2A4A` + Orange `#FF6B00`, tagline "Built to Last. Crafted with Pride."
**Audience:** Northeast Wisconsin homeowners (NOT tech)
**Goal:** Lift conversion on `/contact/` form (SureForms id 2340)

---

## Executive Summary

The site is functionally complete and the copy is genuinely localized to Northeast Wisconsin — that's the good news. The bad news is that visually and structurally it reads as **"competent WordPress starter, not premium agency."** Five things hold it back from "wow":

1. **Zero photography.** Across 8 pages no project photos, no team photos, no founder portrait, no before/afters. Service cards use emojis as icons. Portfolio page claims 500+ projects but shows none. **Conversion killer #1** for a remodeling contractor — homeowners buy with their eyes.
2. **The lead form button literally says "Submit."** Most important page (`/contact/`) has generic CTA microcopy. Action-oriented CTAs lift form completion 15-30%.
3. **No social proof anywhere.** "500+ projects" and "100% satisfaction" are unsourced. Zero named testimonials, zero star ratings, no Google Reviews count, no BBB, no NARI/NAHB badges.
4. **No schema markup detected** on any page — losing LocalBusiness, Service, FAQ, Review, BlogPosting rich results in Google.
5. **Above-the-fold is brand-centric, not buyer-centric.** Hero is logo + tagline + phone. Homeowners need to see *kitchens being built*, *Jorge's face* — within 600px on mobile.

2-week polish away from feeling premium. Bones are right (copy, IA, bilingual, service area, hours, phone). Skin needs work.

---

## Top 10 Priorities (ranked by conversion ROI)

| # | Change | Page(s) | Effort | Impact | Why |
|---|---|---|---|---|---|
| 1 | Replace "Submit" with "Get My Free Estimate" on form 2340 | /contact/ | **Quick** | 🚨 **Critical** | Single highest-ROI fix on the entire site. One edit. |
| 2 | Add hero project photo (kitchen or deck) above the fold, replacing logo-only hero | / | Medium | **Critical** | Buyers buy with eyes. Logo hero says "we made a website," not "we build kitchens." |
| 3 | Add 3-5 named testimonials with city + project type (e.g., "Sarah K., Howard — Kitchen Remodel") | / + /contact/ | Medium | **Critical** | No social proof = no trust. 500+ projects with zero quoted is suspicious. |
| 4 | Build out /portfolio/ with at least 6 real projects (before/after, location, brief story) | /portfolio/ | Big lift | **Critical** | Page currently has 500+ claim + zero proof. Reads as fake. |
| 5 | Add founder photo of Jorge + ~150-word personal story on /about/ | /about/ | Quick (1 photo + copy already exists) | **High** | "Meet the Founder" section exists but has no face. Personal trust = local contractor moat. |
| 6 | Install LocalBusiness + Service + FAQPage + BlogPosting schema markup site-wide | All | Medium | **High** | Missing rich results = leaving free Google real estate on the table. |
| 7 | Replace 6 emoji service icons with real photos on /services/ grid | /services/ | Medium (need 6 photos) | **High** | Emojis read as toy/MVP. Photography reads as premium. |
| 8 | Move contact form above-the-fold on /contact/ — currently buried below scroll | /contact/ | Quick CSS | **High** | Form below fold = form not used. Mobile especially. |
| 9 | Add sticky mobile CTA bar ("📞 Call" + "💬 WhatsApp" + "Get Quote") | All pages, mobile | Medium | **High** | Mobile-first rule 1b. Homeowners search from phone, need thumb-zone CTA always visible. |
| 10 | Add trust badge row: License # + Workers' Comp + BBB + Google review count + Years | / hero band | Medium (need real numbers) | **High** | "Licensed & Insured" without a number is a claim. WI DSPS license # makes it real. |

---

## Quick Wins (<1 hour each — ALEX puede hacer YA, sin assets del Jefe)

- ✅ Change form button "Submit" → "Get My Free Estimate" 🚨
- ✅ Add `aria-label` to icon-only links (WhatsApp, social) 🚨 a11y
- ✅ Add `loading="lazy"` to below-fold images
- ✅ Add `Author: Jorge Cruz` byline to all 10 blog posts
- ✅ Add `Last updated: [date]` to blog post hero
- ✅ Install LocalBusiness + BlogPosting schema in child theme functions.php
- ✅ Add Google Maps embed on /contact/
- ✅ Add sticky mobile CTA bar (CSS-only, no assets needed)
- ✅ Add Privacy Policy link adjacent to form submit button
- ✅ Rewrite H1s on /about/ and /services/ for SEO + clarity
- ⏳ Add `alt` text to existing images (need to know what each image is — partial automation possible)

## Big Lifts (multi-session — necesitan assets del Jefe)

- Shoot or source 30-50 real project photos (iPhone 4K fine, daylight)
- Photograph Jorge: founder portrait + 2-3 in-the-field shots
- Build out 6 service detail pages with: process timeline, "What's included" checklist, FAQs, before/after gallery, "starting from" prices
- Portfolio page: 6+ project cards with location, year, scope, 4-8 photos each
- 60-second phone video of Jorge intro
- Bilingual ES mirror of full content
- Expand kitchen blog post to 1500-3000 words with FAQ schema

---

## Per-Page Deep Dive

### 1. Home `/`

**Above-the-fold:** Logo + tagline + phone CTA. Brand-first, not buyer-first. Subhead "delivered expert carpentry and construction across Green Bay and Northeast Wisconsin since 2014" — keep.

**Trust signals:** "10+ Years," "500+ Projects," "100% Licensed & Insured" — numbers good, proof missing. No BBB, no Google rating, no NARI/NAHB.

**CTAs:** Phone CTA appears 3+ times. Form CTA buried in popup, not embedded.

**Imagery:** Logo only above fold. 🚨 No project hero.

**Schema:** None detected. 🚨

---

### 2. About `/about/`

**Strengths:** Warmest page on the site. Jorge Cruz, Founder & Master Carpenter, since 2014. 15 years hands-on. Bilingual team called out. "What we quote is what you pay" — strong differentiator.

**Weakness:** 🚨 **No photo of Jorge.** Founder bio without a face = massive missed trust lever.

**Trust signals:** Workmanship guarantee mentioned but no terms. License number absent. Insurance carrier absent.

**Headlines:** H1 = "About" is weak. Change to "Meet Jorge Cruz — Master Carpenter Serving Northeast Wisconsin Since 2014."

---

### 3. Services `/services/`

**Critical issue:** 🚨 **Six emoji icons** (🔨 🍳 🚿 🏗️ 🏠 🏢) as service "imagery." Emojis = chat UIs, not premium positioning.

**Copy depth:** 2 sentences per service. Should be 50-80 words each.

**Pricing:** None despite claiming "transparent line-item pricing." Add starting-from ranges or remove the transparency claim.

**Schema:** No Service schema detected. 🚨

---

### 4. Service Detail (e.g., `/services/kitchen-remodeling/`)

**Strengths:** "How We Work" 6-step process. Wisconsin-specific copy. 5 distinct CTAs.

**Weaknesses:**
- 🚨 No before/after gallery on the page
- No kitchen-specific testimonials
- No FAQ section (should have 4-6 with FAQPage schema)
- No cost range inline
- No "What's included" checklist

---

### 5. Portfolio `/portfolio/`

🚨 **CRITICAL: page is mostly empty.** Claims "500+ Projects Completed" + 6 category labels — shows **zero actual projects**. No grid, no thumbnails, no case studies, no before/afters.

Most damaging page on the site. Portfolio without portfolio undermines the entire trust narrative.

---

### 6. Contact `/contact/` — THE CRITICAL PAGE

- 🚨 **Form button text = "Submit"** — single biggest fix. Change to **"Get My Free Estimate"**.
- 🚨 **Form below the fold.** On a contact page, form *is* the page. Should be hero-right (desktop) or first scroll (mobile).
- **7 fields, 3 required** — at upper end of acceptable. Consider 2-step (name/phone/email → service/city/budget/desc).
- **Trust signals near form:** "All fields are private" + "respond within 24 hours" — good. Missing: privacy policy link under submit, "no spam ever," "trusted by 500+ WI homeowners."
- **No Google Map embed** — add one (strengthens LocalBusiness schema).
- **Schema:** No LocalBusiness with contactPoint + openingHoursSpecification + areaServed. 🚨

---

### 7. Blog Index `/news/`

10 posts visible, localized titles, branded experience. But:
- No featured images on listings
- No dates, authors, read times shown
- Categories show as "9-14" numerical
- No sidebar
- No Blog/BlogPosting schema

---

### 8. Blog Post `/news/kitchen-remodeling-cost-green-bay-wisconsin-2026/`

**Strengths:** Highly localized, clean H2 structure, tiered pricing callouts, internal linking, mid-article CTA.

**Weaknesses:**
- 🚨 No hero image on a kitchen-cost post = wasted real estate
- 🚨 No author (should attribute Jorge Cruz with mini-bio — critical for E-E-A-T)
- No publish date visible
- No table of contents
- Pricing tiers as prose instead of table
- No BlogPosting schema with author/datePublished/image
- 500-600 words is short — Google ranks 1500-3000 for cost-guide intent

---

## Mobile-Specific Issues (Rule 1b — Priority #1)

| Issue | Severity | Fix |
|---|---|---|
| Form below fold on /contact/ on mobile | 🚨 Critical | Reorder: form first on mobile |
| No sticky mobile CTA bar | 🚨 Critical | Fixed bottom bar 56px, 3 thumb-zone buttons |
| Service grid emojis look childish | High | Replace with photos |
| Logo hero dominates 600px = no kitchen visible | High | Mobile-specific hero photo |
| Hamburger menu functionality unverified | Medium | Manual test iOS Safari + Android Chrome |
| Tap targets on social icons unverified | Medium | Confirm ≥ 44×44px, add aria-labels |
| Tel: links present ✅ | Good | Keep |
| Dropdown pre-population ✅ | Good | Keep |

---

## A11y Issues

- 🚨 **Image alt text missing** site-wide. WCAG 1.1.1 Level A violation.
- 🚨 **Icon-only links (WhatsApp 💬, social icons) likely have no `aria-label`.**
- Color contrast: navy `#1B2A4A` on white = ~12:1 ✅ AAA. Orange `#FF6B00` on white = ~3.4:1 — **fails AA for body text**. Don't use orange for body copy (OK for large text/buttons).
- Headings hierarchy clean (single H1 per page) ✅
- Skip-to-content link unverified

---

## CWV Hypotheses (need real Lighthouse)

- **LCP:** Logo-as-hero is cheap → probably OK. Once photo hero added, ensure WebP/AVIF + `fetchpriority="high"` + dimensions set.
- **CLS:** Forms with reflow → set `min-height` on form container.
- **INP:** Modal popups can hurt INP → verify no synchronous JS on open.
- **JS bundle:** Probably 300-500KB (WP + Astra + SureForms). Audit with `pagespeed.web.dev`.

---

## Assets Request from Jefe

### Photos (priority order)
1. 🚨 **6 service hero photos** — one per service category. Completed work, daylight, wide-angle. iPhone 4K OK.
2. 🚨 **Founder portrait of Jorge** — chest-up, on jobsite, natural light.
3. 🚨 **6-10 portfolio projects** — each with 4-8 photos (before/during/after), city, year, scope.
4. **Homepage hero photo** — best completed kitchen or deck, horizontal 16:9.
5. **2-3 in-action shots of Jorge** — measuring, framing, finishing trim.
6. **Team photo** if applicable.

### Text/Data
1. 🚨 **WI DSPS license number** + insurance carrier name (for trust badges)
2. 🚨 **Google Business Profile review count + average rating**
3. 🚨 **3-5 named testimonials**: first name + last initial, city, project type, 1-3 sentence quote
4. **BBB profile** — register if not done; get badge code
5. **NARI / NAHB / chamber memberships** — if any
6. **Service pricing ranges** — "starting from" per service (kills 40% low-fit leads = good)
7. **Workmanship guarantee terms** (currently undefined)
8. **Founder personal story** — 200-300 words: why Jorge started Geo, why "Built to Last" means to him

### Optional but high-impact
- 60-second phone video of Jorge intro
- One full case study with photos + 30-min customer interview (~$200 spend, best marketing ROI possible)

---

## What I would NOT change

- **Bilingual nav** (Servicios, Contacto, Inicio) — keep, differentiation
- **Phone-first contact** — correct for audience
- **Service area specificity** — 15+ cities named, don't dilute
- **"What we quote is what you pay"** — keep, real differentiator
- **WhatsApp as alt channel** — correct for bilingual Hispanic segment
- **Hours clearly displayed** — Mon-Fri 8am-6pm, Sat 9am-3pm
- **24-hour response promise** — reinforce
- **Hero tagline "Built to Last. Crafted with Pride."** — stays, strong

---

## Implementation Order (2-week plan)

**Week 1 — Zero-asset quick wins (ALEX via WP-CLI + child theme CSS):**
- Day 1 (30 min): Change form button "Submit" → "Get My Free Estimate" 🚨
- Day 1 (1 hr): Add sticky mobile CTA bar (CSS-only)
- Day 1 (1 hr): Install LocalBusiness + BlogPosting schema in functions.php
- Day 2 (2 hr): Reorder /contact/ — form to top, contact info below
- Day 2 (1 hr): Add alt text + aria-labels site-wide
- Day 3 (1 hr): Rewrite H1s on /about/ and /services/
- Day 3 (1 hr): Add "Jorge Cruz" byline to all 10 posts
- Day 4-5: Expand kitchen blog post to 1500+ words with FAQ schema

**Week 2 — Asset-dependent big lifts:**
- Photos arrive → replace emojis on /services/, add homepage hero, add Jorge portrait on /about/
- Build out /portfolio/ with first 6 projects
- Add 3 testimonials to homepage + /contact/
- Add Google Map embed to /contact/
- Add Service schema to each service page with FAQ

After 2 weeks: site reads as premium-local-contractor, not starter-WordPress.

---

## Critical issues count: **11 🚨**
