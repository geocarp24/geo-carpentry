/**
 * themes_geo.mjs — Geo Carpentry brand themes for Sofia (Creativo) agent
 * Mirrors Pinnacle themes.mjs structure — T1-T5 naming preserved so Visual_Prompt references work.
 *
 * Brand palette (matches WP Customizer CSS live on geocarpentry.com):
 *   Navy primary:  #1a2e44
 *   Orange accent: #e07b2a
 *   Cream text:    #faf7f0
 *   White:         #ffffff
 *
 * Canvas: 1080×1350px (4:5 portrait — optimal for IG feed + FB)
 */

// ── Brand constants ───────────────────────────────────────────────────────────
export const BRAND = {
  name:    'Geo Carpentry LLC',
  phone:   '(920) 367-1272',
  website: 'geocarpentry.com',
  tagline: 'Licensed General Contractor · Green Bay, WI',

  // Logo — white version (for dark backgrounds T1, T3, T5)
  LOGO_DARK_BG:  'https://geocarpentry.com/wp-content/uploads/2026/04/cropped-cropped-GEO-CARPENTRY-Logo-with-Soft-White-Highlights-2.png',
  // Logo — dark version (for light backgrounds T2, T4)
  LOGO_LIGHT_BG: 'https://geocarpentry.com/wp-content/uploads/2026/05/logo-solo-actual-scaled.png',

  // Service photos (raw from WP media library — used as bg_image_url)
  photos: {
    kitchen:      'https://geocarpentry.com/wp-content/uploads/2026/05/kitchen.jpg',
    deck:         'https://geocarpentry.com/wp-content/uploads/2026/05/decks.png',
    bathroom:     'https://geocarpentry.com/wp-content/uploads/2026/05/IMG_1109-scaled.png',
    renovation:   'https://geocarpentry.com/wp-content/uploads/2026/05/full-renovation.png',
    construction: 'https://geocarpentry.com/wp-content/uploads/2026/05/new-construction.png',
    carpentry:    null, // Jorge to provide — fallback to navy bg
  },

  // Trust badges shown in footer
  badges: ['Licensed & Insured', '500+ Projects', '12+ Years'],

  // Hashtags
  hashtags_en: '#GreenBayWI #GeneralContractor #KitchenRemodel #BathroomRemodel #DeckBuilding #WisconsinHomes #HomeRenovation #GeoCarpentry',
  hashtags_es: '#ContratistasWisconsin #RemodelacionCocina #ContratistaCertificado #GreenBayWI #RenovacionHogar #CarpinteriaCustom',
};

// ── Service price ranges ──────────────────────────────────────────────────────
export const SERVICES = {
  kitchen:      { name: 'Kitchen Remodeling',    es: 'Remodelación de Cocina',   low: '$5K',  high: '$30K' },
  bathroom:     { name: 'Bathroom Remodeling',   es: 'Remodelación de Baño',     low: '$3K',  high: '$15K' },
  deck:         { name: 'Deck Building',         es: 'Construcción de Deck',     low: '$2K',  high: '$12K' },
  carpentry:    { name: 'Finish Carpentry',       es: 'Carpintería de Acabados',  low: '$500', high: '$8K'  },
  renovation:   { name: 'Home Renovation',       es: 'Renovación de Hogar',      low: '$5K',  high: '$50K' },
  construction: { name: 'General Construction',  es: 'Construcción General',     low: '$3K',  high: '$100K'},
};

// ── Theme definitions T1-T5 ───────────────────────────────────────────────────
// Each theme returns an HTML string at 1080×1350px.
// Caller injects: headline, body_text, city, post_type_label,
//                 bg_image_url (optional), show_price, service_key, lang

export function buildHtml(theme, vars) {
  const t = THEMES[theme] || THEMES.T1;
  return t(vars);
}

