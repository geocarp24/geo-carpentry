#!/usr/bin/env node
/**
 * Foreman SEO — Geo Carpentry
 * Reads SEO_Audits (Rex/Posicionador output) with status="Pending",
 * maps each issue to an auto-executable action or escalation.
 * Closes the loop: Rex audits → Foreman SEO acts.
 *
 * Usage:
 *   node agents/foreman_seo/foreman_seo.mjs --tenant geo-carpentry
 *
 * Cron: 30 min after Rex deep audit
 *   30 12 * * 1 (Mon 12:30 UTC — after Rex deep Mon 12:00)
 *   30 * * * * (hourly quick after Rex quick)
 *
 * Env vars: AIRTABLE_TOKEN_GEO, WEBHOOK_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 * Optional: WP_USERNAME_GEO, WP_APP_PASSWORD_GEO (for auto WP fixes)
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
const WP_USER            = process.env.WP_USERNAME_GEO;
const WP_PASS            = process.env.WP_APP_PASSWORD_GEO;
const WP_URL             = 'https://geocarpentry.com';

if (!AIRTABLE_TOKEN) throw new Error('Missing env var: AIRTABLE_TOKEN_GEO');

// ── Airtable ──────────────────────────────────────────────────────────────────
const AT_BASE  = 'appAQpveuAec077jF';
const SEO_TBL  = 'tbl53FPGfpa4OtafX'; // SEO_Audits
const AT_URL   = `https://api.airtable.com/v0/${AT_BASE}`;

async function fetchPendingAudits(tenant) {
  // Audits Done by Rex but not yet acted-on by Foreman. Status enum stays Rex's
  // (Queued/Running/Done/Failed) — foreman_processed is the action gate.
  const formula = encodeURIComponent(`AND({status}="Done",NOT({foreman_processed}=TRUE()),{tenant_id}="${tenant}")`);
  const res = await fetch(`${AT_URL}/${SEO_TBL}?filterByFormula=${formula}&maxRecords=5&sort[0][field]=started_at&sort[0][direction]=desc`, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable SEO_Audits fetch ${res.status}`);
  return (await res.json()).records || [];
}

async function markAuditProcessed(recordId, actionsLog) {
  // Foreman writes to foreman_actions (its own field); Rex's recommendations stay intact.
  await fetch(`${AT_URL}/${SEO_TBL}/${recordId}`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ fields: { foreman_processed: true, foreman_actions: actionsLog } }),
  });
}

// ── WP REST API helpers ───────────────────────────────────────────────────────
function wpAuth() {
  if (!WP_USER || !WP_PASS) return null;
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');
}

async function wpGetPosts(perPage = 10) {
  const auth = wpAuth();
  if (!auth) return [];
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?per_page=${perPage}&status=publish`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) return [];
  return res.json();
}

// ── Playbooks — issue keyword → action ───────────────────────────────────────
const PLAYBOOKS = [
  {
    id:    'missing_alt_text',
    match: /missing alt text|alt.*empty|images.*no alt/i,
    auto:  true,
    action: async (issue) => {
      // Query WP for posts with images missing alt text
      // Auto-fix: set generic alt text via WP REST API
      const auth = wpAuth();
      if (!auth) return { status: 'skipped', reason: 'No WP credentials' };
      // This requires WP media endpoint — flag for now
      return {
        status:  'flagged',
        action:  'WP Admin → Media → Filter images with empty alt text → add keyword-rich alt text',
        impact:  'Medium — accessibility + image SEO',
      };
    },
    escalate: true,
    escalateMsg: () => `🖼️ <b>SEO: Missing alt text</b> on images\nFix: WP Admin → Media → add alt text to untagged images.\nImpact: accessibility + image search rankings.`,
  },

  {
    id:    'slow_page_load',
    match: /slow.*load|page.*speed|cwv.*fail|lcp.*[3-9]\.|cls.*0\.[1-9]/i,
    auto:  false,
    action: async (issue) => ({
      status: 'escalated',
      reason: 'Page speed issues require hosting/theme changes — manual review',
    }),
    escalate: true,
    escalateMsg: (issue) => `🐌 <b>SEO: Slow page load detected</b>\n${issue.slice(0, 150)}\nOptions: enable Hostinger caching, optimize images, reduce plugins.`,
  },

  {
    id:    'missing_schema',
    match: /missing schema|no schema|schema.*not found|json.ld.*missing/i,
    auto:  false,
    action: async () => ({
      status: 'escalated',
      reason: 'Schema injection requires SureRank or code change',
    }),
    escalate: true,
    escalateMsg: (issue) => `📋 <b>SEO: Missing Schema markup</b>\n${issue.slice(0, 150)}\nFix: SureRank → Schema → add LocalBusiness + Service schema per page.`,
  },

  {
    id:    'low_local_score',
    match: /local.*score.*[0-4][0-9]|local seo.*weak|gbp.*not.*optimized/i,
    auto:  false,
    action: async () => ({
      status: 'escalated',
      reason: 'GBP optimization — Nova handles this when quota approved',
    }),
    escalate: true,
    escalateMsg: (issue) => `📍 <b>SEO: Low local score</b>\n${issue.slice(0, 150)}\nNova (GBP Manager) will handle once Google quota approved (Case: 5-5881000041235).`,
  },

  {
    id:    'missing_meta',
    match: /missing meta|no meta description|meta.*empty|title.*too long|title.*too short/i,
    auto:  false,
    action: async () => ({ status: 'escalated' }),
    escalate: true,
    escalateMsg: (issue) => `📝 <b>SEO: Meta description issues</b>\n${issue.slice(0, 150)}\nFix: SureRank → each post → add/trim meta description to 150-160 chars.`,
  },

  {
    id:    'broken_links',
    match: /broken link|404|dead link|link.*not found/i,
    auto:  false,
    action: async () => ({ status: 'escalated' }),
    escalate: true,
    escalateMsg: (issue) => `🔗 <b>SEO: Broken links detected</b>\n${issue.slice(0, 150)}\nFix: WP Admin → Plugins → Broken Link Checker (or use Screaming Frog).`,
  },

  {
    id:    'score_drop',
    match: /score.*drop|score.*declin|delta.*-[5-9]|delta.*-[1-9][0-9]/i,
    auto:  false,
    action: async () => ({ status: 'escalated' }),
    escalate: true,
    escalateMsg: (issue) => `📉 <b>SEO: Score dropped significantly</b>\n${issue.slice(0, 150)}\nReview recent WP changes, check Google Search Console for manual actions.`,
  },
];

// ── Parse top_issues field (JSON string or newline-separated) ─────────────────
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

// ── Log to Decisions_Log ──────────────────────────────────────────────────────
async function logDecision(title, rationale, next = 'None') {
  try {
    await fetch(`${AT_URL}/tbluHpgWlVNqSveVi`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fields: {
        fldRrlLK0kn2nMtzY: title,
        fldEtqmwx08pzmF9z: new Date().toISOString().slice(0,10),
        fldyjqKUjL85q4aBP: 'Foreman SEO',
        fldciAJKPaogOJHmp: rationale,
        fldTYFMEkhki98YWE: next,
        flduR1qKRMCzIoH5h: 'Active',
        fldk50aHuSdFIA38x: 'SEO',
      }}),
    });
  } catch {}
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[Foreman SEO] Starting — tenant: ${TENANT_SLUG}`);

  const audits = await fetchPendingAudits(TENANT_SLUG);
  if (audits.length === 0) {
    console.log('[Foreman SEO] No pending SEO audits. Done.');
    return;
  }

  console.log(`[Foreman SEO] Processing ${audits.length} audit(s)`);

  for (const audit of audits) {
    const { id: recId, fields: f } = audit;
    const issues = parseIssues(f.top_issues);
    const score  = f.overall_score || 0;
    const delta  = f.score_delta   || 0;

    console.log(`[Foreman SEO] Audit ${f.run_id} — score: ${score} (delta: ${delta}), issues: ${issues.length}`);

    const actionsLog = [];
    const escalations = [];

    for (const issue of issues) {
      let matched = false;
      for (const pb of PLAYBOOKS) {
        if (pb.match.test(issue)) {
          matched = true;
          const result = await pb.action(issue).catch(e => ({ error: e.message }));
          actionsLog.push(`[${pb.id}] ${JSON.stringify(result)}`);
          if (pb.escalate) {
            const msg = pb.escalateMsg(issue);
            if (msg) escalations.push(msg);
          }
          break;
        }
      }
      if (!matched) {
        actionsLog.push(`[unmatched] ${issue.slice(0, 100)}`);
        escalations.push(`⚠️ <b>SEO issue sin playbook:</b> <code>${issue.slice(0, 150)}</code>`);
      }
    }

    // Escalate to Telegram
    if (escalations.length > 0) {
      const header = `🔍 <b>Foreman SEO — ${TENANT_SLUG}</b>\n` +
        `Score: ${score}/100 (${delta >= 0 ? '+' : ''}${delta} vs last run)\n` +
        `Issues detectadas: ${issues.length}\n\n`;
      await sendTelegram(header + escalations.slice(0, 5).join('\n\n'));
    }

    // Mark audit as processed
    await markAuditProcessed(recId, actionsLog.join('\n'));

    await logDecision(
      `Foreman SEO processed audit ${f.run_id}`,
      `Score ${score} (delta ${delta}). ${issues.length} issues processed. ${escalations.length} escalated.`,
      escalations.length > 0 ? 'Jorge: review Telegram alerts' : 'None'
    );
  }

  console.log('[Foreman SEO] Done.');
}

main().catch(async (err) => {
  console.error('[Foreman SEO] Fatal:', err.message);
  await sendTelegram(`❌ <b>Foreman SEO fatal</b>: <code>${err.message.slice(0,300)}</code>`);
  process.exit(1);
});
