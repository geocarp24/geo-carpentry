#!/usr/bin/env node
/**
 * Marco (Social Media Manager) — Facebook & Instagram Publisher
 * Reads Social_Queue from Airtable and posts to Facebook Page + Instagram
 * via Meta Graph API using credentials from the Supabase vault.
 *
 * Usage:
 *   node agents/marco/marco.mjs --tenant geo-carpentry --mode post_scheduled --max 1
 *
 * Env vars (/opt/alex-bot/.env):
 *   AIRTABLE_TOKEN_GEO    — Airtable PAT
 *   WEBHOOK_SECRET        — shared secret for vault API call
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID
 *
 * CC requirements before deploy:
 *   1. Seedea facebook credentials in vault (page_access_token + app_secret)
 *   2. Add facebook object to /api/internal/tenant-config response
 *   3. Create Social_Queue table in Airtable (schema below)
 *   4. Update SOCIAL_QUEUE_TABLE const with real table ID
 *
 * Airtable Social_Queue schema:
 *   title          (text)      — post title / internal label
 *   caption        (long text) — the actual post text (bilingual ok)
 *   image_url      (url)       — optional image for Instagram/photo posts
 *   platforms      (select)    — "facebook" | "instagram" | "both"
 *   status         (select)    — "draft" | "ready_to_post" | "posted" | "partial" | "failed"
 *   tenant_id      (text)      — "geo-carpentry"
 *   scheduled_for  (date)      — optional scheduling date
 *   fb_post_id     (text)      — filled after posting
 *   ig_post_id     (text)      — filled after posting
 *   posted_at      (date)      — ISO timestamp
 *   last_error     (text)      — error message if failed
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── CLI args ──────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : fallback;
};

const TENANT_SLUG = getArg('tenant', 'geo-carpentry');
const MODE        = getArg('mode',   'post_scheduled');
const MAX_POSTS   = parseInt(getArg('max', '1'), 10);

// ── Env vars ──────────────────────────────────────────────────────────────────
const AIRTABLE_TOKEN     = process.env.AIRTABLE_TOKEN_GEO;
const WEBHOOK_SECRET     = process.env.WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

if (!AIRTABLE_TOKEN) throw new Error('Missing env var: AIRTABLE_TOKEN_GEO');
if (!WEBHOOK_SECRET) throw new Error('Missing env var: WEBHOOK_SECRET');

// ── Airtable config ───────────────────────────────────────────────────────────
const AIRTABLE_BASE      = 'appAQpveuAec077jF';
const SOCIAL_QUEUE_TABLE = 'tbl1kMgM6jP7K8kpt'; // Social_Queue table (created 2026-06-01)
const AT_BASE_URL        = `https://api.airtable.com/v0/${AIRTABLE_BASE}`;

// ── Fetch Facebook credentials from vault ─────────────────────────────────────
// Vault structure expected in tenant-config response:
// { facebook: { pageAccessToken, pageId, igBusinessId, appId } }
async function fetchFBCredentials(tenantSlug) {
  const url = `https://www.investoros.tech/api/internal/tenant-config?tenant=${encodeURIComponent(tenantSlug)}`;
  const res = await fetch(url, {
    headers: { 'x-internal-secret': WEBHOOK_SECRET },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`tenant-config API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!data?.facebook?.pageAccessToken) {
    throw new Error(
      `Facebook credentials missing in vault for tenant: ${tenantSlug}. ` +
      `Ensure facebook/page_access_token is seeded.`
    );
  }
  return data.facebook; // { pageAccessToken, pageId, igBusinessId, appId }
}

// ── Airtable helpers ──────────────────────────────────────────────────────────
async function fetchSocialQueue(tenantSlug, max) {
  const formula = encodeURIComponent(
    `AND({status}="ready_to_post",{tenant_id}="${tenantSlug}")`
  );
  const url = (
    `${AT_BASE_URL}/${SOCIAL_QUEUE_TABLE}` +
    `?filterByFormula=${formula}` +
    `&maxRecords=${max}` +
    `&sort[0][field]=scheduled_for&sort[0][direction]=asc`
  );
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Airtable fetch failed ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.records || [];
}

async function updateAirtableRow(recordId, fields) {
  const res = await fetch(`${AT_BASE_URL}/${SOCIAL_QUEUE_TABLE}/${recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Airtable update failed ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ── Facebook Page post — SCHEDULED (not immediate publish) ───────────────────
// Posts appear in Meta Business Suite → Content → Scheduled
// so Jorge and clients can SEE and approve before going live.
// FB API requires: scheduled_publish_time = Unix timestamp, min 10min future, max 75 days.
async function postToFacebook(pageId, pageToken, { caption, imageUrl, scheduledFor }) {
  // Calculate schedule time: use provided date or default to tomorrow 2pm CT (UTC-5)
  let scheduleTs;
  if (scheduledFor) {
    scheduleTs = Math.floor(new Date(scheduledFor).getTime() / 1000);
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(19, 0, 0, 0); // 2pm CT = 19:00 UTC
    scheduleTs = Math.floor(tomorrow.getTime() / 1000);
  }

  // Ensure at least 10 minutes in the future (FB requirement)
  const minTs = Math.floor(Date.now() / 1000) + 600;
  if (scheduleTs < minTs) scheduleTs = minTs + 60;

  let endpoint, body;

  if (imageUrl) {
    endpoint = `https://graph.facebook.com/v25.0/${pageId}/photos`;
    body = {
      caption,
      url:                    imageUrl,
      published:              false,
      scheduled_publish_time: scheduleTs,
      access_token:           pageToken,
    };
  } else {
    endpoint = `https://graph.facebook.com/v25.0/${pageId}/feed`;
    body = {
      message:                caption,
      published:              false,
      scheduled_publish_time: scheduleTs,
      access_token:           pageToken,
    };
  }

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `FB API error ${res.status}: ${data.error?.message || JSON.stringify(data).slice(0, 200)}`
    );
  }
  // Returns post ID — post is now SCHEDULED and visible in Meta Business Suite
  return data.id;
}

// ── Instagram post (requires image) ──────────────────────────────────────────
// Instagram Graph API does NOT support text-only posts — image required.
// If no imageUrl, Marco skips Instagram and logs a warning.
async function postToInstagram(igBusinessId, pageToken, { caption, imageUrl }) {
  if (!imageUrl) {
    console.log('[Marco] Instagram skipped — image required for IG posts (none provided)');
    return null;
  }

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v25.0/${igBusinessId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url:  imageUrl,
        caption:    caption,
        access_token: pageToken,
      }),
    }
  );
  const container = await containerRes.json();
  if (!containerRes.ok) {
    throw new Error(
      `IG container error: ${container.error?.message || JSON.stringify(container).slice(0, 200)}`
    );
  }

  // Brief pause before publishing (Meta recommendation)
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v25.0/${igBusinessId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id:  container.id,
        access_token: pageToken,
      }),
    }
  );
  const published = await publishRes.json();
  if (!publishRes.ok) {
    throw new Error(
      `IG publish error: ${published.error?.message || JSON.stringify(published).slice(0, 200)}`
    );
  }
  return published.id;
}

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[Marco] Telegram not configured — skipping notification.');
    return;
  }
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    TELEGRAM_CHAT_ID,
          text:       message,
          parse_mode: 'HTML',
        }),
      }
    );
  } catch (e) {
    console.warn('[Marco] Telegram send failed:', e.message);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[Marco] Starting — tenant: ${TENANT_SLUG}, mode: ${MODE}, max: ${MAX_POSTS}`);

  if (MODE !== 'post_scheduled') {
    console.log(`[Marco] Mode "${MODE}" not implemented. Exiting.`);
    return;
  }

  // 1. Load Facebook credentials from vault
  let fbCreds;
  try {
    fbCreds = await fetchFBCredentials(TENANT_SLUG);
    console.log(`[Marco] Credentials loaded — Page: ${fbCreds.pageId} · IG: ${fbCreds.igBusinessId}`);
  } catch (e) {
    const msg = `❌ <b>Marco no puede arrancar</b> — vault error:\n<code>${e.message}</code>`;
    console.error('[Marco] Vault error:', e.message);
    await sendTelegram(msg);
    process.exit(1);
  }

  // 2. Fetch posts from Social_Queue
  let rows;
  try {
    rows = await fetchSocialQueue(TENANT_SLUG, MAX_POSTS);
    console.log(`[Marco] Found ${rows.length} post(s) with status="ready_to_post"`);
  } catch (e) {
    const msg = `❌ <b>Marco — Airtable error</b>: <code>${e.message}</code>`;
    console.error('[Marco] Airtable error:', e.message);
    await sendTelegram(msg);
    process.exit(1);
  }

  // 3. Nothing to post
  if (rows.length === 0) {
    console.log('[Marco] No posts ready. Exiting cleanly.');
    await sendTelegram(
      `ℹ️ <b>Marco</b>: No hay posts listos para <b>${TENANT_SLUG}</b>.`
    );
    return;
  }

  // 4. Post each row
  for (const row of rows) {
    const { id: recordId, fields: f } = row;
    const caption   = f.caption   || '';
    const imageUrl  = f.image_url || null;
    const platforms = f.platforms || 'both';
    const postTitle = f.title     || recordId;

    console.log(`[Marco] Processing: "${postTitle}" → ${platforms}`);

    let fbPostId = null;
    let igPostId = null;
    const errors = [];

    // Facebook
    if (platforms === 'facebook' || platforms === 'both') {
      try {
        fbPostId = await postToFacebook(
          fbCreds.pageId,
          fbCreds.pageAccessToken,
          { caption, imageUrl }
        );
        console.log(`[Marco] ✅ Facebook posted: ${fbPostId}`);
      } catch (e) {
        console.error(`[Marco] ❌ Facebook failed: ${e.message}`);
        errors.push(`FB: ${e.message.slice(0, 120)}`);
      }
    }

    // Instagram (requires image)
    if ((platforms === 'instagram' || platforms === 'both') && fbCreds.igBusinessId) {
      try {
        igPostId = await postToInstagram(
          fbCreds.igBusinessId,
          fbCreds.pageAccessToken,
          { caption, imageUrl }
        );
        if (igPostId) console.log(`[Marco] ✅ Instagram posted: ${igPostId}`);
      } catch (e) {
        console.error(`[Marco] ❌ Instagram failed: ${e.message}`);
        errors.push(`IG: ${e.message.slice(0, 120)}`);
      }
    }

    // Determine final status
    const anySuccess = fbPostId || igPostId;
    const status = errors.length === 0 ? 'posted'
                 : anySuccess            ? 'partial'
                 : 'failed';

    // Update Airtable
    try {
      await updateAirtableRow(recordId, {
        status,
        posted_at: new Date().toISOString(),
        ...(fbPostId ? { fb_post_id: String(fbPostId) } : {}),
        ...(igPostId ? { ig_post_id: String(igPostId) } : {}),
        ...(errors.length > 0 ? { last_error: errors.join(' | ').slice(0, 250) } : {}),
      });
    } catch (e) {
      console.error('[Marco] Airtable update failed:', e.message);
    }

    // Telegram notify
    if (status === 'posted') {
      await sendTelegram(
        `✅ <b>Marco publicó:</b> "${postTitle}"\n` +
        (fbPostId ? `📘 Facebook post ID: <code>${fbPostId}</code>\n` : '') +
        (igPostId ? `📸 Instagram post ID: <code>${igPostId}</code>` : '📸 Instagram: sin imagen, solo FB')
      );
    } else if (status === 'partial') {
      await sendTelegram(
        `⚠️ <b>Marco — publicación parcial:</b> "${postTitle}"\n` +
        `Errores: <code>${errors.join(' | ')}</code>`
      );
    } else {
      await sendTelegram(
        `❌ <b>Marco falló:</b> "${postTitle}"\n` +
        `<code>${errors.join(' | ')}</code>`
      );
    }
  }

  console.log('[Marco] Done.');
}

main().catch(async (err) => {
  console.error('[Marco] Fatal unhandled error:', err.message);
  await sendTelegram(`❌ <b>Marco — error fatal</b>: <code>${err.message.slice(0, 300)}</code>`);
  process.exit(1);
});
