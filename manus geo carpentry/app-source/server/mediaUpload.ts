import crypto from "crypto";
import type { Express, NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { User } from "../drizzle/schema";
import * as db from "./db";
import { createContext } from "./_core/context";
import { ENV } from "./_core/env";
import { MAX_DIRECT_UPLOAD_BYTES, MAX_SERVER_UPLOAD_BYTES } from "./mediaImportRules";
import { storageGet, storageGetSignedUrl, storagePrepareDirectUpload, storagePut } from "./storage";
import { ALLOWED_EXTENSIONS, classifyFile, duplicateReviewReason, shouldProposeBlurCleanup } from "./mediaRules";

export { ALLOWED_EXTENSIONS, classifyFile } from "./mediaRules";
export { MAX_DIRECT_UPLOAD_BYTES, MAX_SERVER_UPLOAD_BYTES } from "./mediaImportRules";

type AuthenticatedRequest = Request & { currentUser?: User };
type DirectUploadPayload = { userId: number; importId: number | null; filename: string; mimeType: string; sizeBytes: number; storageKey: string; expiresAt: number };
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_SERVER_UPLOAD_BYTES } });

function safeName(filename: string) { return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180) || "media"; }
function parseImportId(value: unknown) { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; }

function signDirectPayload(payload: DirectUploadPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = ENV.cookieSecret;
  if (!secret) throw new Error("No se puede proteger la carga directa sin una clave de sesión");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function readDirectPayload(token: unknown): DirectUploadPayload | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", ENV.cookieSecret).update(encoded).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as DirectUploadPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch { return null; }
}

async function estimateBlurScore(buffer: Buffer) {
  try {
    const rendered = await sharp(buffer, { failOn: "none" }).rotate().resize({ width: 96, height: 96, fit: "inside", withoutEnlargement: true }).grayscale().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = rendered;
    if (info.width < 8 || info.height < 8) return null;
    let total = 0; let comparisons = 0;
    for (let y = 0; y < info.height - 1; y += 1) for (let x = 0; x < info.width - 1; x += 1) {
      const index = y * info.width + x;
      total += Math.abs(data[index] - data[index + 1]) + Math.abs(data[index] - data[index + info.width]);
      comparisons += 2;
    }
    return Math.round(total / Math.max(comparisons, 1));
  } catch { return null; }
}

async function requireAuthenticatedUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const context = await createContext({ req, res } as Parameters<typeof createContext>[0]);
  if (!context.user) return res.status(401).json({ error: "Autenticación requerida" });
  req.currentUser = context.user;
  next();
}

async function inspectStoredObject(storageKey: string) {
  const signedUrl = await storageGetSignedUrl(storageKey);
  const response = await fetch(signedUrl);
  if (!response.ok || !response.body) throw new Error("No fue posible recuperar la copia almacenada para verificarla");
  const verificationHash = crypto.createHash("sha256");
  let sizeBytes = 0;
  for await (const chunk of Readable.fromWeb(response.body as unknown as NodeReadableStream)) {
    const data = Buffer.from(chunk);
    verificationHash.update(data);
    sizeBytes += data.length;
  }
  return { checksumSha256: verificationHash.digest("hex"), sizeBytes };
}

async function assertImportOwnership(userId: number, importId: number | null) {
  if (!importId) return;
  if (!await db.getMediaImportById(userId, importId)) throw new Error("La importación ya no pertenece a esta cuenta");
}

async function registerVerifiedMedia(input: { user: User; importId: number | null; filename: string; mimeType: string; sizeBytes: number; checksumSha256: string; storageKey: string; blurScore: number | null }) {
  const existing = await db.getMediaAssetByChecksum(input.user.id, input.checksumSha256);
  if (existing) {
    if (existing.backupVerified) await db.createCleanupCandidate(input.user.id, existing.id, duplicateReviewReason(input.filename));
    if (input.importId) await db.recordMediaImportOutcome(input.user.id, input.importId, "duplicate");
    return { outcome: "duplicate" as const, existingAssetId: existing.id };
  }
  const { mediaType, category } = classifyFile(input.filename, input.mimeType);
  const storage = await storageGet(input.storageKey);
  const assetId = await db.createMediaAsset({
    userId: input.user.id,
    importId: input.importId,
    originalFilename: input.filename,
    mimeType: input.mimeType || "application/octet-stream",
    mediaType,
    sizeBytes: input.sizeBytes,
    checksumSha256: input.checksumSha256,
    storageKey: storage.key,
    storageUrl: storage.url,
    backupVerified: true,
    category,
    classificationSource: mediaType === "video" ? "initial" : null,
    classificationConfidence: mediaType === "video" ? 100 : null,
    classificationNote: mediaType === "video" ? "Video identificado por formato" : null,
    blurScore: input.blurScore,
  });
  if (shouldProposeBlurCleanup(true, input.blurScore)) await db.createCleanupCandidate(input.user.id, assetId, "Posible foto borrosa: requiere revisión visual");
  if (input.importId) await db.recordMediaImportOutcome(input.user.id, input.importId, "uploaded");
  return { outcome: "uploaded" as const, assetId };
}

