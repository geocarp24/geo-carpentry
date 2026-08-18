/**
 * tenant_loader.mjs
 * Shared loader for all InvestorOS VPS agents.
 *
 * Reads TenantConfig from the InvestorOS credential vault (Vercel API),
 * with a full fallback chain to environment variables for backwards compat.
 *
 * Deploy to: /opt/agents/_shared/tenant_loader.mjs
 *
 * Usage:
 *   import { loadTenantConfig } from '../_shared/tenant_loader.mjs';
 *   const config = await loadTenantConfig(process.env.TENANT_SLUG || 'geo-carpentry');
 */

import { createHmac } from 'crypto';

const VAULT_BASE_URL = process.env.INVESTOROS_API_URL || 'https://www.investoros.tech';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Fetches TenantConfig from the InvestorOS credential vault.
 * Falls back to environment variables if vault is unavailable.
 *
 * @param {string} tenantSlug - e.g. 'geo-carpentry', 'pinnacle'
 * @returns {Promise<TenantConfig>}
 */
export async function loadTenantConfig(tenantSlug) {
  if (!tenantSlug) throw new Error('tenantSlug is required');

  // --- Try vault first ---
  try {
    const config = await fetchFromVault(tenantSlug);
    if (config) {
      console.log(`[tenant_loader] Loaded config for "${tenantSlug}" from vault`);
      return config;
    }
  } catch (err) {
    console.warn(`[tenant_loader] Vault unavailable, falling back to env vars. Reason: ${err.message}`);
  }

  // --- Fallback: build config from environment variables ---
  console.log(`[tenant_loader] Using env var fallback for "${tenantSlug}"`);
  return buildConfigFromEnv(tenantSlug);
}

/**
 * Fetch TenantConfig from the InvestorOS internal API.
 * Uses HMAC-SHA256 to authenticate (same secret as webhook triggers).
 */
async function fetchFromVault(tenantSlug) {
  if (!WEBHOOK_SECRET) {
    throw new Error('WEBHOOK_SECRET not set — cannot authenticate vault request');
  }

  const timestamp = Date.now().toString();
  const payload = `${timestamp}.${tenantSlug}`;
  const signature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const res = await fetch(
    `${VAULT_BASE_URL}/api/internal/tenant-config/${tenantSlug}`,
    {
      method: 'GET',
      headers: {
        'x-timestamp': timestamp,
        'x-signature': signature,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5s timeout — don't block agents
    }
  );

  if (res.status === 404) return null; // tenant doesn't exist yet
  if (!res.ok) throw new Error(`Vault returned ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return data.config; // { slug, name, airtable, telnyx?, social?, ... }
}

/**
 * Builds a TenantConfig-compatible object from environment variables.
 * This is the backwards-compat path for Geo Carpentry (Tenant 0).
 *
 * Env vars used:
 *   AIRTABLE_TOKEN_GEO, AIRTABLE_BASE_GEO  (or AIRTABLE_API_KEY, AIRTABLE_BASE_ID)
 *   TELNYX_PHONE_NUMBER
 *   FB_PAGE_ID, IG_ACCOUNT_ID, BUFFER_TOKEN, META_USER_TOKEN, META_PAGE_ACCESS_TOKEN
 *   WP_URL, WP_BRIDGE_TOKEN
 *   SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT
 *   GBP_PLACE_ID, GBP_MANAGER_EMAIL
 */
function buildConfigFromEnv(tenantSlug) {
  const airtableToken =
    process.env.AIRTABLE_TOKEN_GEO ||
    process.env.AIRTABLE_API_KEY ||
    process.env.AIRTABLE_PAT;

  const airtableBaseId =
    process.env.AIRTABLE_BASE_GEO ||
    process.env.AIRTABLE_BASE_ID ||
    'appAQpveuAec077jF'; // Geo Carpentry default

  if (!airtableToken) {
    throw new Error(
      `[tenant_loader] No Airtable token found for "${tenantSlug}". ` +
      'Set AIRTABLE_TOKEN_GEO or AIRTABLE_API_KEY env var.'
    );
  }

  const config = {
    slug: tenantSlug,
    name: tenantSlug === 'geo-carpentry' ? 'Geo Carpentry LLC' : tenantSlug,
    airtable: {
      token: airtableToken,
      baseId: airtableBaseId,
    },
  };

  // Telnyx (optional)
  if (process.env.TELNYX_PHONE_NUMBER) {
    config.telnyx = {
      phoneNumber: process.env.TELNYX_PHONE_NUMBER,
      apiKey: process.env.TELNYX_API_KEY || '',
    };
  }

  // Social (optional)
  const hasSocial = process.env.FB_PAGE_ID ||
    process.env.IG_ACCOUNT_ID ||
    process.env.BUFFER_TOKEN ||
    process.env.META_USER_TOKEN;

  if (hasSocial) {
    config.social = {
      facebookPageId: process.env.FB_PAGE_ID || undefined,
      instagramAccountId: process.env.IG_ACCOUNT_ID || undefined,
      bufferToken: process.env.BUFFER_TOKEN || undefined,
      metaUserToken: process.env.META_USER_TOKEN || undefined,
      metaPageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || undefined,
    };
  }

  // WordPress (optional)
  if (process.env.WP_URL) {
    config.wordpress = {
      url: process.env.WP_URL,
      bridgeToken: process.env.WP_BRIDGE_TOKEN || undefined,
      wpcliPath: process.env.WPCLI_PATH || '/usr/local/bin/wp',
    };
  }

  // Email (optional)
  if (process.env.SMTP_HOST) {
    config.email = {
      smtpHost: process.env.SMTP_HOST,
      smtpUser: process.env.SMTP_USER || '',
      smtpPassword: process.env.SMTP_PASSWORD || '',
      smtpPort: parseInt(process.env.SMTP_PORT || '465', 10),
    };
  }

  // Google Business Profile (optional)
  if (process.env.GBP_PLACE_ID) {
    config.gbp = {
      placeId: process.env.GBP_PLACE_ID,
      managerEmail: process.env.GBP_MANAGER_EMAIL || '',
    };
  }

  return config;
}
