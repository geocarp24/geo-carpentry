/**
 * safety_geo.mjs — Rate limit & warmup config for Geo Carpentry social posting
 * Merges into /opt/alex-bot/agents/social_media/safety.mjs
 * (Pass GEO_CONFIG.warmup to the existing rateLimit() function)
 *
 * Why warmup: Geo Carpentry FB Page (id: 723873447473999) has zero prior
 * API-driven posts. Meta flags new pages that suddenly post aggressively via API.
 * Gradual ramp avoids shadow-banning and reach penalties.
 */

import { GEO_CONFIG } from '../tenants/geo_config.mjs';

// ── Warmup schedule ────────────────────────────────────────────────────────────
const WARMUP_START = new Date(GEO_CONFIG.warmup.startDate);

export function getMaxPostsPerDay(tenantSlug) {
  if (tenantSlug !== 'geo-carpentry') return null; // use Pinnacle defaults

  const now  = new Date();
  const days = Math.floor((now - WARMUP_START) / (1000 * 60 * 60 * 24));
  const week = Math.floor(days / 7) + 1;

  if (week <= 1) return GEO_CONFIG.warmup.week1.maxPerDay;       // 1/day
  if (week <= 2) return GEO_CONFIG.warmup.week2.maxPerDay;       // 2/day
  if (week <= 4) return GEO_CONFIG.warmup.week3.maxPerDay;       // 3/day
  return GEO_CONFIG.warmup.week5plus.maxPerDay;                  // 4/day (full rate)
}

// ── Post type distribution per week ───────────────────────────────────────────
// Ensures varied content — Meta rewards content diversity
export const WEEKLY_DISTRIBUTION = [
  { type: 'project_showcase', weight: 3 }, // 3× per week
  { type: 'pro_tip',          weight: 2 }, // 2× per week
  { type: 'before_after',     weight: 1 },
  { type: 'faq',              weight: 1 },
  { type: 'cta',              weight: 1 },
  { type: 'seasonal',         weight: 1 },
  { type: 'trust_signal',     weight: 1 },
];

// ── Language distribution ──────────────────────────────────────────────────────
// 70% EN / 30% ES — NE Wisconsin is predominantly English-speaking
// but Geo has bilingual team and Latino homeowner segment
export const LANG_DISTRIBUTION = { en: 0.70, es: 0.30 };

// ── Optimal posting times (CT = UTC-5) ────────────────────────────────────────
// Based on contractor audience (homeowners checking FB after work/weekend)
export const BEST_POST_TIMES_CT = [
  { day: 'tue', hour: 12 },  // Tuesday noon — peak FB engagement for local business
  { day: 'fri', hour: 10 },  // Friday 10am — weekend project planning mindset
];
