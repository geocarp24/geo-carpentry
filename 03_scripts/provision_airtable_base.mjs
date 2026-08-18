/**
 * provision_airtable_base.mjs
 * InvestorOS — Clona el base template de Airtable para un nuevo tenant
 * Owner: Cowork (CW)
 *
 * Usage:
 *   node provision_airtable_base.mjs --tenant acme-contracting --name "Acme Contracting LLC"
 *
 * Or as module:
 *   import { provisionAirtableBase } from './provision_airtable_base.mjs';
 *   const result = await provisionAirtableBase({ tenantSlug, businessName });
 */

import https from 'https';
import { parseArgs } from 'util';

const AIRTABLE_TOKEN = process.env.AIRTABLE_MASTER_TOKEN; // InvestorOS master PAT
const TEMPLATE_BASE_ID = process.env.AIRTABLE_TEMPLATE_BASE_ID || 'appAQpveuAec077jF'; // Geo Carpentry = template

// ─── Airtable API helper ──────────────────────────────────────────────────────

function airtableRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/meta${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr && { 'Content-Length': Buffer.byteLength(bodyStr) }),
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
            reject(new Error(`Airtable error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Step 1: Obtener workspace ID ────────────────────────────────────────────

async function getWorkspaceId() {
  console.log('📋 Fetching workspaces...');
  const response = await airtableRequest('GET', '/workspaces');
  const workspaces = response.workspaces || [];
  if (workspaces.length === 0) throw new Error('No workspaces found');
  // Usar el primer workspace (InvestorOS master workspace)
  const ws = workspaces[0];
  console.log(`   Using workspace: ${ws.name} (${ws.id})`);
  return ws.id;
}

// ─── Step 2: Obtener schema del template base ─────────────────────────────────

async function getTemplateSchema() {
  console.log(`📖 Reading template base schema (${TEMPLATE_BASE_ID})...`);
  const response = await airtableRequest('GET', `/bases/${TEMPLATE_BASE_ID}/tables`);
  return response.tables || [];
}

// ─── Step 3: Crear nuevo base vacío ──────────────────────────────────────────

async function createBase(workspaceId, baseName, tables) {
  console.log(`🏗️  Creating new base: ${baseName}...`);

  // Crear el base con las mismas tablas que el template
  // Airtable API solo permite crear bases con tablas básicas — el schema detallado se copia después
  const simpleTables = tables.map(t => ({
    name: t.name,
    description: t.description || '',
    fields: t.fields
      .filter(f => ['singleLineText', 'multilineText', 'number', 'singleSelect', 'multipleSelects', 'date', 'checkbox', 'url', 'email', 'phoneNumber'].includes(f.type))
      .slice(0, 10) // Airtable limita campos en creación
      .map(f => ({
        name: f.name,
        type: f.type,
        ...(f.options ? { options: f.options } : {}),
      }))
  }));

  const response = await airtableRequest('POST', '/bases', {
    name: baseName,
    workspaceId,
    tables: simpleTables.length > 0 ? simpleTables : [{ name: 'Leads', fields: [{ name: 'Name', type: 'singleLineText' }] }],
  });

  return response;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Provisiona un Airtable base para un nuevo tenant.
 * @param {Object} params
 * @param {string} params.tenantSlug   - e.g. "acme-contracting"
 * @param {string} params.businessName - e.g. "Acme Contracting LLC"
 * @returns {{ success: boolean, data: Object, error?: string }}
 */
export async function provisionAirtableBase({ tenantSlug, businessName }) {
  if (!AIRTABLE_TOKEN) throw new Error('AIRTABLE_MASTER_TOKEN env var not set');

  try {
    console.log(`\n🚀 Provisioning Airtable base for tenant: ${tenantSlug}`);

    const workspaceId = await getWorkspaceId();
    const templateTables = await getTemplateSchema();
    const baseName = `InvestorOS — ${businessName}`;
    const newBase = await createBase(workspaceId, baseName, templateTables);

    const result = {
      baseId: newBase.id,
      baseName,
      baseUrl: `https://airtable.com/${newBase.id}`,
      tenantSlug,
      tables: (newBase.tables || []).map(t => ({ id: t.id, name: t.name })),
      provisionedAt: new Date().toISOString(),
    };

    console.log(`\n✅ SUCCESS — Airtable base provisioned:`);
    console.log(`   Base ID:  ${result.baseId}`);
    console.log(`   Name:     ${result.baseName}`);
    console.log(`   URL:      ${result.baseUrl}`);
    console.log(`\n⚠️  NEXT STEPS:`);
    console.log(`   1. Save to Supabase credential vault:`);
    console.log(`      service="airtable", keyName="base_id", value="${result.baseId}"`);
    console.log(`   2. Update tenant config JSON:`);
    console.log(`      agents/tenants/${tenantSlug}.json → airtable.base_id: "${result.baseId}"`);
    console.log(`   3. Verify tables match template structure in Airtable UI`);

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
      tenant:  { type: 'string' },
      name:    { type: 'string' },
      dryRun:  { type: 'boolean', default: false },
    }
  });

  if (!values.tenant || !values.name) {
    console.error('Usage: node provision_airtable_base.mjs --tenant <slug> --name "<Business Name>"');
    process.exit(1);
  }

  if (values.dryRun) {
    console.log('🧪 DRY RUN — would provision:');
    console.log(JSON.stringify(values, null, 2));
    process.exit(0);
  }

  provisionAirtableBase({ tenantSlug: values.tenant, businessName: values.name })
    .then(result => process.exit(result.success ? 0 : 1));
}
