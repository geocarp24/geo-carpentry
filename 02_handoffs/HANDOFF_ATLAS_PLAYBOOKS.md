# HANDOFF — Atlas Loop 1: 3 New Playbooks
> Cowork → Claude Code | 2026-06-08

## File to modify
`/opt/alex-bot/agents/atlas/atlas.mjs`

## Action
Find the `PLAYBOOKS` array and append the following 3 entries.

```javascript
// ─── ADD TO PLAYBOOKS ARRAY ─────────────────────────────────────────────────

{
  id: 'review_schema_missing',
  match: /missing schema|review[\s_-]?schema|aggregaterating.*empty/i,
  escalate: false,
  action: async () => ({
    deployed: 'geo-seo-boost.php',
    verified: await (async () => {
      const r = await fetch(
        'https://geocarpentry.com/wp-admin/admin-ajax.php?action=geo_seo_status'
      );
      return r.ok ? 'ok' : `http_${r.status}`;
    })(),
  }),
  escalateMsg: () => null, // already fixed by geo-seo-boost.php v1.0.0
},

{
  id: 'alt_text_generic',
  match: /generic.*alt|weak.*alt.*text|alt.*"decks"|alt.*"kitchen"/i,
  escalate: false,
  action: async () => {
    const r = await fetch(
      'https://geocarpentry.com/wp-admin/admin-ajax.php?action=geo_seo_rerun_alt_fix',
      { method: 'POST' }
    );
    return await r.json();
  },
  escalateMsg: (res) =>
    res?.updated > 0
      ? null
      : '⚠️ alt-fix returned 0 updates — verify mu-plugin loaded at geocarpentry.com',
},

{
  id: 'gbp_place_id_tbd',
  match: /place_id.*TBD|GBP.*place_id.*missing/i,
  escalate: true,
  action: async () => ({ requires_owner: true }),
  escalateMsg: () =>
    '👤 GBP place_id TBD — Jorge debe sacarlo de https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder y pegarlo en /opt/alex-bot/agents/tenants/geo-carpentry.json → "gbp_place_id"',
},

// ─────────────────────────────────────────────────────────────────────────────
```

## Verification
```bash
cd /opt/alex-bot
# Trigger atlas with a test issue that matches each pattern:
echo '{"tenant":"geo-carpentry","issue":"aggregateRating empty on /kitchen-remodeling/"}' | \
  node agents/atlas/atlas.mjs --test-playbook

# Expected: playbook review_schema_missing fires, action returns {deployed, verified}
# No Telegram escalation (escalate: false)

echo '{"tenant":"geo-carpentry","issue":"GBP place_id TBD in tenant config"}' | \
  node agents/atlas/atlas.mjs --test-playbook
# Expected: Telegram escalation sent with place_id finder link
```
