# HANDOFF — Atlas Loop 2: LLM-Propose Playbooks + Telegram Approval
> Cowork → Claude Code | 2026-06-08 | Estimate: 8–12h | Depends on: #1 #2 #3 #4

## Overview
When Atlas hits `no_playbook` on an issue, instead of only logging to Decisions_Log it:
1. Calls Sonnet 4.6 with the issue + past similar issues + tenant config
2. Gets back a deterministic JS playbook proposal
3. Saves it to `Atlas_Patches` table (status=`pending_approval`)
4. Notifies Jorge via Telegram: "New playbook proposed — /yes patch_id to approve"
5. Jorge replies `/yes <patch_id>` → Atlas reads approval → activates playbook

---

## Step 1 — Create Airtable Table: Atlas_Patches

**Base:** `appAQpveuAec077jF`

Create table `Atlas_Patches` with these fields:
| Field | Type | Notes |
|---|---|---|
| patch_id | singleLineText | Primary. Format: `patch_YYYYMMDD_XXXX` |
| tenant_id | singleLineText | |
| issue_signature | singleLineText | Same dedup key as Decisions_Log |
| issue_text | multilineText | The full issue string from Atlas |
| proposed_playbook_js | multilineText | Raw JS code block proposed by LLM |
| proposed_match_regex | singleLineText | The regex pattern string |
| status | singleSelect | `pending_approval` / `approved` / `rejected` / `active` / `failed` |
| llm_rationale | multilineText | Why the LLM proposed this playbook |
| proposed_at | dateTime | |
| reviewed_at | dateTime | |
| reviewed_by | singleLineText | "Jorge" or "auto" |
| activation_result | multilineText | Result when first run after approval |
| telegram_message_id | singleLineText | For follow-up reply matching |

---

## Step 2 — Atlas no_playbook handler changes

**File:** `/opt/alex-bot/agents/atlas/atlas.mjs`

```javascript
// In the no_playbook branch, AFTER the existing Decisions_Log write + dedup check:

import Anthropic from '@anthropic-ai/sdk';

async function proposePlaybook(issue, tenant_id, pastIssues) {
  const client = new Anthropic(); // uses ANTHROPIC_API_KEY from env
  
  const systemPrompt = `You are Atlas, an autonomous agent that proposes deterministic playbooks
for fixing recurring issues in a contractor marketing system.

A playbook is a JS object with this exact shape:
{
  id: 'snake_case_id',
  match: /regex_pattern/i,
  escalate: true|false,
  action: async () => { /* deterministic fix — no LLM calls inside */ return result; },
  escalateMsg: (res) => res.someCondition ? 'message' : null,
}

Rules:
- action() must be deterministic (fetch, curl, file write — NOT another LLM call)
- If the fix requires human action, set escalate: true and escalateMsg to a clear instruction
- Return ONLY valid JavaScript (no markdown fences, no explanation)
- The action must be safe to run automatically in production`;

  const userPrompt = `Issue: "${issue}"
Tenant: ${tenant_id}
Past similar issues: ${JSON.stringify(pastIssues.slice(0, 5), null, 2)}

Propose a playbook object for this issue. Return only the JS object literal.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });
  
  return response.content[0].text.trim();
}

