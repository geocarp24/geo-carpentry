# HANDOFF — Foreman SEO: Stale-Findings Bug Fix
> Cowork → Claude Code | 2026-06-08
> Bug: Foreman reports H1=Home and /inicio/ duplicate even though audit (2026-06-08) confirms H1 is correct and /inicio/ returns 404.

## Root Cause
Fetches to geocarpentry.com are served from cache. Foreman sees stale HTML from a prior state.

## File to modify
`/opt/alex-bot/agents/foreman_seo/foreman_seo.mjs`

## Fix 1 — Add cache-busting to ALL fetches targeting geocarpentry.com

```javascript
// Helper — replace any direct fetch(url) or fetch(url, opts) where url contains geocarpentry.com

function cacheBustUrl(url) {
  const u = new URL(url);
  u.searchParams.set('_cb', Date.now());
  return u.toString();
}

function fetchFresh(url, opts = {}) {
  return fetch(cacheBustUrl(url), {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
    },
  });
}

// Replace all:
//   fetch('https://geocarpentry.com/...')
//   fetch(url)  ← where url is a geocarpentry URL
// with:
//   fetchFresh('https://geocarpentry.com/...')
//   fetchFresh(url)
```

## Fix 2 — Verify URLs with HEAD before reporting as "duplicate"

```javascript
// Before flagging a URL as "duplicate page" or "redirect issue", verify it's actually live:

async function isLivePage(url) {
  try {
    const r = await fetchFresh(url, { method: 'HEAD' });
    return r.ok; // 200-299 = live; 301/302/404/410 = not a valid page
  } catch {
    return false;
  }
}

// Example usage in the duplicate-detection block:
// BEFORE (buggy):
//   issues.push({ type: 'duplicate', url: '/inicio/' })
//
// AFTER (fixed):
//   if (await isLivePage(baseUrl + '/inicio/')) {
//     issues.push({ type: 'duplicate', url: '/inicio/' })
//   }
//   // else: silently skip — 404 pages are not duplicates
```

## Fix 3 — H1 false positive guard

```javascript
// After fetching page HTML, validate H1 before flagging:
// Known correct H1 for Geo Carpentry homepage:
const KNOWN_H1_OVERRIDES = {
  'geo-carpentry': 'General Contractor in Green Bay & NE Wisconsin',
};

// In H1 check:
const expectedH1 = KNOWN_H1_OVERRIDES[tenant_id];
if (expectedH1 && detectedH1?.toLowerCase() === expectedH1.toLowerCase()) {
  // H1 is correct — skip H1 issue
} else if (detectedH1 === 'Home' || detectedH1 === '') {
  issues.push({ type: 'h1_missing_or_generic', detected: detectedH1 });
}
```

## Verification
```bash
cd /opt/alex-bot
node agents/foreman_seo/foreman_seo.mjs --tenant geo-carpentry --mode quick_audit

# Expected:
# - No H1=Home issue (H1 is correctly "General Contractor in Green Bay & NE Wisconsin")
# - No /inicio/ duplicate (returns 404)
# - overall_score >= 75
# - top_issues does NOT contain h1 or inicio
```

## Score Targets
| Before fix | After fix |
|---|---|
| 58–63 | ≥ 75 |
