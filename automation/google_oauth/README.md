# Google OAuth bootstrap for Geo Carpentry

One-time setup to mint a long-lived refresh token for `alexgeocarpentry@gmail.com`. Once minted, El Posicionador (SEO audits), Cartografo (GMB management), and any future agent can use the refresh token to call Google APIs (Search Console, Business Profile, Analytics) without re-auth.

## Pre-requisites

1. **OAuth client created** in Google Cloud Console:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8080/oauth/callback` AND `http://127.0.0.1:8080/oauth/callback`
   - Test users added: `alexgeocarpentry@gmail.com`
2. **APIs enabled** in the same Cloud project:
   - Google Search Console API
   - Google Business Profile API
   - My Business Account Management API
   - My Business Business Information API
   - Google Analytics Data API (GA4)
   - PageSpeed Insights API
3. **GitHub Secrets** in `geo-carpentry` repo:
   - `GEO_GOOGLE_OAUTH_CLIENT_ID`
   - `GEO_GOOGLE_OAUTH_CLIENT_SECRET`

## Run the bootstrap (one time, locally)

```powershell
$env:GEO_GOOGLE_OAUTH_CLIENT_ID = "<from secret>"
$env:GEO_GOOGLE_OAUTH_CLIENT_SECRET = "<from secret>"
python automation/google_oauth/google_oauth_init.py
```

Browser will open Google's consent screen → sign in as `alexgeocarpentry@gmail.com` → grant the listed scopes → tab closes → terminal prints `SUCCESS`.

Output: `~/.geo_google_token.json` with the refresh token (chmod 600).

## Deploy refresh token to Hostinger

```powershell
# Upload the token file (NOT in git) to Hostinger via SFTP
python "c:\Users\Admin\OneDrive\Documents\Claude for real estate\.tools\sftp_upload.py" `
    "$env:USERPROFILE\.geo_google_token.json" `
    ".geo_google_token.json"
```

Cartografo / Posicionador will read it from `~/.geo_google_token.json` and use it to mint short-lived access tokens.

## Scopes requested

| Scope | Purpose |
|---|---|
| `https://www.googleapis.com/auth/webmasters` | Search Console read + sitemap submit + indexing |
| `https://www.googleapis.com/auth/business.manage` | Business Profile (posts, photos, services, reviews) + Account Management |
| `https://www.googleapis.com/auth/analytics.readonly` | GA4 traffic data (read-only) |
| `openid email profile` | identify the authenticated user (for logging) |

## Notes

- The refresh token does NOT expire while:
  - The OAuth app stays in "Testing" mode
  - `alexgeocarpentry@gmail.com` is in the test users list
  - The user does not revoke access in https://myaccount.google.com/permissions
- If the refresh token gets invalidated, just re-run this script.
- PageSpeed Insights doesn't need OAuth — uses an API key, can be created separately if needed.
