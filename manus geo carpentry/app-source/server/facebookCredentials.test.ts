import { describe, expect, it } from "vitest";

describe("Facebook application credentials", () => {
  it("obtains an app access token without exposing the configured secret", async () => {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    expect(appId).toBeTruthy();
    expect(appSecret).toBeTruthy();

    const url = new URL("https://graph.facebook.com/v26.0/oauth/access_token");
    url.searchParams.set("client_id", appId!);
    url.searchParams.set("client_secret", appSecret!);
    url.searchParams.set("grant_type", "client_credentials");
    const response = await fetch(url);
    expect(response.ok).toBe(true);
    const body = await response.json() as { access_token?: string };
    expect(body.access_token).toMatch(/^\d+\|/);
  }, 15_000);
});
