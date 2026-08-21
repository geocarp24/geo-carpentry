import { and, asc, count, desc, eq, gt, isNull, ne, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cleanupCandidates,
  constructionProjects,
  contentSlots,
  facebookConnections,
  InsertMediaAsset,
  InsertUser,
  mediaAssets,
  mediaExports,
  mediaImports,
  users,
} from "../drizzle/schema";
import { getImportCompletionStatus, isBatchClassificationCandidate } from "./mediaImportRules";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({ ...user, lastSignedIn: user.lastSignedIn ?? new Date() }).onDuplicateKeyUpdate({
    set: { name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: new Date() },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getMediaAssetsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaAssets).where(eq(mediaAssets.userId, userId)).orderBy(desc(mediaAssets.createdAt));
}

export async function getVerifiedMediaMigrationBatch(userId: number, afterId: number, limit: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaAssets).where(and(
    eq(mediaAssets.userId, userId),
    eq(mediaAssets.backupVerified, true),
    gt(mediaAssets.id, afterId),
  )).orderBy(asc(mediaAssets.id)).limit(limit);
}

export async function getMediaAssetById(userId: number, id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(mediaAssets).where(and(eq(mediaAssets.userId, userId), eq(mediaAssets.id, id))).limit(1))[0];
}

export async function getMediaAssetByChecksum(userId: number, checksumSha256: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(mediaAssets).where(and(eq(mediaAssets.userId, userId), eq(mediaAssets.checksumSha256, checksumSha256))).limit(1))[0];
}

export async function createMediaAsset(data: InsertMediaAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return Number((await db.insert(mediaAssets).values(data))[0].insertId);
}

export async function updateMediaAsset(userId: number, id: number, values: Partial<InsertMediaAsset>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(mediaAssets).set(values).where(and(eq(mediaAssets.userId, userId), eq(mediaAssets.id, id)));
  return getMediaAssetById(userId, id);
}

export async function getBatchClassificationCandidates(userId: number, limit: number) {
  const db = await getDb();
  if (!db) return [];
  const candidates = await db.select().from(mediaAssets).where(and(
    eq(mediaAssets.userId, userId),
    eq(mediaAssets.mediaType, "image"),
    eq(mediaAssets.category, "Pendiente de revisar"),
    or(isNull(mediaAssets.classificationSource), eq(mediaAssets.classificationSource, "initial"), eq(mediaAssets.classificationSource, "ai")),
  )).orderBy(desc(mediaAssets.createdAt)).limit(limit);
  return candidates.filter(asset => isBatchClassificationCandidate({ mediaType: asset.mediaType, category: asset.category, classificationSource: asset.classificationSource }));
}

export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionProjects).where(eq(constructionProjects.userId, userId)).orderBy(desc(constructionProjects.createdAt));
}

export async function createProject(userId: number, name: string, location?: string, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return Number((await db.insert(constructionProjects).values({ userId, name, location, notes }))[0].insertId);
}

export async function getContentSlotsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentSlots).where(eq(contentSlots.userId, userId)).orderBy(desc(contentSlots.scheduledDate));
}

export async function createContentSlot(userId: number, assetId: number, scheduledDate: string, format: "Feed" | "Stories" | "Reel", captionNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return Number((await db.insert(contentSlots).values({ userId, assetId, scheduledDate, format, captionNote }))[0].insertId);
}

export async function getContentSlotById(userId: number, id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(contentSlots).where(and(eq(contentSlots.userId, userId), eq(contentSlots.id, id))).limit(1))[0];
}

export async function updateContentSlot(userId: number, id: number, values: Partial<typeof contentSlots.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(contentSlots).set(values).where(and(eq(contentSlots.userId, userId), eq(contentSlots.id, id)));
  return getContentSlotById(userId, id);
}

export async function getFacebookConnectionByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(facebookConnections).where(eq(facebookConnections.userId, userId)).limit(1))[0];
}

export async function upsertFacebookConnection(userId: number, input: { pageId: string; pageName: string; accessTokenEncrypted: string; scopes: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(facebookConnections).values({ userId, ...input }).onDuplicateKeyUpdate({ set: { ...input, connectedAt: new Date() } });
  return getFacebookConnectionByUser(userId);
}

export async function getCleanupCandidatesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cleanupCandidates).where(eq(cleanupCandidates.userId, userId)).orderBy(desc(cleanupCandidates.createdAt));
}

