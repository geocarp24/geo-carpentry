#!/usr/bin/env python3
"""
Geo Carpentry — Google OAuth Refresh Token bootstrap.

Usage:
    GEO_GOOGLE_OAUTH_CLIENT_ID="..." GEO_GOOGLE_OAUTH_CLIENT_SECRET="..." \
        python google_oauth_init.py

What it does:
    1. Starts a local web server on http://localhost:8080/oauth/callback
    2. Opens the Google consent screen in the default browser (or prints URL for headless)
    3. User logs in as alexgeocarpentry@gmail.com and grants scopes
    4. Captures the auth code, exchanges for tokens
    5. Prints the refresh_token to stdout (and saves to ~/.geo_google_token.json)

The refresh_token never expires (Testing-mode OAuth + Test User), so this only runs ONCE.
Subsequent Posicionador/Cartografo runs use the refresh_token to mint short-lived access_tokens.

Scopes requested cover the 6 APIs we need:
    - Search Console (read + write sitemap + indexing)
    - Business Profile (read + write posts, photos, services)
    - Account Management (list locations)
    - Business Info (edit ficha)
    - PageSpeed Insights (no scope needed — uses API key)
    - Analytics Data (GA4 read)
"""
import http.server
import json
import os
import socketserver
import sys
import threading
import urllib.parse
import urllib.request
import webbrowser

CLIENT_ID = os.environ.get("GEO_GOOGLE_OAUTH_CLIENT_ID")
CLIENT_SECRET = os.environ.get("GEO_GOOGLE_OAUTH_CLIENT_SECRET")
PORT = int(os.environ.get("OAUTH_PORT", "8080"))
REDIRECT_URI = f"http://localhost:{PORT}/oauth/callback"
TOKEN_OUTPUT = os.path.expanduser(os.environ.get("OAUTH_TOKEN_OUTPUT", "~/.geo_google_token.json"))

SCOPES = [
    "https://www.googleapis.com/auth/webmasters",                    # Search Console (read+write)
    "https://www.googleapis.com/auth/business.manage",               # Business Profile + Account Management
    "https://www.googleapis.com/auth/analytics.readonly",            # GA4 read
    "openid", "email", "profile",                                    # identify the authenticated user
]

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: set GEO_GOOGLE_OAUTH_CLIENT_ID and GEO_GOOGLE_OAUTH_CLIENT_SECRET env vars", file=sys.stderr)
    sys.exit(2)

# Build authorization URL
auth_params = {
    "client_id": CLIENT_ID,
    "redirect_uri": REDIRECT_URI,
    "response_type": "code",
    "scope": " ".join(SCOPES),
    "access_type": "offline",      # critical — without this we don't get a refresh_token
    "prompt": "consent",            # force consent screen so refresh_token is always returned
    "include_granted_scopes": "true",
}
auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(auth_params)

# Shared state between server thread and main
state = {"code": None, "error": None}

class CallbackHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        return  # silence default logging
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/oauth/callback":
            self.send_response(404); self.end_headers(); return
        qs = urllib.parse.parse_qs(parsed.query)
        if "error" in qs:
            state["error"] = qs["error"][0]
            self.send_response(400)
            self.send_header("Content-Type", "text/html"); self.end_headers()
            self.wfile.write(f"<h1>OAuth error: {state['error']}</h1>".encode()); return
        if "code" in qs:
            state["code"] = qs["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html"); self.end_headers()
            self.wfile.write(b"<h1>Authorized!</h1><p>You can close this tab and return to the terminal.</p>")
            return
        self.send_response(400); self.end_headers()

def serve_once():
    with socketserver.TCPServer(("localhost", PORT), CallbackHandler) as httpd:
        httpd.timeout = 300  # 5 min
        while state["code"] is None and state["error"] is None:
            httpd.handle_request()

print(f"Starting local callback server on http://localhost:{PORT} …")
t = threading.Thread(target=serve_once, daemon=True)
t.start()

print("\nOpen this URL in your browser (sign in as alexgeocarpentry@gmail.com):")
print(f"\n  {auth_url}\n")
try:
    webbrowser.open(auth_url)
except Exception:
    pass

print("Waiting for redirect (5 min max)…")
t.join(timeout=305)

if state["error"]:
    print(f"OAuth failed: {state['error']}", file=sys.stderr)
    sys.exit(1)
if not state["code"]:
    print("Timeout waiting for OAuth callback", file=sys.stderr)
    sys.exit(1)

# Exchange code for tokens
print("Exchanging code for tokens…")
token_req = urllib.parse.urlencode({
    "code": state["code"],
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "redirect_uri": REDIRECT_URI,
    "grant_type": "authorization_code",
}).encode()

req = urllib.request.Request(
    "https://oauth2.googleapis.com/token",
    data=token_req,
    headers={"Content-Type": "application/x-www-form-urlencoded"},
)
with urllib.request.urlopen(req, timeout=30) as resp:
    tokens = json.loads(resp.read().decode())

if "refresh_token" not in tokens:
    print("ERROR: response did not include refresh_token. Did you set access_type=offline and prompt=consent?", file=sys.stderr)
    print(json.dumps(tokens, indent=2), file=sys.stderr)
    sys.exit(1)

# Persist
out_dir = os.path.dirname(TOKEN_OUTPUT)
if out_dir and not os.path.exists(out_dir):
    os.makedirs(out_dir, exist_ok=True)
with open(TOKEN_OUTPUT, "w") as f:
    json.dump({
        "refresh_token": tokens["refresh_token"],
        "access_token": tokens.get("access_token"),
        "expires_in": tokens.get("expires_in"),
        "scope": tokens.get("scope"),
        "token_type": tokens.get("token_type"),
        "client_id": CLIENT_ID,
    }, f, indent=2)
os.chmod(TOKEN_OUTPUT, 0o600)

print(f"\nSUCCESS — tokens saved to {TOKEN_OUTPUT}")
print(f"refresh_token (first 20 chars): {tokens['refresh_token'][:20]}...")
print(f"granted scopes: {tokens.get('scope', '?')}")
print("\nThe refresh_token does NOT expire (until you revoke it in Google account settings).")
print("Posicionador and Cartografo agents will use it to mint fresh access tokens automatically.")
