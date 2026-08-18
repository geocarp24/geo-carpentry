import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { ENV } from "./_core/env";

const GRAPH_VERSION = "v26.0";

type GraphError = { error?: { message?: string; code?: number } };

function requiredConfig() {
  if (!ENV.facebookAppId || !ENV.facebookAppSecret || !ENV.facebookPageId) throw new Error("La integración de Facebook todavía no está configurada");
  return { appId: ENV.facebookAppId, appSecret: ENV.facebookAppSecret, pageId: ENV.facebookPageId };
}

function encryptionKey() {
  if (!ENV.cookieSecret) throw new Error("No hay una clave de cifrado disponible");
  return createHash("sha256").update(ENV.cookieSecret).digest();
}

function graphUrl(path: string) { return `https://graph.facebook.com/${GRAPH_VERSION}/${path.replace(/^\//, "")}`; }

async function graphRequest(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({})) as Record<string, unknown> & GraphError;
  if (!response.ok || body.error) throw new Error(body.error?.message || `Facebook rechazó la solicitud (${response.status})`);
  return body;
}

export function isFacebookConfigured() {
  return Boolean(ENV.facebookAppId && ENV.facebookAppSecret && ENV.facebookPageId);
}

export function encryptFacebookToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptFacebookToken(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) throw new Error("El token de Facebook almacenado no es válido");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function buildFacebookLoginUrl(redirectUri: string, state: string) {
  const { appId } = requiredConfig();
  const url = new URL("https://www.facebook.com/v26.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "pages_show_list,pages_read_engagement,pages_manage_posts,publish_video");
  return url.toString();
}

export async function exchangeFacebookAuthorization(code: string, redirectUri: string) {
  const { appId, appSecret, pageId } = requiredConfig();
  const exchange = new URL(graphUrl("oauth/access_token"));
  exchange.searchParams.set("client_id", appId);
  exchange.searchParams.set("client_secret", appSecret);
  exchange.searchParams.set("redirect_uri", redirectUri);
  exchange.searchParams.set("code", code);
  const shortLived = await graphRequest(exchange.toString(), { method: "GET" }) as { access_token: string };

  const longLivedUrl = new URL(graphUrl("oauth/access_token"));
  longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
  longLivedUrl.searchParams.set("client_id", appId);
  longLivedUrl.searchParams.set("client_secret", appSecret);
  longLivedUrl.searchParams.set("fb_exchange_token", shortLived.access_token);
  const longLived = await graphRequest(longLivedUrl.toString(), { method: "GET" }) as { access_token: string };

  const pagesUrl = new URL(graphUrl("me/accounts"));
  pagesUrl.searchParams.set("fields", "id,name,access_token");
  pagesUrl.searchParams.set("access_token", longLived.access_token);
  const pages = await graphRequest(pagesUrl.toString(), { method: "GET" }) as { data?: Array<{ id: string; name: string; access_token: string }> };
  const page = pages.data?.find(item => item.id === pageId);
  if (!page?.access_token) throw new Error("La cuenta autorizada no tiene acceso de contenido a la Página configurada");
  return { pageId: page.id, pageName: page.name, pageAccessToken: page.access_token, scopes: "pages_show_list,pages_read_engagement,pages_manage_posts,publish_video" };
}

export async function publishFacebookPhoto(input: { pageId: string; pageAccessToken: string; imageUrl: string; caption: string }) {
  const body = new URLSearchParams({ url: input.imageUrl, caption: input.caption, access_token: input.pageAccessToken });
  const result = await graphRequest(graphUrl(`${input.pageId}/photos`), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }) as { post_id?: string; id?: string };
  return result.post_id || result.id || "";
}

export async function publishFacebookReel(input: { pageId: string; pageAccessToken: string; videoUrl: string; description: string }) {
  const start = await graphRequest(graphUrl(`${input.pageId}/video_reels`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ upload_phase: "start", access_token: input.pageAccessToken }) }) as { video_id: string; upload_url: string };
  await graphRequest(start.upload_url, { method: "POST", headers: { Authorization: `OAuth ${input.pageAccessToken}`, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ file_url: input.videoUrl }) });
  const finishBody = new URLSearchParams({ access_token: input.pageAccessToken, video_id: start.video_id, upload_phase: "finish", video_state: "PUBLISHED", description: input.description });
  const published = await graphRequest(graphUrl(`${input.pageId}/video_reels`), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: finishBody }) as { post_id?: string; video_id?: string };
  return published.post_id || published.video_id || start.video_id;
}
