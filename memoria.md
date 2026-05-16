# memoria.md — Briefing para Jules (Geo Carpentry)

> **Read this file FIRST on every task.** It contains hard-won lessons that have already cost the business real money. Skipping any of the rules in this document risks breaking the production site, wiping content, or undoing approved design work.
>
> Author: ALEX (Claude Code, Jorge's primary AI partner). Last updated: 2026-05-16.
> Co-worker: Jules (Google Labs autonomous PR agent).
> Owner: Jorge Cruz (Jefe) — bilingual EN/ES, mobile-first user, Northeast Wisconsin.

---

## 1. Who Geo Carpentry actually is

| Fact | Detail |
|---|---|
| Legal name | **Geo Carpentry LLC** |
| Business type | **Licensed General Contractor** — NOT a carpenter, NOT a handyman. Full-service: kitchen remodel, bathroom remodel, deck building, finish carpentry, framing, additions, home renovation, custom homes, basement finishing |
| Location | Green Bay, WI + 17 cities across Northeast Wisconsin (Howard, De Pere, Allouez, Bellevue, Suamico, Appleton, etc.) |
| Founded | 2014 (12+ years experience) |
| Track record | 500+ projects completed |
| Credentials | **Licensed (WI DSPS) + Fully Insured** — exact license # and insurance carrier are TBD from Jefe; do NOT invent numbers |
| Owner | **Jorge Cruz** — bilingual EN/ES, leads all work personally |
| Team | Bilingual EN/ES crew |
| Tagline | **"Built to Last. Crafted with Pride."** |
| Phone | (920) 367-1272 |
| WhatsApp | +1 920 934 0351 |
| Email | admin@geocarpentry.com |
| Domain | https://geocarpentry.com |

### Brand colors (use these EXACT hex values — anything else is a regression)
- **Primary navy:** `#1B2A4A`
- **Accent orange:** `#FF6B00`
- **Cream warm:** `#FAF7F0`
- **Charcoal text:** `#0A0A0A`
- **White:** `#FFFFFF`

### Brand voice
- Editorial, warm, trust-focused — NOT brutalist, NOT tech-cyberpunk.
- Target audience is **homeowners**, not developers. Plain, confident language.
- Trust signals up front: license, insurance, years, project count, bilingual.
- Bilingual content where it serves the user. NEVER mix EN + ES in the same paragraph/visual — keep each piece mono-language.

### What Geo Carpentry does NOT do (do not write copy implying otherwise)
- **No custom cabinet making / custom woodwork from scratch.** Jorge installs, remodels, and finishes — does not run a cabinet shop. Any mention of "custom woodwork" or "custom cabinets" is a regression and was removed in May 2026.
- No commercial / industrial scale work (residential focus).

---

## 2. Tech stack — what's live in production

| Layer | Stack | Notes |
|---|---|---|
| Domain DNS | **Squarespace** (NOT Cloudflare). MX records point to Google Workspace. A record `@ → 156.67.74.243`. | A previous CAA record `0 issue "pki.goog"` blocked SSL issuance for weeks. Verify no CAA records exist before assuming SSL works. |
| Hosting | **Hostinger shared** (account `u433637438`, SSH port `65002`, web root `/home/u433637438/domains/geocarpentry.com/public_html/`) | Cron jobs only available via hPanel UI, not crontab. |
| SSL | **Let's Encrypt via Hostinger** | Valid until 2026-08-13. Auto-renews. |
| CMS | **WordPress 6.9.4** | |
| Theme | **Astra (parent) + `geo-carpentry-child` (child theme)** | All custom code goes in the child theme. NEVER edit the Astra parent. |
| Forms | **SureForms — form ID `2340` "Quote Request"** embedded at `/contact/` | Submits route through the mu-plugin. |
| Lead pipeline | **mu-plugin `geo-airtable-lead-capture.php`** at `wp-content/mu-plugins/` | Posts every form submission to Airtable Contacts + Leads tables. Credentials in `wp-config.php` constants. |
| Cache | **LiteSpeed Cache** | Purge after any CSS/JS/PHP change: `wp litespeed-purge all`. |
| SEO plugin | **SureRank** | Generates Open Graph, meta titles, descriptions, FAQPage schema where H2 questions present. |
| Page builder | **Spectra (Ultimate Addons for Gutenberg)** | Already installed; prefer Spectra blocks over arbitrary Gutenberg HTML for new sections. |
| CRM | **Airtable** — base `appAQpveuAec077jF` | Tables: Contacts, Leads, Jobs, Subcontractors, Activities, Permits, SEO_Audits, Blog_Queue (planned). |
| SEO agent | **Posicionador** (Node.js, in InvestorOS repo) | Shells to `claude --print` CLI (Claude MAX subscription). Writes audits to Airtable `SEO_Audits`. Cron scheduled weekly via Hostinger hPanel. |
| Content engine (planned) | **Escriba** | Generates bilingual blog drafts → WP REST API → `Blog_Queue` Airtable table. |

---

## 3. Repo conventions

| Path | What lives there |
|---|---|
| `automation/wordpress/child-theme/functions.php` | All custom PHP — filters, schema injection, shortcodes, helpers. |
| `automation/wordpress/child-theme/style.css` | All custom CSS. Astra parent CSS is loaded automatically. |
| `automation/screenshots/<YYYY-MM-DD>-<context>/` | Browser screenshots verifying UI changes. Mandatory artifact for any visual PR. |
| `automation/CUTOVER_STATUS_2026-05-15.md` etc. | Session logs / status reports. Read these before assuming history. |
| `automation/HOSTINGER_DEPLOY_GUIDE.md` | Deploy procedure (SFTP via SSH key) |
| `memoria.md` (this file) | Briefing for Jules — read first |

### Branch + PR flow
- `master` is production. Never push directly.
- Feature branches: `feature/<short-topic>` (Jules uses `feature/design-seo-polish-<task_id>`).
- PRs need at minimum: description of changes, list of files touched, **and at least one before/after browser screenshot for any UI/CSS/template work**.
- ALEX deploys merged code to Hostinger via SFTP after each merge.

### Backups on Hostinger
- Any file you replace via deploy MUST first be backed up with `.bak.YYYYMMDD` suffix.
- Current backups in production: `style.css.bak.20260515`, `functions.php.bak.20260515`.

---

## 4. CRITICAL LESSONS — Things that have already broken the site

> Each rule below maps to a real outage that cost Jorge money. These are non-negotiable.

### LESSON 1 — PHP PCRE does NOT support variable-width lookbehinds
**Outage:** 2026-05-15. An aria-label filter used `(?<!aria-label="[^"]*")`. PHP returned `null` from `preg_replace_callback`, which then wiped the entire `post_content` of every page. Every public URL rendered as just header + empty card + footer.

**Why it broke:** PHP PCRE only supports **fixed-width** lookbehinds. `[^"]*` is variable. The regex compiles to nothing → callback returns null → null overwrites content.

**Rule:** Lookbehinds must be fixed-width. To check "does this string already contain X?", do it **inside the callback** with `strpos()`:
```php
$content = preg_replace_callback('/<a([^>]*href="...")[^>]*>/i', function($m) {
    if (strpos($m[0], 'aria-label') !== false) return $m[0];  // skip if already labeled
    return '<a' . $m[1] . ' aria-label="...">';
}, $content);
```

### LESSON 2 — preg_replace / preg_replace_callback on `the_content` MUST null-check
**Same outage.** If the regex errors for ANY reason (variable-width lookbehind, malformed pattern, multi-byte issue, recursion limit), the function returns `null`. Assigning that back to `$content` wipes the page.

**Rule — always use this pattern:**
```php
$new = preg_replace_callback($pattern, $callback, $content);
if ($new !== null) {
    $content = $new;
}
return $content;
```
Or equivalent ternary:
```php
return ($new !== null) ? $new : $content;
```

**This applies to every regex operation on `the_content`, `the_excerpt`, `widget_text`, `wp_nav_menu_items`, and any other content filter.**

### LESSON 3 — Never hijack existing content classes for opacity:0 + JS-reveal patterns
**Outage:** 2026-05-15 (same session). Added a "scroll fade-in" rule:
```css
.gc-section, .gc-page-intro, .gc-cta-banner { opacity: 0; }
```
…intending an IntersectionObserver to add `.is-visible` and reveal them. The JS misfired on initial load. All existing content remained invisible. Site looked like header + footer + empty cards.

**Rule:** Fade-in / reveal patterns must be **opt-in via a new class**, never via existing content classes:
```css
.gc-fade-in { opacity: 0; transform: translateY(18px); transition: ... }
.gc-fade-in.is-visible { opacity: 1; transform: translateY(0); }
```
And only put `.gc-fade-in` on new elements you're certain you control. If the JS fails, missing content is **invisible** — the worst kind of bug because it doesn't error, it just disappears.

### LESSON 4 — Browser screenshots are MANDATORY for any UI/CSS/template change
**Quote from the Jefe (2026-05-15):** *"como puedo confiar en ti? esto me cuesta dinero y tu lo estas desperdiciando!"*

`curl`, `WebFetch`, and `Invoke-WebRequest` fetch static HTML. They do **NOT** execute JavaScript, do **NOT** apply CSS, and do **NOT** show what a visitor actually sees. They are useful for **structural** verification (titles, schema present, HTML well-formed) but **never** sufficient for **visual** verification.

**Rule:** Before opening a PR for UI/CSS/template changes, take a real browser screenshot of every affected page and attach it to the PR. On Windows, Edge headless works:
```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless --disable-gpu --hide-scrollbars `
  --window-size=1400,2400 `
  --screenshot="automation/screenshots/2026-05-16-mychange/home.png" `
  https://geocarpentry.com/
```
Mobile viewport too — Jefe's users are mobile-first:
```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless --disable-gpu `
  --window-size=375,1200 `
  --screenshot="automation/screenshots/2026-05-16-mychange/home-mobile.png" `
  https://geocarpentry.com/
```

### LESSON 5 — Commit assets in the SAME PR that references them
**Outage risk:** PR #3 (May 2026) referenced `kitchen.jpg`, `full renovation.png`, `decks.png`, `basement.jpg`, `new construction.png` in both CSS and PHP — without committing the actual image files. If merged, every reference would 404, hero background would fall back to navy, and service cards would show broken-image icons.

**Rule:**
- Before opening a PR that references assets (images, fonts, JSON files), **verify each referenced filename exists in the branch.**
- Run `git ls-files automation/wordpress/child-theme/` and grep your asset names. If any are missing, **add them to the same PR**.
- Prefer filenames without spaces: `full-renovation.png`, not `full renovation.png`. URL-encoded spaces work but are fragile and obscure log diagnostics.

### LESSON 6 — Mobile-first is mandatory (CLAUDE.md regla 1b)
- Hero sections: avoid `min-height: 88vh` or higher on mobile. Anything ≥ 85vh forces the user to scroll past empty space before reaching real content.
- Tap targets ≥ 44×44px.
- Test mobile viewport (375×812 iPhone SE/14) **before** desktop.
- No hover-dependent UX (mobile has no hover).
- CSS base for mobile, media queries scale up to desktop (never the reverse).

### LESSON 7 — SEO score is NOT visual rendering
The Posicionador SEO agent measures HTML structure: titles, schema, headers, descriptions, alt text. It can score a site 63/100 (up from 58) while the entire site renders as blank cards. **Never conflate the two when reporting work.**

**Rule — distinguish in PR descriptions and reports:**
- **Structural wins** (measurable via curl, WebFetch, Posicionador): titles, schema, headers, descriptions.
- **Visual wins** (only verifiable via browser screenshot): layout renders, content visible, colors correct, no overlapping elements.

### LESSON 8 — DNS reality: Squarespace, not Cloudflare
Many older docs assume Cloudflare. The reality (2026-05-15):
- **DNS authoritative:** Squarespace
- **MX:** Google Workspace
- **A record:** `@ → 156.67.74.243` (Hostinger)
- **CAA:** must be EMPTY (a stale `pki.goog` CAA blocked SSL for weeks)

Before debugging "site is down," check DNS via `dig`/`nslookup` against Squarespace, not Cloudflare.

---

## 5. Existing critical filters in `functions.php` — do not break these

| Filter / action | Purpose | Status |
|---|---|---|
| `pre_get_document_title` | Custom SEO titles per page | Safe — keep |
| `wp_head` (SEO descriptions) | Meta description injection | Safe |
| `wp_head` (LocalBusiness schema) | LocalBusiness JSON-LD with `areaServed` for 17 NE WI cities | Safe |
| `wp_head` (Service schema) | Service JSON-LD on service pages | Safe |
| `wp_head` (FAQPage schema) | FAQ rich results for voice search | Verify exists / additive |
| `wp_head` (BreadcrumbList schema) | Breadcrumb rich results | Additive — review PR #3 |
| `the_content` (aria-label filter) | Adds `aria-label` to social/WA links | Null-safe — keep |
| `the_content` (lazy-load filter) | Adds `loading="lazy"` to non-first images | Null-safe — keep |
| `the_content` (author byline filter) | Injects Jorge Cruz byline on single posts | Safe |
| Sticky mobile CTA bar (footer action) | Always-visible Call / WhatsApp / Quote on mobile | Safe |
| IntersectionObserver JS (footer) | Adds `.is-visible` to `.gc-fade-in` ONLY | Safe (post-fix) |
| Skip-link injection | A11y skip-to-content | Safe |

**If you must modify any of these, run the LESSON 1 + 2 checks (no variable-width lookbehinds, null-safety guards on every regex assignment) and add a browser screenshot before requesting merge.**

---

## 6. Working alongside ALEX

I am ALEX (Claude Code, claude-opus-4-7), Jorge's primary AI partner. I operate from Jorge's Windows laptop with access to:
- This repo (read/write)
- Hostinger via SSH/SFTP (deploy)
- Edge headless (browser screenshots)
- Airtable (read/write all Geo Carpentry CRM tables)
- A persistent memory store at `C:\Users\Admin\.claude\projects\.../memory/`

### How to avoid conflicts with ALEX
1. **Communicate via PR descriptions** — list the files you're touching and the exact problem you're solving.
2. **Don't open PRs that overlap with active branches.** Check `gh pr list --repo geocarp24/geo-carpentry` before starting.
3. **Don't deploy directly to Hostinger.** ALEX owns the SFTP deploy step. Your job ends at the merged PR; ALEX picks it up from there.
4. **Don't invent metrics.** If you don't have license #, insurance carrier, project count for a specific service, leave a `TODO(jefe)` placeholder rather than guessing.
5. **Spanish + English in PR descriptions is fine** — Jorge is bilingual. Default to clear English in code comments and commit messages.

### What ALEX is good at, do not duplicate
- SFTP deploys to Hostinger (you can't reach it; I can).
- Browser screenshot verification on Windows.
- Airtable record manipulation via REST API (I have the token).
- Coordinating with the rest of the InvestorOS multi-agent system (Posicionador, Escriba, Creativo, Director).

### What Jules is good at, please OWN
- Backend / PHP / CSS code changes with proper PR descriptions.
- Schema markup (LocalBusiness, FAQPage, BreadcrumbList, Service, Product where applicable).
- Refactor passes (with null-safety guards added to legacy regex code).
- Code review responses on PRs Jorge opens.
- Voice search / structured data optimization.

---

## 7. Current visual strategy (2026-05-16)

The visual redesign is being driven by **Jorge via Claude.ai Artifacts**, not by autonomous AI codegen. The reason: previous attempts at "AI generates CSS → deploy → Jorge sees broken result → 8 hours wasted" failed twice. The new flow:

1. Jorge opens https://claude.ai (Sonnet 4.6 or Opus 4.7, NEVER Haiku for design tasks).
2. Jorge pastes a section prompt I provide → Claude.ai renders HTML+Tailwind in an Artifact.
3. Jorge iterates visually until he approves.
4. Jorge screenshots the approved Artifact and sends it to ALEX.
5. ALEX translates Tailwind classes → CSS in the `geo-carpentry-child` theme and deploys.
6. ALEX captures live screenshots and confirms parity with the Artifact.
7. **Then** Jules / ALEX work on the next section.

**Implications for Jules:**
- Do NOT autonomously redesign hero / sections / layouts. That work is reserved for the Artifacts flow.
- DO work on: schema markup, performance, a11y, SEO content fixes, regex hardening, dead-code removal, broken-link fixes.
- If you have a strong opinion about visuals, file an Issue (not a PR) describing the recommendation; Jorge will decide whether to put it through the Artifacts loop.

### Section sequence (planned)
1. Hero (in progress — Jorge designing in Claude.ai)
2. Service Grid (6 cards)
3. Trust Strip / Stats Bento (10+ years, 500+ projects, 100% Licensed)
4. Service Area visual (17 cities NE WI)
5. Testimonials slab
6. Form section (re-inject SureForm 2340)
7. Footer redesign

### Brand pivot (deferred)
"Licensed General Contractor + Insured" trust strip across header/footer/about — to be done AFTER the visual sections are in. Jorge has not yet provided the exact license #, insurance carrier, GL amount, or Workers Comp status. Leave placeholders until he does.

---

## 8. Pre-merge checklist (use on EVERY PR)

Copy this into the PR description and tick each box:

```
## Pre-merge checklist
- [ ] No variable-width lookbehinds in any PHP PCRE pattern
- [ ] Every preg_replace / preg_replace_callback has a `!== null` guard before reassigning
- [ ] No opacity:0 / display:none / visibility:hidden applied to EXISTING content classes
- [ ] All asset filenames referenced in CSS/PHP are committed in this PR (or already exist on master)
- [ ] Asset filenames contain no spaces (use hyphens)
- [ ] Mobile viewport tested (375px width) — no horizontal scroll, tap targets ≥ 44px
- [ ] Hero min-height ≤ 85vh on mobile
- [ ] Browser screenshot attached (desktop 1400×2400)
- [ ] Browser screenshot attached (mobile 375×1200)
- [ ] No "custom woodwork / custom cabinets" copy added
- [ ] Brand colors used: #1B2A4A navy, #FF6B00 orange, #FAF7F0 cream — no other primaries
- [ ] Bilingual content kept mono-language per element (no EN+ES mixing in same paragraph)
- [ ] If touching the_content / wp_head, all existing filters in section 5 still work after change
- [ ] Posicionador SEO score noted (structural) — distinguished from visual changes
- [ ] LiteSpeed cache purge documented in deploy steps
```

---

## 9. Quick reference — paths and IDs

| Thing | Value |
|---|---|
| Repo | `geocarp24/geo-carpentry` |
| Production URL | https://geocarpentry.com |
| Hostinger SSH | `u433637438@156.67.74.243:65002` |
| Hostinger web root | `/home/u433637438/domains/geocarpentry.com/public_html/` |
| Child theme | `automation/wordpress/child-theme/` (in repo) → `wp-content/themes/geo-carpentry-child/` (live) |
| mu-plugin | `wp-content/mu-plugins/geo-airtable-lead-capture.php` |
| Quote form | SureForm ID `2340`, embedded at `/contact/` |
| Airtable base | `appAQpveuAec077jF` |
| Key pages | 2282 Home, 2284 About, 2283 Services, 2285 Portfolio, 2288-2292 + 2326 Service detail |
| Cache purge | `wp litespeed-purge all` (SSH) |
| Backup suffix | `.bak.YYYYMMDD` on any replaced file |

---

## 10. Communication preferences

- **Jefe's language:** Spanish by default. Mix EN/ES naturally. Switch to full English only when working with code/commit messages.
- **PR titles:** English, concise, conventional commit style (`feat:`, `fix:`, `refactor:`, `docs:`).
- **PR descriptions:** Can be EN or mixed EN/ES. Always include the pre-merge checklist from section 8.
- **Commit messages:** English. Reference the lesson number if your change relates to one of the lessons in section 4 (e.g., *"refactor(content-filter): add null-safety guard per memoria.md LESSON 2"*).
- **Tone:** Direct, no hedging, no "I think" / "maybe." If something will break the site, say so plainly. If you don't know a metric (project count, license #), write `TODO(jefe)` rather than guessing.

---

## 11. Anti-regression — recurrent failure modes Jules has shown

These are real patterns from PRs already opened (PR #3 in particular). Watch for them:

1. **Referencing assets that aren't committed.** Always run a sanity check: every `url(...)` in CSS and every filename in PHP must correspond to a tracked file in the branch.
2. **Removing `\ No newline at end of file`.** PHP allows it but it's a tooling smell. Ensure files end with a single newline.
3. **Aggressive regex on `the_content` without null-safety.** Even when the regex looks safe, ALWAYS guard the reassignment.
4. **Overly broad selectors.** `'/(<div[^>]*>|<p[^>]*>|>)\s*🍳\s*(<\/div>|<\/p>|<)/u'` is too permissive — the bare `>` and `<` will match more than intended. Prefer explicit anchors.
5. **Hero `min-height` ≥ 88vh.** Mobile users hate scrolling past an empty fold.
6. **Filenames with spaces.** Rename before committing.

---

## 12. If in doubt

- Read this file again.
- Read `automation/CUTOVER_STATUS_2026-05-15.md` for the latest deployment state.
- Read `automation/OVERNIGHT_LOG_2026-05-15.md` for the most recent outage post-mortem.
- Open an Issue (not a PR) describing the question. Tag `@geocarp24`. ALEX will respond within the next session.

**The single most important rule:** if your change could affect what a real visitor sees, attach a browser screenshot to the PR. Without it, the change cannot be reviewed safely, no matter how clean the diff looks.

— ALEX (claude-opus-4-7)
