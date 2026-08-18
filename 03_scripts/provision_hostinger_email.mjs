/**
 * provision_hostinger_email.mjs
 * InvestorOS — Crea buzón de email en Hostinger para un tenant
 * Owner: Cowork (CW)
 *
 * Hostinger no tiene API pública para crear emails — usamos su hPanel API (beta)
 * o como fallback, SSH + WHM/cPanel API si está disponible.
 *
 * Usage:
 *   node provision_hostinger_email.mjs --tenant acme-contracting --domain acmecontracting.com --prefix admin
 *
 * Or as module:
 *   import { provisionHostingerEmail } from './provision_hostinger_email.mjs';
 *   const result = await provisionHostingerEmail({ tenantSlug, domain, emailPrefix });
 */

import https from 'https';
import { parseArgs } from 'util';
import { randomBytes } from 'crypto';

// Hostinger hPanel API (Business Hosting)
const HOSTINGER_API_TOKEN = process.env.HOSTINGER_API_TOKEN;
const HOSTINGER_ACCOUNT_ID = process.env.HOSTINGER_ACCOUNT_ID; // Account ID from hPanel

// ─── Password generator ───────────────────────────────────────────────────────

function generateSecurePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from(randomBytes(16))
    .map(b => chars[b % chars.length])
    .join('');
}

// ─── Hostinger API helper ─────────────────────────────────────────────────────

function hostingerRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.hostinger.com',
      port: 443,
      path: `/v1${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${HOSTINGER_API_TOKEN}`,
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
            reject(new Error(`Hostinger API error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch {
          reject(new Error(`Unexpected response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Step 1: Encontrar hosting plan para el dominio ───────────────────────────

async function findHostingPlan(domain) {
  console.log(`🔍 Looking up hosting plan for domain ${domain}...`);
  // NOTE: Si Hostinger API no soporta lookup por dominio,
  // usamos el HOSTINGER_ACCOUNT_ID directamente
  if (HOSTINGER_ACCOUNT_ID) {
    return { id: HOSTINGER_ACCOUNT_ID, domain };
  }
  // Intento via API
  const response = await hostingerRequest('GET', '/hosting');
  const plans = response.data || [];
  const plan = plans.find(p => p.domain === domain || p.domains?.includes(domain));
  if (!plan) throw new Error(`No hosting plan found for domain ${domain}. Add domain to Hostinger first.`);
  return plan;
}

// ─── Step 2: Crear el email ───────────────────────────────────────────────────

async function createEmailAccount(planId, emailAddress, password) {
  console.log(`📧 Creating email account ${emailAddress}...`);
  const response = await hostingerRequest('POST', `/hosting/${planId}/emails`, {
    email: emailAddress,
    password,
    quota: 1024, // 1GB mailbox
  });
  return response.data || response;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Provisiona un email business en Hostinger para un tenant.
 * @param {Object} params
 * @param {string} params.tenantSlug   - e.g. "acme-contracting"
 * @param {string} params.domain       - e.g. "acmecontracting.com"
 * @param {string} [params.emailPrefix] - default "admin"
 * @returns {{ success: boolean, data: Object, error?: string }}
 */
export async function provisionHostingerEmail({ tenantSlug, domain, emailPrefix = 'admin' }) {
  if (!HOSTINGER_API_TOKEN) {
    // Fallback: instrucciones manuales
    return {
      success: false,
      data: null,
      error: 'HOSTINGER_API_TOKEN not set. Manual setup required (see MANUAL_STEPS below).',
      manualSteps: [
        `1. Login to hPanel at https://hpanel.hostinger.com`,
        `2. Go to Emails → Email Accounts → Create`,
        `3. Email: ${emailPrefix}@${domain}`,
        `4. Password: <generate strong password>`,
        `5. Quota: 1GB`,
        `6. Save credentials to Supabase vault for tenant ${tenantSlug}`,
      ]
    };
  }

  try {
    console.log(`\n🚀 Provisioning email for tenant: ${tenantSlug}`);

    const emailAddress = `${emailPrefix}@${domain}`;
    const password = generateSecurePassword();

    const plan = await findHostingPlan(domain);
    await createEmailAccount(plan.id, emailAddress, password);

    const result = {
      email: emailAddress,
      password, // ⚠️ Entregar a CC para guardar en vault — nunca loggear en producción
      domain,
      tenantSlug,
      smtpHost: 'smtp.hostinger.com',
      smtpPort: 465,
      smtpSecurity: 'SSL',
      imapHost: 'imap.hostinger.com',
      imapPort: 993,
      provisionedAt: new Date().toISOString(),
    };

    console.log(`\n✅ SUCCESS — Email provisioned:`);
    console.log(`   Email:    ${result.email}`);
    console.log(`   SMTP:     ${result.smtpHost}:${result.smtpPort} (SSL)`);
    console.log(`   Tenant:   ${tenantSlug}`);
    console.log(`\n⚠️  SECURITY — Save password to vault IMMEDIATELY, then clear this log:`);
    console.log(`   service="hostinger_email", keyName="password", value="[REDACTED]"`);
    console.log(`\n⚠️  NEXT STEPS:`);
    console.log(`   1. Save ALL credentials to Supabase vault under tenant ${tenantSlug}`);
    console.log(`   2. Configure agente Ember/Remitente to use this SMTP for outbound emails`);
    console.log(`   3. Set up SPF/DKIM records (Hostinger provides these in hPanel → DNS)`);

    return { success: true, data: result };

  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    console.log('\n📋 Manual fallback steps:');
    console.log(`   1. Create ${emailPrefix}@${domain} manually in hPanel`);
    console.log(`   2. Save credentials to Supabase vault for tenant ${tenantSlug}`);
    return { success: false, data: null, error: error.message };
  }
}

// ─── CLI mode ─────────────────────────────────────────────────────────────────

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { values } = parseArgs({
    options: {
      tenant: { type: 'string' },
      domain: { type: 'string' },
      prefix: { type: 'string', default: 'admin' },
      dryRun: { type: 'boolean', default: false },
    }
  });

  if (!values.tenant || !values.domain) {
    console.error('Usage: node provision_hostinger_email.mjs --tenant <slug> --domain <domain.com> [--prefix admin]');
    process.exit(1);
  }

  if (values.dryRun) {
    console.log('🧪 DRY RUN — would provision:');
    console.log(`   Email: ${values.prefix}@${values.domain}`);
    console.log(`   Tenant: ${values.tenant}`);
    process.exit(0);
  }

  provisionHostingerEmail({ tenantSlug: values.tenant, domain: values.domain, emailPrefix: values.prefix })
    .then(result => process.exit(result.success ? 0 : 1));
}
