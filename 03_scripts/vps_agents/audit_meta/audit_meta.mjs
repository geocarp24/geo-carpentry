/**
 * audit_meta.mjs  (Agent: Ava → audit_meta)
 * Meta / Facebook Page audit agent — checks page health, posts, scheduled content.
 *
 * REFACTORED 2026-05-28: FB_PAGE_ID no longer hardcoded.
 * Reads from TenantConfig vault, falls back to env var FB_PAGE_ID.
 *
 * Deploy to: /opt/agents/audit_meta/audit_meta.mjs
 * Env:       TENANT_SLUG (default: geo-carpentry), WEBHOOK_SECRET, INVESTOROS_API_URL
 */

import { loadTenantConfig } from '../_shared/tenant_loader.mjs';

const tenantSlug = process.env.TENANT_SLUG || 'geo-carpentry';

async function run() {
  console.log(`[audit_meta] Starting audit for tenant: ${tenantSlug}`);

  // --- Load tenant config ---
  const config = await loadTenantConfig(tenantSlug);

  const fbPageId =
    config.social?.facebookPageId ??
    process.env.FB_PAGE_ID ?? // backwards compat
    null;

  if (!fbPageId) {
    throw new Error(
      `[audit_meta] No Facebook Page ID configured for tenant "${tenantSlug}". ` +
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
    throw new Error(`[audit_meta] No Meta token configured for tenant "${tenantSlug}"`);
  }

  const airtableToken = config.airtable.token;
  const airtableBaseId = config.airtable.baseId;

  console.log(`[audit_meta] Auditing FB Page: ${fbPageId}`);

  const results = { tenantSlug, fbPageId, auditedAt: new Date().toISOString() };

  // --- 1. Page basic info ---
  const pageRes = await fetch(
    `https://graph.facebook.com/v19.0/${fbPageId}` +
    `?fields=name,category,fan_count,verification_status,website,phone,hours,rating_count` +
    `&access_token=${metaToken}`
  );

  if (pageRes.ok) {
    results.page = await pageRes.json();
    console.log(`[audit_meta] Page: ${results.page.name} — ${results.page.fan_count} fans`);
  } else {
    console.warn('[audit_meta] Could not fetch page info');
  }

  // --- 2. Recent posts (last 10) ---
  const postsRes = await fetch(
    `https://graph.facebook.com/v19.0/${fbPageId}/posts` +
    `?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares` +
    `&limit=10&access_token=${metaToken}`
  );

  if (postsRes.ok) {
    const postsData = await postsRes.json();
    results.recentPosts = postsData.data?.length || 0;

    if (postsData.data?.length) {
      const lastPost = postsData.data[0];
      const lastPostDate = new Date(lastPost.created_time);
      const daysSince = Math.floor((Date.now() - lastPostDate.getTime()) / 86400000);
      results.daysSinceLastPost = daysSince;
      console.log(`[audit_meta] Last post: ${daysSince} days ago`);

      if (daysSince > 7) {
        results.alerts = results.alerts || [];
        results.alerts.push(`No posts in ${daysSince} days — content gap!`);
      }
    } else {
      results.alerts = results.alerts || [];
      results.alerts.push('No posts found — page may be inactive');
    }
  }

  // --- 3. Scheduled / unpublished posts ---
  const scheduledRes = await fetch(
    `https://graph.facebook.com/v19.0/${fbPageId}/scheduled_posts` +
    `?fields=id,message,scheduled_publish_time&access_token=${metaToken}`
  );

  if (scheduledRes.ok) {
    const scheduledData = await scheduledRes.json();
    results.scheduledPosts = scheduledData.data?.length || 0;
    console.log(`[audit_meta] Scheduled posts: ${results.scheduledPosts}`);
  }

  // --- 4. Write audit record to Airtable ---
  const record = {
    fields: {
      Tenant: tenantSlug,
      AuditDate: new Date().toISOString().split('T')[0],
      PageId: fbPageId,
      PageName: results.page?.name || '',
      FanCount: results.page?.fan_count || 0,
      DaysSinceLastPost: results.daysSinceLastPost || 0,
      ScheduledPostsCount: results.scheduledPosts || 0,
      Alerts: (results.alerts || []).join('; '),
      RawJson: JSON.stringify(results),
      AgentRun: 'audit_meta',
    },
  };

  const atRes = await fetch(
    `https://api.airtable.com/v0/${airtableBaseId}/Meta_Audits`,
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
    console.error('[audit_meta] Airtable write failed:', await atRes.text());
  } else {
    console.log('[audit_meta] Audit record written to Airtable');
  }

  // --- 5. Log alerts ---
  if (results.alerts?.length) {
    console.warn('[audit_meta] ALERTS:', results.alerts);
  } else {
    console.log('[audit_meta] No alerts — page looks healthy');
  }

  console.log('[audit_meta] Done');
}

run().catch((err) => {
  console.error('[audit_meta] Fatal error:', err.message);
  process.exit(1);
});
