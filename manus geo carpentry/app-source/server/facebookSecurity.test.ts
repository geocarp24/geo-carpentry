import { describe, expect, it } from "vitest";
import { buildFacebookLoginUrl, decryptFacebookToken, encryptFacebookToken, isFacebookConfigured } from "./facebook";

describe("Facebook integration security", () => {
  it("keeps a page token encrypted at rest and restores it only on the server", () => {
    const token = "sample-page-token-that-must-not-be-stored-as-plain-text";
    const encrypted = encryptFacebookToken(token);
    expect(encrypted).not.toContain(token);
    expect(decryptFacebookToken(encrypted)).toBe(token);
  });

  it("builds an OAuth URL with the required page publishing scopes", () => {
    expect(isFacebookConfigured()).toBe(true);
    const url = new URL(buildFacebookLoginUrl("https://example.com/api/facebook/callback", "signed-state"));
    expect(url.origin).toBe("https://www.facebook.com");
    expect(url.searchParams.get("redirect_uri")).toBe("https://example.com/api/facebook/callback");
    expect(url.searchParams.get("scope")).toContain("pages_manage_posts");
    expect(url.searchParams.get("scope")).toContain("publish_video");
  });
});
