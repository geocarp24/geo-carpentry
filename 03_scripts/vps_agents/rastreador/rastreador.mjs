/**
 * rastreador.mjs  (Agent: Scout → rastreador)
 * Lead tracker — monitors Airtable Geo_Leads for new leads and status changes.
 *
 * REFACTORED 2026-05-28: AIRTABLE_TOKEN no longer hardcoded.
 * Reads from TenantConfig vault, falls back to env vars.
 *
 * Deploy to: /opt/agents/rastreador/rastreador.mjs
 * Env:       TENANT_SLUG (default: geo-carpentry), WEBHOOK_SECRET, INVESTOROS_API_URL
 */

import { loadTenantConfig } from '../_shared/tenant_loader.mjs';

const tenantSlug = process.env.TENANT_SLUG || 'geo-carpentry';

// Airtable table IDs — per-tenant (Geo Carpentry defaults)
const LEADS_TABLE_ID = process.env.LEADS_TABLE_ID || 'tblGeo_Leads'; // Update with real ID
const CONTENT_QUEUE_TABLE_ID = process.env.CONTENT_QUEUE_TABLE_ID || 'tblpiN42pK3YFxGEW';

async function run() {
  console.log(`[rastreador] Starting for tenant: ${tenantSlug}`);

  // --- Load tenant config ---
  const config = await loadTenantConfig(tenantSlug);

  const airtableToken = config.airtable.token;
  const airtableBaseId = config.airtable.baseId;

  console.log(`[rastreador] Using base: ${airtableBaseId}`);

  // --- Fetch recent leads (last 24h, sorted by created) ---
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const filterFormula = encodeURIComponent(
    `IS_AFTER({Created}, '${yesterday}')`
  );

  const leadsRes = await fetch(
    `https://api.airtable.com/v0/${airtableBaseId}/${LEADS_TABLE_ID}` +
    `?filterByFormula=${filterFormula}&sort[0][field]=Created&sort[0][direction]=desc`,
    {
      headers: { Authorization: `Bearer ${airtableToken}` },
    }
  );

  if (!leadsRes.ok) {
    const err = await leadsRes.text();
    throw new Error(`[rastreador] Airtable leads fetch failed: ${err}`);
  }

  const { records: newLeads } = await leadsRes.json();
  console.log(`[rastreador] New leads in last 24h: ${newLeads.length}`);

  if (!newLeads.length) {
    console.log('[rastreador] No new leads — nothing to do');
    return;
  }

  // --- Classify leads by source and status ---
  const summary = {
    total: newLeads.length,
    bySource: {},
    byStatus: {},
    uncontacted: [],
  };

  for (const lead of newLeads) {
    const f = lead.fields;
    const source = f.Source || 'unknown';
    const status = f.Status || 'new';
    const phone = f.Phone || f.PhoneNumber || '';

    summary.bySource[source] = (summary.bySource[source] || 0) + 1;
    summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;

    if (status === 'new' && phone) {
      summary.uncontacted.push({
        id: lead.id,
        name: f.Name || f.ContactName || 'Unknown',
        phone,
        source,
        createdAt: f.Created || lead.createdTime,
      });
    }
  }

  console.log('[rastreador] Summary:', JSON.stringify(summary, null, 2));

  // --- Alert if uncontacted leads older than 1h ---
  const staleThreshold = Date.now() - 3600000; // 1 hour
  const staleLeads = summary.uncontacted.filter((l) => {
    const created = new Date(l.createdAt).getTime();
    return created < staleThreshold;
  });

  if (staleLeads.length) {
    console.warn(`[rastreador] ALERT: ${staleLeads.length} uncontacted lead(s) older than 1 hour:`);
    for (const l of staleLeads) {
      console.warn(`  - ${l.name} (${l.phone}) from ${l.source} @ ${l.createdAt}`);
    }

    // --- Write alert to Content_Queue so Fer agent can follow up ---
    const alertRecords = staleLeads.map((l) => ({
      fields: {
        Tenant: tenantSlug,
        Type: 'lead_followup_alert',
        Status: 'pending',
        LeadId: l.id,
        LeadName: l.name,
        LeadPhone: l.phone,
        Source: l.source,
        Notes: `Uncontacted lead older than 1h. Created: ${l.createdAt}`,
        Priority: 'high',
        AgentSource: 'rastreador',
        CreatedAt: new Date().toISOString(),
      },
    }));

    const queueRes = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/${CONTENT_QUEUE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: alertRecords }),
      }
    );

    if (!queueRes.ok) {
      console.error('[rastreador] Failed to write alerts to Content_Queue');
    } else {
      console.log(`[rastreador] Wrote ${alertRecords.length} follow-up alert(s) to Content_Queue`);
    }
  } else {
    console.log('[rastreador] All new leads contacted within 1h — good response time!');
  }

  console.log('[rastreador] Done');
}

run().catch((err) => {
  console.error('[rastreador] Fatal error:', err.message);
  process.exit(1);
});
