import { jwtVerify } from "jose";
import type { Request } from "express";
import { parse as parseCookies } from "cookie";
import { COOKIE_NAME } from "../shared/const";
import { ENV } from "./_core/env";
import * as db from "./db";

const encoder = new TextEncoder();
const key = () => encoder.encode(ENV.sessionSecret);

async function ownerUser() {
  if (!ENV.ownerOpenId) return null;
  await db.upsertUser({
    openId: ENV.ownerOpenId,
    name: ENV.ownerName || "Geo Carpentry",
    role: "admin",
    loginMethod: "hostinger",
  });
  return db.getUserByOpenId(ENV.ownerOpenId);
}

/**
 * Supports the existing self-hosted Hostinger portal. It is inert unless the
 * deployment explicitly sets OPEN_ACCESS=true or provides an owner JWT cookie.
 */
export async function authenticateHostingerRequest(req: Request) {
  if (!ENV.sessionSecret || !ENV.ownerOpenId) return null;

  if (ENV.openAccess) return ownerUser();

  const rawToken = parseCookies(req.headers.cookie || "")[COOKIE_NAME];
  if (!rawToken) return null;

  try {
    const { payload } = await jwtVerify(rawToken, key());
    if (payload.sub !== ENV.ownerOpenId || payload.scope !== "owner") return null;
    return ownerUser();
  } catch {
    return null;
  }
}