export async function createCleanupCandidate(userId: number, assetId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(cleanupCandidates).where(and(eq(cleanupCandidates.userId, userId), eq(cleanupCandidates.assetId, assetId), eq(cleanupCandidates.reason, reason))).limit(1);
  if (existing[0]) return existing[0].id;
  return Number((await db.insert(cleanupCandidates).values({ userId, assetId, reason }))[0].insertId);
}

export async function updateCleanupCandidate(userId: number, id: number, status: "Aprobado" | "Descartado") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(cleanupCandidates).set({ status, reviewedAt: new Date() }).where(and(eq(cleanupCandidates.userId, userId), eq(cleanupCandidates.id, id)));
}

export async function createMediaExport(userId: number, assetId: number, preset: "Feed" | "Stories", width: number, height: number, storageKey: string, storageUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return Number((await db.insert(mediaExports).values({ userId, assetId, preset, width, height, storageKey, storageUrl }))[0].insertId);
}

export async function createMediaImport(userId: number, input: { label: string; requestedFiles: number; totalBytes: number; origin?: "Carga web" | "Recuperación temporal" }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return Number((await db.insert(mediaImports).values({ userId, origin: input.origin ?? "Carga web", ...input }))[0].insertId);
}

export async function getMediaImportsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaImports).where(eq(mediaImports.userId, userId)).orderBy(desc(mediaImports.createdAt)).limit(12);
}

export async function getMediaImportById(userId: number, importId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(mediaImports).where(and(eq(mediaImports.userId, userId), eq(mediaImports.id, importId))).limit(1))[0];
}

export async function recordMediaImportOutcome(userId: number, importId: number, outcome: "uploaded" | "duplicate" | "failed" | "skipped", quantity = 1) {
  if (!quantity) return;
  const db = await getDb();
  if (!db) return;
  const values = outcome === "uploaded" ? { uploadedFiles: sql`${mediaImports.uploadedFiles} + ${quantity}` }
    : outcome === "duplicate" ? { duplicateFiles: sql`${mediaImports.duplicateFiles} + ${quantity}` }
      : outcome === "failed" ? { failedFiles: sql`${mediaImports.failedFiles} + ${quantity}` }
        : { skippedFiles: sql`${mediaImports.skippedFiles} + ${quantity}` };
  await db.update(mediaImports).set(values).where(and(eq(mediaImports.userId, userId), eq(mediaImports.id, importId)));
}

export async function completeMediaImport(userId: number, importId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const item = await getMediaImportById(userId, importId);
  if (!item) throw new Error("Importación no encontrada");
  await db.update(mediaImports).set({ status: getImportCompletionStatus(item), completedAt: new Date() }).where(and(eq(mediaImports.userId, userId), eq(mediaImports.id, importId)));
  return getMediaImportById(userId, importId);
}

export async function getRecoverableLegacyImports(ownerUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    sourceUserId: mediaAssets.userId,
    mediaCount: count(mediaAssets.id),
    verifiedCount: sql<number>`SUM(CASE WHEN ${mediaAssets.backupVerified} THEN 1 ELSE 0 END)`,
  }).from(mediaAssets).innerJoin(users, eq(mediaAssets.userId, users.id)).where(and(
    ne(mediaAssets.userId, ownerUserId),
    isNull(mediaAssets.importId),
    isNull(users.name),
  )).groupBy(mediaAssets.userId);
}

export async function claimLegacyImport(ownerUserId: number, sourceUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.transaction(async tx => {
    const assets = await tx.select({ id: mediaAssets.id, sizeBytes: mediaAssets.sizeBytes }).from(mediaAssets).where(and(eq(mediaAssets.userId, sourceUserId), isNull(mediaAssets.importId)));
    if (!assets.length) return null;
    const totalBytes = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);
    const importId = Number((await tx.insert(mediaImports).values({
      userId: ownerUserId,
      label: "Recuperación del lote inicial",
      origin: "Recuperación temporal",
      requestedFiles: assets.length,
      uploadedFiles: assets.length,
      totalBytes,
      status: "Completada",
      completedAt: new Date(),
    }))[0].insertId);
    await tx.update(mediaAssets).set({ userId: ownerUserId, importId }).where(and(eq(mediaAssets.userId, sourceUserId), isNull(mediaAssets.importId)));
    await tx.update(cleanupCandidates).set({ userId: ownerUserId }).where(eq(cleanupCandidates.userId, sourceUserId));
    await tx.update(mediaExports).set({ userId: ownerUserId }).where(eq(mediaExports.userId, sourceUserId));
    await tx.update(contentSlots).set({ userId: ownerUserId }).where(eq(contentSlots.userId, sourceUserId));
    return { importId, mediaCount: assets.length };
  });
}