// In no_playbook handler:
async function handleNoPlaybook(issue, tenant_id, signature) {
  // 1. Fetch past similar issues from Decisions_Log for context
  const pastIssues = await airtable(DECISIONS_LOG_TABLE)
    .select({ filterByFormula: `SEARCH("${signature.slice(0,8)}", {Title})`, maxRecords: 5 })
    .all();

  // 2. Propose playbook via LLM
  const proposedJs = await proposePlaybook(issue, tenant_id, pastIssues.map(r => r.fields));
  
  // 3. Generate patch_id
  const patchId = `patch_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${Math.random().toString(36).slice(2,6)}`;
  
  // 4. Save to Atlas_Patches
  const patchRecord = await airtable(ATLAS_PATCHES_TABLE).create({
    patch_id: patchId,
    tenant_id,
    issue_signature: signature,
    issue_text: issue,
    proposed_playbook_js: proposedJs,
    status: 'pending_approval',
    proposed_at: new Date().toISOString(),
  });
  
  // 5. Notify Jorge via Telegram
  const msg = `🧠 *Atlas Loop 2 — New Playbook Proposed*\n\n` +
    `Issue: \`${issue.slice(0,100)}\`\n` +
    `Patch ID: \`${patchId}\`\n\n` +
    `Proposed fix:\n\`\`\`js\n${proposedJs.slice(0,400)}\n\`\`\`\n\n` +
    `Reply */yes ${patchId}* to activate, */no ${patchId}* to reject.`;
  
  await sendTelegram(msg);
}
```

---

## Step 3 — Telegram webhook: handle /yes and /no commands

**File:** `/opt/geo-webhook/server.mjs` or existing webhook handler

```javascript
// Add to message handler:
if (text?.startsWith('/yes ') || text?.startsWith('/no ')) {
  const [cmd, patchId] = text.split(' ');
  const approved = cmd === '/yes';
  
  // Find patch record
  const patches = await airtable(ATLAS_PATCHES_TABLE)
    .select({ filterByFormula: `{patch_id} = "${patchId}"`, maxRecords: 1 })
    .all();
  
  if (!patches.length) {
    await sendTelegram(`❌ patch_id \`${patchId}\` not found`);
    return;
  }
  
  const patch = patches[0];
  const newStatus = approved ? 'approved' : 'rejected';
  
  await airtable(ATLAS_PATCHES_TABLE).update(patch.id, {
    status: newStatus,
    reviewed_at: new Date().toISOString(),
    reviewed_by: 'Jorge',
  });
  
  if (approved) {
    // Dynamically evaluate and register the playbook
    try {
      const playbook = eval(`(${patch.fields.proposed_playbook_js})`);
      PLAYBOOKS.push(playbook); // runtime registration
      
      await airtable(ATLAS_PATCHES_TABLE).update(patch.id, { status: 'active' });
      await sendTelegram(`✅ Playbook \`${patchId}\` activated — will fire on next match`);
    } catch (err) {
      await airtable(ATLAS_PATCHES_TABLE).update(patch.id, { status: 'failed', activation_result: err.message });
      await sendTelegram(`❌ Playbook \`${patchId}\` failed to activate: ${err.message}`);
    }
  } else {
    await sendTelegram(`🚫 Playbook \`${patchId}\` rejected`);
  }
}
```

---

## Step 4 — Persist approved playbooks across restarts

On agent startup, load approved patches from Airtable and register them:

```javascript
// In atlas.mjs init():
const approvedPatches = await airtable(ATLAS_PATCHES_TABLE)
  .select({ filterByFormula: `{status} = "active"` })
  .all();

for (const patch of approvedPatches) {
  try {
    const playbook = eval(`(${patch.fields.proposed_playbook_js})`);
    PLAYBOOKS.push(playbook);
    console.log(`[Atlas] Loaded approved patch: ${patch.fields.patch_id}`);
  } catch (err) {
    console.error(`[Atlas] Failed to load patch ${patch.fields.patch_id}: ${err.message}`);
  }
}
```

---

## Verification
1. Trigger an issue with no existing playbook
2. Verify Atlas_Patches gets a record with `status=pending_approval`
3. Verify Telegram notification arrives with `/yes PATCH_ID` instruction
4. Reply `/yes PATCH_ID` → verify status changes to `active`
5. Re-trigger the same issue → verify the new playbook fires
6. Restart atlas → verify approved patch is reloaded from Airtable

## Security Note
`eval()` on LLM-generated code has security implications. The proposed playbook is saved for Jorge's review before activation. Do NOT auto-activate without approval. Consider adding a code sandbox (vm.runInNewContext) as an extra safety layer.