const THEMES = {

  // T1 — Dark Premium (navy bg + orange accent)
  // Best for: Project Showcase, CTA, Trust Signal
  T1: (v) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#1a2e44;color:#faf7f0;position:relative}
  .bg{position:absolute;inset:0;background-image:url('${v.bg_image_url||''}');background-size:cover;background-position:center;opacity:.28}
  .overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(26,46,68,.95) 40%,rgba(224,123,42,.18) 100%)}
  .wrap{position:relative;z-index:2;padding:72px 80px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  .logo{height:60px;object-fit:contain}
  .city{background:rgba(224,123,42,.9);border-radius:40px;padding:10px 26px;font-size:28px;font-weight:700;color:#fff}
  .post-type{font-size:24px;font-weight:600;color:#e07b2a;text-transform:uppercase;letter-spacing:3px;margin-bottom:18px}
  h1{font-size:${v.headline_size||72}px;font-weight:800;line-height:1.1;color:#faf7f0;margin-bottom:24px}
  h1 span{color:#e07b2a}
  .body{font-size:34px;line-height:1.55;color:rgba(250,247,240,.82);max-width:920px;margin-bottom:36px}
  .price{display:inline-block;background:#e07b2a;border-radius:8px;padding:14px 32px;font-size:40px;font-weight:800;color:#fff;margin-bottom:36px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .phone{font-size:40px;font-weight:800;color:#e07b2a}
  .site{font-size:26px;color:rgba(250,247,240,.65);margin-top:8px}
  .badges{display:flex;gap:16px}
  .badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:10px 18px;font-size:20px;font-weight:600;color:#faf7f0;text-align:center}
  .bar{position:absolute;bottom:0;left:0;right:0;height:12px;background:#e07b2a}
</style></head><body>
  ${v.bg_image_url ? '<div class="bg"></div>' : ''}
  <div class="overlay"></div>
  <div class="wrap">
    <div class="header">
      <img class="logo" src="${BRAND.LOGO_DARK_BG}" alt="Geo Carpentry">
      <div class="city">${v.city||'Green Bay'}, WI</div>
    </div>
    <div>
      <div class="post-type">${v.post_type_label||'General Contractor'}</div>
      <h1>${v.headline||'Quality Craftsmanship<br><span>Built to Last</span>'}</h1>
      <p class="body">${v.body_text||''}</p>
      ${v.show_price ? `<div class="price">Starting at ${v.price_low} · Est. ${v.price_high}</div>` : ''}
    </div>
    <div class="footer">
      <div><div class="phone">${BRAND.phone}</div><div class="site">${BRAND.website}</div></div>
      <div class="badges">${BRAND.badges.map(b=>`<div class="badge">${b.replace(' & ','<br>&')}</div>`).join('')}</div>
    </div>
  </div>
  <div class="bar"></div>
</body></html>`,

  // T2 — White Clean (white bg + navy text + orange accents)
  // Best for: Pro Tip, FAQ, Before/After
  T2: (v) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;color:#1a2e44;position:relative}
  .wrap{padding:72px 80px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  .logo{height:60px;object-fit:contain}
  .city{background:#1a2e44;border-radius:40px;padding:10px 26px;font-size:28px;font-weight:700;color:#fff}
  .accent-line{width:80px;height:6px;background:#e07b2a;border-radius:3px;margin-bottom:24px}
  .post-type{font-size:24px;font-weight:600;color:#e07b2a;text-transform:uppercase;letter-spacing:3px;margin-bottom:18px}
  h1{font-size:${v.headline_size||68}px;font-weight:800;line-height:1.1;color:#1a2e44;margin-bottom:24px}
  h1 span{color:#e07b2a}
  .body{font-size:34px;line-height:1.55;color:rgba(26,46,68,.78);max-width:920px;margin-bottom:36px}
  .price{display:inline-block;background:#1a2e44;border-radius:8px;padding:14px 32px;font-size:40px;font-weight:800;color:#fff;margin-bottom:36px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .phone{font-size:40px;font-weight:800;color:#1a2e44}
  .site{font-size:26px;color:rgba(26,46,68,.5);margin-top:8px}
  .badges{display:flex;gap:16px}
  .badge{background:#f0f4f8;border:1px solid #dde4ed;border-radius:8px;padding:10px 18px;font-size:20px;font-weight:600;color:#1a2e44;text-align:center}
  .bar-top{position:absolute;top:0;left:0;right:0;height:12px;background:#e07b2a}
</style></head><body>
  <div class="bar-top"></div>
  <div class="wrap">
    <div class="header">
      <img class="logo" src="${BRAND.LOGO_LIGHT_BG}" alt="Geo Carpentry">
      <div class="city">${v.city||'Green Bay'}, WI</div>
    </div>
    <div>
      <div class="accent-line"></div>
      <div class="post-type">${v.post_type_label||'General Contractor'}</div>
      <h1>${v.headline||'Quality Craftsmanship<br><span>Built to Last</span>'}</h1>
      <p class="body">${v.body_text||''}</p>
      ${v.show_price ? `<div class="price">Starting at ${v.price_low} · Est. ${v.price_high}</div>` : ''}
    </div>
    <div class="footer">
      <div><div class="phone">${BRAND.phone}</div><div class="site">${BRAND.website}</div></div>
      <div class="badges">${BRAND.badges.map(b=>`<div class="badge">${b.replace(' & ','<br>&')}</div>`).join('')}</div>
    </div>
  </div>
</body></html>`,

  // T3 — Gold & Black (premium dark + gold accent)
  // Best for: High-end projects, luxury kitchen/bath
  T3: (v) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#0a0a0a;color:#ffffff;position:relative}
  .bg{position:absolute;inset:0;background-image:url('${v.bg_image_url||''}');background-size:cover;background-position:center;opacity:.22}
  .overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(10,10,10,.95) 45%,rgba(212,160,23,.12) 100%)}
  .wrap{position:relative;z-index:2;padding:72px 80px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  .logo{height:60px;object-fit:contain}
  .city{border:2px solid #d4a017;border-radius:40px;padding:10px 26px;font-size:28px;font-weight:700;color:#d4a017}
  .post-type{font-size:24px;font-weight:600;color:#d4a017;text-transform:uppercase;letter-spacing:4px;margin-bottom:18px}
  h1{font-size:${v.headline_size||72}px;font-weight:800;line-height:1.1;color:#ffffff;margin-bottom:24px}
  h1 span{color:#d4a017}
  .body{font-size:34px;line-height:1.55;color:rgba(255,255,255,.75);max-width:920px;margin-bottom:36px}
  .price{display:inline-block;background:#d4a017;border-radius:8px;padding:14px 32px;font-size:40px;font-weight:800;color:#0a0a0a;margin-bottom:36px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .phone{font-size:40px;font-weight:800;color:#d4a017}
  .site{font-size:26px;color:rgba(255,255,255,.5);margin-top:8px}
  .badges{display:flex;gap:16px}
  .badge{border:1px solid rgba(212,160,23,.4);border-radius:8px;padding:10px 18px;font-size:20px;font-weight:600;color:#d4a017;text-align:center}
  .bar{position:absolute;bottom:0;left:0;right:0;height:8px;background:linear-gradient(90deg,#d4a017,#e07b2a)}
</style></head><body>
  ${v.bg_image_url ? '<div class="bg"></div>' : ''}
  <div class="overlay"></div>
  <div class="wrap">
    <div class="header">
      <img class="logo" src="${BRAND.LOGO_DARK_BG}" alt="Geo Carpentry">
      <div class="city">${v.city||'Green Bay'}, WI</div>
    </div>
    <div>
      <div class="post-type">${v.post_type_label||'General Contractor'}</div>
      <h1>${v.headline||'Premium Craftsmanship<br><span>Exceptional Results</span>'}</h1>
      <p class="body">${v.body_text||''}</p>
      ${v.show_price ? `<div class="price">Starting at ${v.price_low} · Est. ${v.price_high}</div>` : ''}
    </div>
    <div class="footer">
      <div><div class="phone">${BRAND.phone}</div><div class="site">${BRAND.website}</div></div>
      <div class="badges">${BRAND.badges.map(b=>`<div class="badge">${b.replace(' & ','<br>&')}</div>`).join('')}</div>
    </div>
  </div>
  <div class="bar"></div>
</body></html>`,

  // T4 — Soft Cream (warm neutral bg — friendly, approachable)
  // Best for: Seasonal, community posts, bilingual ES content
  T4: (v) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#f8f5ee;color:#1a2e44;position:relative}
  .wrap{padding:72px 80px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  .logo{height:60px;object-fit:contain}
  .city{background:#e07b2a;border-radius:40px;padding:10px 26px;font-size:28px;font-weight:700;color:#fff}
  .post-type{font-size:24px;font-weight:600;color:#e07b2a;text-transform:uppercase;letter-spacing:3px;margin-bottom:18px}
  .divider{width:100%;height:2px;background:rgba(26,46,68,.12);margin-bottom:28px}
  h1{font-size:${v.headline_size||68}px;font-weight:800;line-height:1.1;color:#1a2e44;margin-bottom:24px}
  h1 span{color:#e07b2a}
  .body{font-size:34px;line-height:1.55;color:rgba(26,46,68,.72);max-width:920px;margin-bottom:36px}
  .price{display:inline-block;background:#e07b2a;border-radius:8px;padding:14px 32px;font-size:40px;font-weight:800;color:#fff;margin-bottom:36px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .phone{font-size:40px;font-weight:800;color:#1a2e44}
  .site{font-size:26px;color:rgba(26,46,68,.45);margin-top:8px}
  .badges{display:flex;gap:16px}
  .badge{background:#fff;border:1px solid rgba(26,46,68,.15);border-radius:8px;padding:10px 18px;font-size:20px;font-weight:600;color:#1a2e44;text-align:center}
  .bar{position:absolute;bottom:0;left:0;right:0;height:12px;background:#1a2e44}
</style></head><body>
  <div class="wrap">
    <div class="header">
      <img class="logo" src="${BRAND.LOGO_LIGHT_BG}" alt="Geo Carpentry">
      <div class="city">${v.city||'Green Bay'}, WI</div>
    </div>
    <div>
      <div class="divider"></div>
      <div class="post-type">${v.post_type_label||'General Contractor'}</div>
      <h1>${v.headline||'Your Home,<br><span>Our Craft</span>'}</h1>
      <p class="body">${v.body_text||''}</p>
      ${v.show_price ? `<div class="price">Starting at ${v.price_low} · Est. ${v.price_high}</div>` : ''}
    </div>
    <div class="footer">
      <div><div class="phone">${BRAND.phone}</div><div class="site">${BRAND.website}</div></div>
      <div class="badges">${BRAND.badges.map(b=>`<div class="badge">${b.replace(' & ','<br>&')}</div>`).join('')}</div>
    </div>
  </div>
  <div class="bar"></div>
</body></html>`,

  // T5 — Vibrant Blue (deep navy + blue accent — trust/authority)
  // Best for: Licensed/Insured trust posts, awards, credentials
  T5: (v) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#1a2e44;color:#fff;position:relative}
  .bg{position:absolute;inset:0;background-image:url('${v.bg_image_url||''}');background-size:cover;background-position:center;opacity:.2}
  .overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(26,46,68,.97) 50%,rgba(59,130,246,.15) 100%)}
  .wrap{position:relative;z-index:2;padding:72px 80px;height:100%;display:flex;flex-direction:column;justify-content:space-between}
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  .logo{height:60px;object-fit:contain}
  .city{background:rgba(59,130,246,.85);border-radius:40px;padding:10px 26px;font-size:28px;font-weight:700;color:#fff}
  .post-type{font-size:24px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:3px;margin-bottom:18px}
  h1{font-size:${v.headline_size||72}px;font-weight:800;line-height:1.1;color:#fff;margin-bottom:24px}
  h1 span{color:#3b82f6}
  .body{font-size:34px;line-height:1.55;color:rgba(255,255,255,.8);max-width:920px;margin-bottom:36px}
  .price{display:inline-block;background:#3b82f6;border-radius:8px;padding:14px 32px;font-size:40px;font-weight:800;color:#fff;margin-bottom:36px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .phone{font-size:40px;font-weight:800;color:#3b82f6}
  .site{font-size:26px;color:rgba(255,255,255,.5);margin-top:8px}
  .badges{display:flex;gap:16px}
  .badge{background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.35);border-radius:8px;padding:10px 18px;font-size:20px;font-weight:600;color:#93c5fd;text-align:center}
  .bar{position:absolute;bottom:0;left:0;right:0;height:12px;background:#3b82f6}
</style></head><body>
  ${v.bg_image_url ? '<div class="bg"></div>' : ''}
  <div class="overlay"></div>
  <div class="wrap">
    <div class="header">
      <img class="logo" src="${BRAND.LOGO_DARK_BG}" alt="Geo Carpentry">
      <div class="city">${v.city||'Green Bay'}, WI</div>
    </div>
    <div>
      <div class="post-type">${v.post_type_label||'Licensed & Insured'}</div>
      <h1>${v.headline||'Your <span>Trust</span> Is<br>Our Standard'}</h1>
      <p class="body">${v.body_text||''}</p>
      ${v.show_price ? `<div class="price">Starting at ${v.price_low} · Est. ${v.price_high}</div>` : ''}
    </div>
    <div class="footer">
      <div><div class="phone">${BRAND.phone}</div><div class="site">${BRAND.website}</div></div>
      <div class="badges">${BRAND.badges.map(b=>`<div class="badge">${b.replace(' & ','<br>&')}</div>`).join('')}</div>
    </div>
  </div>
  <div class="bar"></div>
</body></html>`,
};

// ── Theme selector helper ─────────────────────────────────────────────────────
// Maps Visual_Prompt theme code → theme function
export function getTheme(code) {
  return THEMES[code] || THEMES.T1;
}

// ── Post type → suggested theme mapping ──────────────────────────────────────
export const POST_TYPE_THEMES = {
  'project_showcase': 'T1',
  'pro_tip':          'T2',
  'before_after':     'T2',
  'faq':              'T4',
  'cta':              'T1',
  'seasonal':         'T4',
  'trust_signal':     'T5',
  'luxury':           'T3',
};

// ── Pinnacle API compatibility shims ─────────────────────────────────────────
// creativo.mjs imports these names from themes.mjs — we shim them here so
// the same agent works for Geo without modification.
// Geo posts are single-frame composites, not carousels. All slide functions
// return the same full-frame HTML with the appropriate vars.

export const VALID_THEME_CODES = Object.keys(THEMES); // ['T1','T2','T3','T4','T5']

// Map Pinnacle slide vars → Geo buildHtml vars
function _toGeoVars(themeCode, vars = {}) {
  return {
    headline:       vars.headline    || vars.hook      || vars.title || '',
    body_text:      vars.body        || vars.point     || vars.text  || '',
    city:           vars.city        || 'Green Bay',
    post_type_label: vars.post_type  || vars.label     || 'General Contractor',
    bg_image_url:   vars.bg_image_url|| vars.bg        || '',
    show_price:     !!(vars.price_low || vars.show_price),
    price_low:      vars.price_low   || '',
    price_high:     vars.price_high  || '',
    headline_size:  vars.headline_size || 72,
  };
}

// Single slides — each returns HTML string for one frame
export function slideHook(themeCode, vars) {
  const t = THEMES[themeCode] || THEMES.T1;
  return t(_toGeoVars(themeCode, { ...vars, post_type_label: vars.post_type || 'Pro Tip' }));
}

export function slidePoint(themeCode, vars) {
  const t = THEMES[themeCode] || THEMES.T1;
  return t(_toGeoVars(themeCode, vars));
}

export function slideCTA(themeCode, vars) {
  const t = THEMES[themeCode] || THEMES.T1;
  return t(_toGeoVars(themeCode, { ...vars, show_price: true }));
}

export function slidePostEditorial(themeCode, vars) {
  const t = THEMES[themeCode] || THEMES.T1;
  return t(_toGeoVars(themeCode, vars));
}

// buildCarousel — Pinnacle renders N slides; Geo renders 1 composite frame.
// Returns array of HTML strings (length 1 for Geo) to keep Cloudinary upload loop intact.
export function buildCarousel(spec = {}) {
  const themeCode = VALID_THEME_CODES.includes(spec.theme) ? spec.theme : 'T1';
  const t = THEMES[themeCode];

  // Use the first slide's content as the composite frame
  const firstSlide = (spec.slides && spec.slides[0]) || {};
  const vars = _toGeoVars(themeCode, {
    headline:       firstSlide.hook   || firstSlide.headline || spec.headline || '',
    body_text:      firstSlide.point  || firstSlide.body     || spec.body     || '',
    city:           spec.city         || 'Green Bay',
    post_type_label: spec.post_type   || 'General Contractor',
    bg_image_url:   spec.bg_image_url || '',
    show_price:     !!(spec.price_low),
    price_low:      spec.price_low    || '',
    price_high:     spec.price_high   || '',
    headline_size:  spec.headline_size|| 72,
  });

  return [t(vars)]; // single-frame array — Cloudinary uploads index [0] as cover
}
