/**
 * geo-webhook-service.mjs
 * InvestorOS — Webhook server multi-tenant en VPS (puerto 3001)
 * Owner: Cowork (CW)
 * Deploy: /opt/geo-webhook/index.mjs en VPS 187.77.215.146
 *
 * Recibe: POST /trigger con HMAC-SHA256 auth
 * Body:   { tenant: "geo-carpentry", agent: "posicionador", mode: "full" }
 * Acción: Enruta al agente correcto según tenant_config y lo ejecuta
 *
 * Instalar en VPS:
 *   mkdir -p /opt/geo-webhook
 *   cp geo-webhook-service.mjs /opt/geo-webhook/index.mjs
 *   cp geo-webhook.service /etc/systemd/system/
 *   systemctl enable geo-webhook && systemctl start geo-webhook
 */

import http from 'http';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';

const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET; // Compartido con Vercel
const ALEX_BOT_PATH = process.env.ALEX_BOT_PATH || '/opt/alex-bot';
const LOG_FILE = process.env.LOG_FILE || '/var/log/geo-webhook.log';

// ─── Logging ──────────────────────────────────────────────────────────────────

import { appendFileSync } from 'fs';
function log(level, message, data = {}) {
  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...data,
  });
  console.log(entry);
  try { appendFileSync(LOG_FILE, entry + '\n'); } catch {}
}

// ─── HMAC verification ────────────────────────────────────────────────────────

function verifySignature(body, signature) {
  if (!WEBHOOK_SECRET) {
    log('warn', 'WEBHOOK_SECRET not set — skipping signature verification (development mode)');
    return true;
  }
  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ─── Tenant config loader ─────────────────────────────────────────────────────

async function loadTenantConfig(tenantSlug) {
  const configPath = join(ALEX_BOT_PATH, 'agents', 'tenants', `${tenantSlug}.json`);
  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    throw new Error(`Tenant config not found: ${tenantSlug}`);
  }
}

// ─── Agent map (English names → VPS script paths) ────────────────────────────
// Maps landing page agent names to actual VPS script paths

const AGENT_MAP = {
  // Production agents (12)
  'rex':    'agents/posicionador/posicionador.mjs',
  'echo':   'agents/mercader/mercader.mjs',
  'eli':    'agents/escriba/escriba.mjs',
  'kai':    'agents/clasificador/clasificador.mjs',
  'scout':  'agents/rastreador/rastreador.mjs',
  'atlas':  'agents/analista/analista.mjs',
  'sage':   'agents/analitico/analitico.mjs',
  'ava':    'agents/audit_meta/audit_meta.mjs',
  'orion':  'agents/supervisor/supervisor.mjs',
  'marco':  'agents/social_media/social_media.mjs',
  'sofia':  'agents/creativo_runner/creativo_runner.mjs',
  'leo':    'agents/director_v2/director_v2.mjs',
  // Mapped by old names for backwards compat
  'posicionador': 'agents/posicionador/posicionador.mjs',
  'mercader':     'agents/mercader/mercader.mjs',
  'escriba':      'agents/escriba/escriba.mjs',
  'clasificador': 'agents/clasificador/clasificador.mjs',
  'rastreador':   'agents/rastreador/rastreador.mjs',
};

// ─── Agent runner ─────────────────────────────────────────────────────────────

async function runAgent(tenant, agentName, mode) {
  const scriptRelPath = AGENT_MAP[agentName];
  if (!scriptRelPath) {
    throw new Error(`Unknown agent: ${agentName}. Available: ${Object.keys(AGENT_MAP).join(', ')}`);
  }

  const scriptPath = join(ALEX_BOT_PATH, scriptRelPath);
  const jobId = crypto.randomBytes(8).toString('hex');

  log('info', 'Agent triggered', { jobId, tenant, agent: agentName, mode, scriptPath });

  // Run async — don't await (webhook returns immediately, agent runs in background)
  const child = spawn('node', [scriptPath, '--tenant', tenant, '--mode', mode || 'full'], {
    cwd: ALEX_BOT_PATH,
    env: {
      ...process.env,
      TENANT_SLUG: tenant,
      NODE_ENV: 'production',
    },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', data => log('info', `[${agentName}] ${data.toString().trim()}`, { jobId }));
  child.stderr.on('data', data => log('error', `[${agentName}] ${data.toString().trim()}`, { jobId }));
  child.on('close', code => log('info', `Agent finished`, { jobId, agent: agentName, exitCode: code }));
  child.on('error', err => log('error', `Agent error`, { jobId, agent: agentName, error: err.message }));
  child.unref(); // Don't block server on agent process

  return jobId;
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const send = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    return send(200, { status: 'ok', uptime: process.uptime(), agents: Object.keys(AGENT_MAP) });
  }

  // Trigger endpoint
  if (req.method === 'POST' && req.url === '/trigger') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        // 1. Verify HMAC signature
        const signature = req.headers['x-webhook-signature'] || '';
        if (!verifySignature(body, signature)) {
          log('warn', 'Invalid webhook signature', { ip: req.socket.remoteAddress });
          return send(401, { error: 'Invalid signature' });
        }

        // 2. Parse body
        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          return send(400, { error: 'Invalid JSON body' });
        }

        const { tenant, agent, mode } = payload;
        if (!tenant || !agent) {
          return send(400, { error: 'Missing required fields: tenant, agent' });
        }

        // 3. Verify tenant exists
        try {
          await loadTenantConfig(tenant);
        } catch {
          log('warn', 'Unknown tenant', { tenant });
          return send(404, { error: `Tenant not found: ${tenant}` });
        }

        // 4. Run agent
        const jobId = await runAgent(tenant, agent, mode);

        log('info', 'Webhook processed', { tenant, agent, mode, jobId });
        return send(200, { queued: true, jobId, tenant, agent, mode });

      } catch (error) {
        log('error', 'Webhook handler error', { error: error.message });
        return send(500, { error: 'Internal server error' });
      }
    });
    return;
  }

  send(404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  log('info', `geo-webhook-service started`, { port: PORT, agentCount: Object.keys(AGENT_MAP).length });
  if (!WEBHOOK_SECRET) {
    log('warn', 'WEBHOOK_SECRET not set — running in development mode (no signature verification)');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'SIGTERM received — shutting down gracefully');
  server.close(() => {
    log('info', 'Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  log('error', 'Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
