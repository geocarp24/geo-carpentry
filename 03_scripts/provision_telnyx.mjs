/**
 * provision_telnyx.mjs
 * InvestorOS — Provisiona número Telnyx dedicado para un tenant
 * Owner: Cowork (CW)
 *
 * Usage:
 *   node provision_telnyx.mjs --tenant geo-carpentry --areaCode 920 --business "Geo Carpentry LLC"
 *
 * Or imported as module (CC wrappea en /api/provision/telnyx):
 *   import { provisionTelnyxNumber } from './provision_telnyx.mjs';
 *   const result = await provisionTelnyxNumber({ tenantSlug, areaCode, businessName });
 */

import https from 'https';
import { parseArgs } from 'util';

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_MESSAGING_PROFILE_ID = process.env.TELNYX_MESSAGING_PROFILE_ID;
const TELNYX_CONNECTION_ID = process.env.TELNYX_CONNECTION_ID;

// ─── Telnyx API helper ────────────────────────────────────────────────────────

function telnyxRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telnyx.com',
      port: 443,
      path: `/v2${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Telnyx API error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Telnyx response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Step 1: Buscar número disponible por area code ──────────────────────────

async function searchAvailableNumber(areaCode) {
  console.log(`🔍 Searching available numbers for area code ${areaCode}...`);
  const response = await telnyxRequest(
    'GET',
    `/available_phone_numbers?filter[national_destination_code]=${areaCode}&filter[features][]=sms&filter[features][]=voice&filter[limit]=5`
  );
  const numbers = response.data || [];
  if (numbers.length === 0) {
    // Fallback: buscar en area codes cercanos
    console.log(`⚠️  No numbers found for ${areaCode}, searching nearby...`);
    const fallback = await telnyxRequest(
      'GET',
      `/available_phone_numbers?filter[country_code]=US&filter[features][]=sms&filter[limit]=1`
    );
    const fallbackNumbers = fallback.data || [];
    if (fallbackNumbers.length === 0) throw new Error('No available numbers found');
    return fallbackNumbers[0].phone_number;
  }
  return numbers[0].phone_number;
}

// ─── Step 2: Comprar el número ────────────────────────────────────────────────

async function purchaseNumber(phoneNumber) {
  console.log(`💳 Purchasing number ${phoneNumber}...`);
  const response = await telnyxRequest('POST', '/phone_numbers', {
    phone_number: phoneNumber,
    connection_id: TELNYX_CONNECTION_ID,
    messaging_profile_id: TELNYX_MESSAGING_PROFILE_ID,
  });
  return response.data;
}

// ─── Step 3: Configurar 10DLC (asociar a campaign existente) ─────────────────

async function assignToCampaign(phoneNumberId, campaignId) {
  if (!campaignId) {
    console.log('ℹ️  No campaign ID provided — skipping 10DLC assignment (add manually in Telnyx portal)');
    return null;
  }
  console.log(`📋 Assigning to 10DLC campaign ${campaignId}...`);
  // Telnyx 10DLC assignment via messaging profile
  const response = await telnyxRequest('PATCH', `/phone_numbers/${phoneNumberId}`, {
    messaging_profile_id: TELNYX_MESSAGING_PROFILE_ID,
  });
  return response.data;
}

// ─── Step 4: Etiquetar el número con el tenant ────────────────────────────────

async function tagNumber(phoneNumberId, tenantSlug, businessName) {
  console.log(`🏷️  Tagging number for tenant ${tenantSlug}...`);
  await telnyxRequest('PATCH', `/phone_numbers/${phoneNumberId}`, {
    tags: [`tenant:${tenantSlug}`, `investoros`],
    customer_reference: tenantSlug,
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Provisiona un número Telnyx dedicado para un tenant.
 * @param {Object} params
 * @param {string} params.tenantSlug   - e.g. "geo-carpentry"
 * @param {string} params.areaCode     - e.g. "920"
 * @param {string} params.businessName - e.g. "Geo Carpentry LLC"
 * @param {string} [params.campaignId] - Telnyx 10DLC campaign ID (optional, add later if not ready)
 * @returns {{ success: boolean, data: Object, error?: string }}
 */
export async function provisionTelnyxNumber({ tenantSlug, areaCode, businessName, campaignId = null }) {
  if (!TELNYX_API_KEY) throw new Error('TELNYX_API_KEY env var not set');

  try {
    console.log(`\n🚀 Provisioning Telnyx number for tenant: ${tenantSlug}`);

    const phoneNumber = await searchAvailableNumber(areaCode);
    const purchased = await purchaseNumber(phoneNumber);
    const phoneNumberId = purchased.id;

    await tagNumber(phoneNumberId, tenantSlug, businessName);
    await assignToCampaign(phoneNumberId, campaignId);

    const result = {
      phoneNumber,
      phoneNumberId,            // internal field name
      telnyxNumberId: phoneNumberId, // alias expected by CC /api/provision/telnyx route
      campaignId: campaignId || null, // null if 10DLC not yet registered
      tenantSlug,
      provisionedAt: new Date().toISOString(),
      messagingProfileId: TELNYX_MESSAGING_PROFILE_ID,
      status: 'active',
    };

    console.log(`\n✅ SUCCESS — Number provisioned:`);
    console.log(`   Phone:    ${phoneNumber}`);
    console.log(`   ID:       ${phoneNumberId}`);
    console.log(`   Tenant:   ${tenantSlug}`);
    console.log(`\n⚠️  NEXT STEPS:`);
    console.log(`   1. Save to Supabase credential vault:`);
    console.log(`      service="telnyx", keyName="phone_number", value="${phoneNumber}"`);
    console.log(`   2. Save phoneNumberId for future management:`);
    console.log(`      service="telnyx", keyName="phone_number_id", value="${phoneNumberId}"`);
    if (!campaignId) {
      console.log(`   3. Complete 10DLC registration in Telnyx portal`);
      console.log(`      → https://portal.telnyx.com/#/app/numbers/my-numbers`);
    }

    return { success: true, data: result };

  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    return { success: false, data: null, error: error.message };
  }
}

// ─── CLI mode ─────────────────────────────────────────────────────────────────

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { values } = parseArgs({
    options: {
      tenant:   { type: 'string' },
      areaCode: { type: 'string', default: '920' },
      business: { type: 'string', default: 'Business' },
      campaign: { type: 'string' },
      dryRun:   { type: 'boolean', default: false },
    }
  });

  if (!values.tenant) {
    console.error('Usage: node provision_telnyx.mjs --tenant <slug> --areaCode <code> --business "<name>"');
    process.exit(1);
  }

  if (values.dryRun) {
    console.log('🧪 DRY RUN — would provision:');
    console.log(JSON.stringify(values, null, 2));
    process.exit(0);
  }

  provisionTelnyxNumber({
    tenantSlug: values.tenant,
    areaCode: values.areaCode,
    businessName: values.business,
    campaignId: values.campaign,
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
