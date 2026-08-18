import { createHmac, timingSafeEqual } from "crypto";
import type { Express, Request, Response } from "express";
import { parse as parseCookies } from "cookie";
import * as db from "./db";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { buildFacebookLoginUrl, encryptFacebookToken, exchangeFacebookAuthorization, isFacebookConfigured } from "./facebook";

const STATE_COOKIE = "geo_facebook_oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

function originFromRequest(req: Request) {
  const protocol = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

function sign(payload: string) { return createHmac("sha256", ENV.cookieSecret).update(payload).digest("base64url"); }
function createState(userId: number) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + STATE_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
function readState(value: string | undefined) {
  if (!value || !ENV.cookieSecret) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const valid = Buffer.byteLength(signature) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: number; expiresAt: number };
    return decoded.expiresAt > Date.now() && Number.isInteger(decoded.userId) ? decoded : null;
  } catch { return null; }
}

function isOwner(openId: string) { return Boolean(ENV.ownerOpenId) && openId === ENV.ownerOpenId; }
function redirectError(res: Response, reason: string) { return res.redirect(`/calendario?facebook=error&reason=${encodeURIComponent(reason)}`); }

export function registerFacebookRoutes(app: Express) {
  app.get("/api/facebook/connect", async (req, res) => {
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.status(401).send("Inicia sesión para conectar Facebook");
    if (!isOwner(user.openId)) return res.status(403).send("Solo el propietario puede conectar la Página de Facebook");
    if (!isFacebookConfigured()) return res.status(503).send("La integración de Facebook no está configurada");
    const state = createState(user.id);
    res.cookie(STATE_COOKIE, state, { ...getSessionCookieOptions(req), maxAge: STATE_TTL_MS });
    return res.redirect(buildFacebookLoginUrl(`${originFromRequest(req)}/api/facebook/callback`, state));
  });

  app.get("/api/facebook/callback", async (req, res) => {
    const cookieState = parseCookies(req.headers.cookie || "")[STATE_COOKIE];
    const queryState = typeof req.query.state === "string" ? req.query.state : undefined;
    const state = readState(cookieState);
    res.clearCookie(STATE_COOKIE, getSessionCookieOptions(req));
    if (!state || !queryState || state.userId < 1 || queryState !== cookieState) return redirectError(res, "La autorización expiró o no coincide con esta sesión");
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    if (!code) return redirectError(res, "Facebook no entregó un código de autorización");
    try {
      const connection = await exchangeFacebookAuthorization(code, `${originFromRequest(req)}/api/facebook/callback`);
      await db.upsertFacebookConnection(state.userId, { pageId: connection.pageId, pageName: connection.pageName, accessTokenEncrypted: encryptFacebookToken(connection.pageAccessToken), scopes: connection.scopes });
      return res.redirect("/calendario?facebook=connected");
    } catch (error) {
      return redirectError(res, error instanceof Error ? error.message : "No se pudo conectar Facebook");
    }
  });
}