export function registerMediaUploadRoutes(app: Express) {
  app.post("/api/media/prepare-upload", requireAuthenticatedUser, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const filename = typeof req.body?.filename === "string" ? req.body.filename : "";
      const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "application/octet-stream";
      const sizeBytes = Number(req.body?.sizeBytes);
      const importId = parseImportId(req.body?.importId);
      if (!filename || !Number.isInteger(sizeBytes) || sizeBytes < 1) return res.status(400).json({ error: "Metadatos de archivo inválidos" });
      if (!ALLOWED_EXTENSIONS.has(path.extname(filename).toLowerCase())) return res.status(415).json({ error: "Formato no compatible" });
      if (sizeBytes > MAX_DIRECT_UPLOAD_BYTES) return res.status(413).json({ error: "El archivo supera el límite de 1 GB para carga directa" });
      await assertImportOwnership(user.id, importId);
      const folder = new Date().toISOString().slice(0, 7);
      const storage = await storagePrepareDirectUpload(`users/${user.id}/originals/${folder}/${safeName(filename)}`);
      const token = signDirectPayload({ userId: user.id, importId, filename, mimeType, sizeBytes, storageKey: storage.key, expiresAt: Date.now() + 60 * 60 * 1000 });
      res.json({ uploadUrl: storage.uploadUrl, token });
    } catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo preparar la carga directa" }); }
  });

  app.post("/api/media/complete-upload", requireAuthenticatedUser, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.currentUser!;
      const payload = readDirectPayload(req.body?.token);
      if (!payload || payload.userId !== user.id) return res.status(403).json({ error: "La autorización de la carga directa no es válida" });
      await assertImportOwnership(user.id, payload.importId);
      const inspected = await inspectStoredObject(payload.storageKey);
      if (inspected.sizeBytes !== payload.sizeBytes) return res.status(422).json({ error: "El tamaño almacenado no coincide con el archivo seleccionado" });
      const result = await registerVerifiedMedia({
        user, importId: payload.importId, filename: payload.filename, mimeType: payload.mimeType, sizeBytes: inspected.sizeBytes,
        checksumSha256: inspected.checksumSha256, storageKey: payload.storageKey, blurScore: null,
      });
      if (result.outcome === "duplicate") return res.status(409).json({ error: "Archivo duplicado", outcome: result.outcome, existingAssetId: result.existingAssetId });
      res.status(201).json({ ...result, backupVerified: true, checksumSha256: inspected.checksumSha256 });
    } catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo verificar la carga directa" }); }
  });

  app.post("/api/media/upload", requireAuthenticatedUser, (req, res, next) => upload.single("file")(req, res, error => {
    if (error) return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "El archivo supera 250 MB; usa la carga directa." : "No se pudo leer el archivo" });
    next();
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const file = req.file;
      const user = req.currentUser;
      if (!file || !user) return res.status(400).json({ error: "Selecciona un archivo" });
      if (!ALLOWED_EXTENSIONS.has(path.extname(file.originalname).toLowerCase())) return res.status(415).json({ error: "Formato no compatible" });
      const importId = parseImportId(req.body?.importId);
      await assertImportOwnership(user.id, importId);
      const checksumSha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");
      const folder = new Date().toISOString().slice(0, 7);
      const storage = await storagePut(`users/${user.id}/originals/${folder}/${safeName(file.originalname)}`, file.buffer, file.mimetype || "application/octet-stream");
      const inspected = await inspectStoredObject(storage.key);
      if (inspected.checksumSha256 !== checksumSha256 || inspected.sizeBytes !== file.size) return res.status(422).json({ error: "No se pudo verificar la copia del original" });
      const result = await registerVerifiedMedia({ user, importId, filename: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, checksumSha256, storageKey: storage.key, blurScore: await estimateBlurScore(file.buffer) });
      if (result.outcome === "duplicate") return res.status(409).json({ error: "Archivo duplicado", outcome: result.outcome, existingAssetId: result.existingAssetId });
      res.status(201).json({ ...result, backupVerified: true, checksumSha256 });
    } catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "No se pudo respaldar el archivo" }); }
  });
}
