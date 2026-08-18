/**
 * analitico.mjs  (Agent: Atlas → analitico)
 * Social media analytics agent — reads Facebook Page insights.
 *
 * REFACTORED 2026-05-28: FB_PAGE_ID no longer hardcoded.
 * Reads from TenantConfig vault, falls back to env var FB_PAGE_ID.
 *
 * Deploy to: /opt/agents/analitico/analitico.mjs
 * Env:       TENANT_SLUG (default: geo-carpentry), WEBHOOK_SECRET, INVESTOROS_API_URL
 */

import { loadTenantConfig } from '../_shared/tenant_loader.mjs';

const tenantSlug = process.env.TENANT_SLUG || 'geo-carpentry';

async function run() {
  console.log(`[analitico] Starting for tenant: ${tenantSlug}`);

  // --- Load tenant config (vault-first, env var fallback) ---
  const config = await loadTenantConfig(tenantSlug);

  const fbPageId =
    config.social?.facebookPageId ??
    process.env.FB_PAGE_ID ?? // backwards compat
    null;

  if (!fbPageId) {
    throw new Error(
      `[analitico] No Facebook Page ID configured for tenant "${tenantSlug}". ` +
      'Set social.facebookPageId in vault or FB_PAGE_ID env var.'
    );
  }

  const metaToken =
    config.social?.metaPageAccessToken ??
    config.social?.metaUserToken ??
    process.env.META_PAGE_ACCESS_TOKEN ??
    process.env.META_USER_TOKEN ??
    null;

  if (!metaToken) {
    throw new Error(`[analitico] No Meta token configured for tenant "${tenantSlug}"`);
  }

  const airtableToken = config.airtable.token;
  const airtableBaseId = config.airtable.baseId;

  console.log(`[analitico] Using FB Page: ${fbPageId}`);

  // --- Fetch Page insights from Meta Graph API ---
  const since = Math.floor(Date.now() / 1000) - 86400 * 7; // last 7 days
  const until = Math.floor(Date.now() / 1000);

  const metrics = [
    'page_impressions',
    'page_reach',
    'page_engaged_users',
    'page_fan_adds',
    'page_post_engagements',
  ].join(',');

  const insightsUrl =
    `https://graph.facebook.com/v19.0/${fbPageId}/insights` +
    `?metric=${metrics}&since=${since}&until=${until}&period=day` +
    `&access_token=${metaToken}`;

  const res = await fetch(insightsUrl);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(`[analitico] Meta API error: ${err.error?.message}`);
  }

  const { data: insightsData } = await res.json();

  // --- Parse and aggregate ---
  const summary = {};
  for (const metric of insightsData) {
    const total = metric.values.reduce((sum, v) => sum + (v.value || 0), 0);
    summary[metric.name] = total;
  }

  console.log('[analitico] Insights summary:', summary);

  // --- Write to Airtable ---
  const record = {
    fields: {
      Tenant: tenantSlug,
      Date: new Date().toISOString().split('T')[0],
      Impressions: summary.page_impressions || 0,
      Reach: summary.page_reach || 0,
      EngagedUsers: summary.page_engaged_users || 0,
      NewFans: summary.page_fan_adds || 0,
      PostEngagements: summary.page_post_engagements || 0,
      AgentRun: 'analitico',
    },
  };

  const atRes = await fetch(
    `https://api.airtable.com/v0/${airtableBaseId}/Social_Insights`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [record] }),
    }
  );

  if (!atRes.ok) {
    const atErr = await atRes.json().catch(() => ({}));
    console.error('[analitico] Airtable write failed:', atErr);
    // Non-fatal: log and continue
  } else {
    console.log('[analitico] Insights written to Airtable');
  }

  console.log('[analitico] Done');
}

run().catch((err) => {
  console.error('[analitico] Fatal error:', err.message);
  process.exit(1);
});
