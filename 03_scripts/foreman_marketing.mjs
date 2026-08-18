#!/usr/bin/env node
/**
 * Foreman Marketing — Geo Carpentry
 * Reads Marketing_Audits (Echo/Mercader output) with status="Pending",
 * maps each issue to a trigger action or escalation.
 * Closes the loop: Echo audits → Foreman Marketing acts.
 *
 * Usage:
 *   node agents/foreman_marketing/foreman_marketing.mjs --tenant geo-carpentry
 *
 * Cron: 30 min after Echo deep audit
 *   30 13 * * 1 (Mon 13:30 UTC — after Echo deep Mon 13:00)
 *
 * Env vars: AIRTABLE_TOKEN_GEO, WEBHOOK_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── CLI args ──────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const getArg    = (n, d = null) => { const i = args.indexOf(`--${n}`); return i !== -1 ? args[i+1] : d; };
const TENANT_SLUG = getArg('tenant', 'geo-carpentry');

// ── Env vars ──────────────────────────────────────────────────────────────────
const AIRTABLE_TOKEN     = process.env.AIRTABLE_TOKEN_GEO;
const WEBHOOK_SECRET     = process.env.WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

if (!AIRTABLE_TOKEN) throw new Error('Missing env var: AIRTABLE_TOKEN_GEO');
if (!WEBHOOK_SECRET) throw new Error('Missing env var: WEBHOOK_SECRET');

// ── Airtable ──────────────────────────────────────────────────────────────────
const AT_BASE   = 'appAQpveuAec077jF';
const MKT_TBL   = 'tbld7LtJzeN5QTHPo'; // Marketing_Audits
const AT_URL    = `https://api.airtable.com/v0/${AT_BASE}`;

async function fetchPendingAudits(tenant) {
  // Audits Done by Echo but not yet acted-on by Foreman. Status enum stays Echo's
  // (Queued/Running/Done/Failed) — foreman_processed is the action gate.
  const formula = encodeURIComponent(`AND({status}="Done",NOT({foreman_processed}=TRUE()),{tenant_id}="${tenant}")`);
  const res = await fetch(`${AT_URL}/${MKT_TBL}?filterByFormula=${formula}&maxRecords=5&sort[0][field]=started_at&sort[0][direction]=desc`, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable Marketing_Audits fetch ${res.status}`);
  return (await res.json()).records || [];
}

async function markAuditProcessed(recordId, actionsLog) {
  // Foreman writes to foreman_actions (its own field); Echo's recommendations stay intact.
  await fetch(`${AT_URL}/${MKT_TBL}/${recordId}`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ fields: { foreman_processed: true, foreman_actions: actionsLog } }),
  });
}

// ── Trigger VPS agent via webhook ─────────────────────────────────────────────
async function triggerAgent(agentName, tenantSlug, mode) {
  try {
    const res = await fetch('http://187.77.215.146:3003/trigger', {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({ agent: agentName, tenant: tenantSlug, mode }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok ? { triggered: true, agent: agentName } : { triggered: false, status: res.status };
  } catch (e) {
    return { triggered: false, error: e.message };
  }
}

// ── Playbooks ─────────────────────────────────────────────────────────────────
const PLAYBOOKS = [
  {
    id:    'gbp_stale',
    match: /gbp.*stale|google.*business.*no.*post|gbp.*post.*[7-9]\s*days|gbp.*post.*[1-9][0-9]\s*days/i,
    auto:  true,
    action: async () => {
      // Trigger Nova to post an update (only if quota approved)
      const result = await triggerAgent('nova', TENANT_SLUG, 'post_update');
      return result.triggered
        ? { status: 'auto-triggered', agent: 'nova', mode: 'post_update' }
        : { status: 'nova-offline', note: 'GBP quota pending (Case 5-5881000041235)' };
    },
    escalate: (result) => !result.triggered,
    escalateMsg: () => `📍 <b>Marketing: GBP post stale</b>\nNova trigger failed (quota pending).\nManual: post an update to Google Business Profile.`,
  },

  {
    id:    'fb_no_posts',
    match: /facebook.*no.*post|fb.*post.*[7-9]\s*days|fb.*silent|fb.*inactive/i,
    auto:  true,
    action: async () => {
      // Trigger Marco to publish from Social queue
      const result = await triggerAgent('marco', TENANT_SLUG, 'post_scheduled');
      return result.triggered
        ? { status: 'auto-triggered', agent: 'marco', mode: 'post_scheduled' }
        : { status: 'marco-offline', note: 'Check SM pipeline' };
    },
    escalate: (result) => !result.triggered,
    escalateMsg: () => `📘 <b>Marketing: Facebook Page inactive</b>\nMarco triggered to post. If Geo_Posts is empty, SM pipeline needs content.`,
  },

  {
    id:    'low_engagement',
    match: /engagement.*drop|reach.*declin|likes.*declin|comments.*zero/i,
    auto:  false,
    action: async () => ({ status: 'escalated', note: 'Content strategy review needed' }),
    escalate: () => true,
    escalateMsg: (issue) => `📉 <b>Marketing: Low engagement</b>\n${issue.slice(0,150)}\nConsider: vary post types, increase video content (Leo), test posting times.`,
  },

  {
    id:    'bounce_rate_spike',
    match: /bounce.*rate.*spi|bounce.*[6-9][0-9]%|high.*bounce/i,
    auto:  false,
    action: async () => ({ status: 'escalated' }),
    escalate: () => true,
    escalateMsg: (issue) => `↩️ <b>Marketing: Bounce rate spike</b>\n${issue.slice(0,150)}\nCheck: landing page load speed, CTA visibility, mobile layout on /quote.`,
  },

  {
    id:    'review_needed',
    match: /review.*needed|no.*review.*request|review.*pending/i,
    auto:  false,
    action: async () => ({ status: 'escalated', note: 'Review request should be sent after job completion' }),
    escalate: () => true,
    escalateMsg: () => `⭐ <b>Marketing: Reviews need attention</b>\nTip: Ask Jorge to send review request after each completed job. Google reviews = local SEO boost.`,
  },

  {
    id:    'ad_spend_inefficient',
    match: /roas.*low|cpa.*high|ad.*spend.*ineffi|conversion.*drop/i,
    auto:  false,
    action: async () => ({ status: 'escalated' }),
    escalate: () => true,
    escalateMsg: (issue) => `💸 <b>Marketing: Ad spend issue</b>\n${issue.slice(0,150)}\nReview Google/Meta ads targeting. Chase (Paid Ads Auditor) can deep-dive when activated.`,
  },

  {
    id:    'ig_stale',
    match: /instagram.*no.*post|ig.*silent|instagram.*inactive/i,
    auto:  true,
    action: async () => {
      const result = await triggerAgent('marco', TENANT_SLUG, 'post_scheduled');
      return result;
    },
    escalate: (result) => !result?.triggered,
    escalateMsg: () => `📸 <b>Marketing: Instagram inactive</b>\nMarco triggered. Note: IG posts require images (Sofia pipeline needed).`,
  },
];

// ── Parse issues ──────────────────────────────────────────────────────────────
function parseIssues(rawField) {
  if (!rawField) return [];
  try {
    const parsed = JSON.parse(rawField);
    return Array.isArray(parsed) ? parsed : Object.values(parsed).flat();
  } catch {
    return rawField.split('\n').map(l => l.trim()).filter(Boolean);
  }
}

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' }),
    });
  } catch {}
}

async function logDecision(title, rationale, next = 'None') {
  try {
    await fetch(`${AT_URL}/tbluHpgWlVNqSveVi`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fields: {
        fldRrlLK0kn2nMtzY: title,
        fldEtqmwx08pzmF9z: new Date().toISOString().slice(0,10),
        fldyjqKUjL85q4aBP: 'Foreman Marketing',
        fldciAJKPaogOJHmp: rationale,
        fldTYFMEkhki98YWE: next,
        flduR1qKRMCzIoH5h: 'Active',
        fldk50aHuSdFIA38x: 'Content',
      }}),
    });
  } catch {}
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[Foreman Marketing] Starting — tenant: ${TENANT_SLUG}`);

  const audits = await fetchPendingAudits(TENANT_SLUG);
  if (audits.length === 0) {
    console.log('[Foreman Marketing] No pending marketing audits. Done.');
    return;
  }

  console.log(`[Foreman Marketing] Processing ${audits.length} audit(s)`);

  for (const audit of audits) {
    const { id: recId, fields: f } = audit;
    const issues = parseIssues(f.top_issues);
    const score  = f.score       || 0;
    const delta  = f.score_delta || 0;

    console.log(`[Foreman Marketing] Audit ${f.run_id} — score: ${score} (delta: ${delta}), issues: ${issues.length}`);

    const actionsLog  = [];
    const escalations = [];

    for (const issue of issues) {
      let matched = false;
      for (const pb of PLAYBOOKS) {
        if (pb.match.test(issue)) {
          matched = true;
          const result  = await pb.action(issue).catch(e => ({ error: e.message }));
          actionsLog.push(`[${pb.id}] ${JSON.stringify(result).slice(0,100)}`);
          const shouldEscalate = typeof pb.escalate === 'function' ? pb.escalate(result) : pb.escalate;
          if (shouldEscalate) {
            const msg = pb.escalateMsg(issue);
            if (msg) escalations.push(msg);
          }
          break;
        }
      }
      if (!matched) {
        actionsLog.push(`[unmatched] ${issue.slice(0, 100)}`);
        escalations.push(`⚠️ <b>Marketing issue sin playbook:</b> <code>${issue.slice(0, 150)}</code>`);
      }
    }

    if (escalations.length > 0) {
      const header = `📊 <b>Foreman Marketing — ${TENANT_SLUG}</b>\n` +
        `Score: ${score}/100 (${delta >= 0 ? '+' : ''}${delta} vs last run)\n` +
        `Issues: ${issues.length}\n\n`;
      await sendTelegram(header + escalations.slice(0, 5).join('\n\n'));
    }

    await markAuditProcessed(recId, actionsLog.join('\n'));
    await logDecision(
      `Foreman Marketing processed audit ${f.run_id}`,
      `Score ${score} (delta ${delta}). ${issues.length} issues. ${escalations.length} escalated.`,
      escalations.length > 0 ? 'Jorge: review Telegram alerts' : 'None'
    );
  }

  console.log('[Foreman Marketing] Done.');
}

main().catch(async (err) => {
  console.error('[Foreman Marketing] Fatal:', err.message);
  await sendTelegram(`❌ <b>Foreman Marketing fatal</b>: <code>${err.message.slice(0,300)}</code>`);
  process.exit(1);
});
