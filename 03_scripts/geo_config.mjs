/**
 * geo_config.mjs — Geo Carpentry tenant configuration hub
 * Single source of truth for all Geo-specific overrides.
 * Imported by adapted Pinnacle agents when tenant === "geo-carpentry".
 *
 * Deploy to: /opt/alex-bot/agents/tenants/geo_config.mjs
 */

export const GEO_CONFIG = {
  tenant:     'geo-carpentry',
  tenantName: 'Geo Carpentry LLC',

  // ── Airtable tables ────────────────────────────────────────────────────────
  // Filled by CC after Phase 1 creates the 3 SM tables
  tables: {
    posts:   process.env.AIRTABLE_SM_POSTS_TABLE_ID_GEO   || 'tblBbSbpzzANl74y0',
    reels:   process.env.AIRTABLE_SM_REELS_TABLE_ID_GEO   || 'tblF6RDSTysUtb7bf',
    videos:  process.env.AIRTABLE_SM_VIDEOS_TABLE_ID_GEO  || 'tblbmEQluqQU1Yft0',
    base:    'appAQpveuAec077jF',
  },

  // ── Agent file paths (VPS absolute) ───────────────────────────────────────
  paths: {
    persona:  '/opt/alex-bot/agents/tenants/geo-carpentry_persona.md',
    lessons:  '/opt/alex-bot/agents/oraculo_inputs/geo_lessons.md',
    themes:   '/opt/alex-bot/agents/creativo_runner/themes_geo.mjs',
  },

  // ── Social media ───────────────────────────────────────────────────────────
  social: {
    facebook: {
      pageId:      '723873447473999',
      igBusinessId: '17841475418377793',
      appId:       '3291485027720361',
      // pageAccessToken loaded from vault at runtime via tenant-config API
    },
  },

  // ── Safety / warmup (new FB Page — no API post history) ───────────────────
  // Meta can flag pages that suddenly post aggressively from the API
  warmup: {
    week1: { maxPerDay: 1 },
    week2: { maxPerDay: 2 },
    week3: { maxPerDay: 3 },
    week4: { maxPerDay: 3 },
    week5plus: { maxPerDay: 4 },
    startDate: '2026-06-01', // first post date via API
  },

  // ── Oráculo / content rules ────────────────────────────────────────────────
  contentRules: [
    'NO numeric time claims ("in 24 hours", "by next week") — compliance',
    'NO mixing EN+ES in same record — bilingual = 2 separate records linked by Source_Idea_ID',
    'Reels max 5 slides × 3s = 15s — no negotiable',
    'License number + insurance carrier NEVER in public posts',
    'Always include phone (920) 367-1272 or geocarpentry.com in CTAs',
    'City name + WI in every local post (Green Bay WI, not just Green Bay)',
  ],

  // ── Post type → theme mapping ──────────────────────────────────────────────
  themeMap: {
    project_showcase: 'T1',
    pro_tip:          'T2',
    before_after:     'T2',
    faq:              'T4',
    cta:              'T1',
    seasonal:         'T4',
    trust_signal:     'T5',
    luxury:           'T3',
  },

  // ── Services ───────────────────────────────────────────────────────────────
  services: {
    kitchen:      { en: 'Kitchen Remodeling',   es: 'Remodelación de Cocina',   low: '$5K',  high: '$30K' },
    bathroom:     { en: 'Bathroom Remodeling',  es: 'Remodelación de Baño',     low: '$3K',  high: '$15K' },
    deck:         { en: 'Deck Building',        es: 'Construcción de Deck',     low: '$2K',  high: '$12K' },
    carpentry:    { en: 'Finish Carpentry',      es: 'Carpintería de Acabados',  low: '$500', high: '$8K'  },
    renovation:   { en: 'Home Renovation',      es: 'Renovación de Hogar',      low: '$5K',  high: '$50K' },
    construction: { en: 'General Construction', es: 'Construcción General',     low: '$3K',  high: '$100K'},
  },

  // ── Service area cities ────────────────────────────────────────────────────
  cities: ['Green Bay', 'Appleton', 'Oshkosh', 'De Pere', 'Howard', 'Allouez', 'Bellevue'],

  // ── Cron schedule (UTC) ───────────────────────────────────────────────────
  crons: {
    ideator:    '0 20 * * 0',       // Sun 20:00 — generate 10 ideas/week
    oraculo_r1: '45 20 * * *',      // Daily 20:45
    reescritor: '0 21 * * *',       // Daily 21:00
    oraculo_r2: '15 21 * * *',      // Daily 21:15
    creativo:   '30 21 * * *',      // Daily 21:30 — Sofia
    director:   '0 22 * * *',       // Daily 22:00 — Leo
    publisher:  '0 10 * * 2,5',     // Tue+Fri 10:00 — Marco publishes
    atlas:      '*/30 * * * *',     // Every 30min — Remediator
  },
};

export default GEO_CONFIG;
