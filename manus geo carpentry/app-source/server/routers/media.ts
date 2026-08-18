import { TRPCError } from "@trpc/server";
import sharp from "sharp";
import { z } from "zod";
import { contentFormatValues, mediaCategoryValues, mediaStageValues } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "../_core/env";
import { invokeLLM } from "../_core/llm";
import { canRecoverLegacyImport } from "../mediaImportRules";
import { protectedProcedure, router } from "../_core/trpc";
import { storageGetSignedUrl, storagePut } from "../storage";
import { getMetaExportDimensions } from "../mediaRules";
import { decryptFacebookToken, isFacebookConfigured, publishFacebookPhoto, publishFacebookReel } from "../facebook";

const categorySchema = z.enum(mediaCategoryValues);
const stageSchema = z.enum(mediaStageValues);
const importInput = z.object({ label: z.string().min(3).max(180), requestedFiles: z.number().int().min(1).max(5000), totalBytes: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER) });
const contentFormatSchema = z.enum(contentFormatValues);
type ImageAsset = Awaited<ReturnType<typeof db.getMediaAssetById>>;

function isProjectOwner(openId: string) { return canRecoverLegacyImport(openId, ENV.ownerOpenId); }

async function classifyImageAsset(userId: number, asset: NonNullable<ImageAsset>) {
  if (asset.mediaType === "video") return db.updateMediaAsset(userId, asset.id, { category: "Videos", classificationSource: "initial", classificationConfidence: 100, classificationNote: "Video identificado por formato" });
  const signedUrl = await storageGetSignedUrl(asset.storageKey);
  const result = await invokeLLM({
    model: "gemini-3-flash-preview",
    messages: [{ role: "user", content: [
      { type: "text", text: "Clasifica esta imagen de una biblioteca privada de una empresa de carpintería. Usa exactamente una categoría y no infieras identidades. Si contiene una obra, materiales, herramientas, interiores construidos o exteriores terminados, usa Trabajos de Geo Carpentry. Si parece contenido privado, usa Personal. Si es una interfaz o captura de dispositivo, usa Capturas de pantalla. Si no puedes decidir, usa Pendiente de revisar." },
      { type: "image_url", image_url: { url: signedUrl, detail: "low" } },
    ] }],
    response_format: { type: "json_schema", json_schema: { name: "media_classification", strict: true, schema: {
      type: "object", properties: { category: { type: "string", enum: mediaCategoryValues }, confidence: { type: "integer", minimum: 0, maximum: 100 }, note: { type: "string", maxLength: 280 } }, required: ["category", "confidence", "note"], additionalProperties: false,
    } },
  }});
  const content = result.choices[0]?.message.content;
  if (typeof content !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La clasificación no devolvió un resultado válido" });
  const classified = JSON.parse(content) as { category: (typeof mediaCategoryValues)[number]; confidence: number; note: string };
  return db.updateMediaAsset(userId, asset.id, { category: classified.category, classificationSource: "ai", classificationConfidence: classified.confidence, classificationNote: classified.note });
}

export const mediaRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const owner = isProjectOwner(ctx.user.openId);
    const [assets, projects, slots, cleanup, imports, legacyImports] = await Promise.all([
      db.getMediaAssetsByUser(ctx.user.id), db.getProjectsByUser(ctx.user.id), db.getContentSlotsByUser(ctx.user.id), db.getCleanupCandidatesByUser(ctx.user.id), db.getMediaImportsByUser(ctx.user.id), owner ? db.getRecoverableLegacyImports(ctx.user.id) : Promise.resolve([]),
    ]);
    return { assets, projects, slots, cleanup, imports, legacyImports, isProjectOwner: owner };
  }),
  facebookStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!isProjectOwner(ctx.user.openId)) return { configured: false, connected: false, pageName: null as string | null };
    const connection = await db.getFacebookConnectionByUser(ctx.user.id);
    return { configured: isFacebookConfigured(), connected: Boolean(connection), pageName: connection?.pageName ?? null };
  }),

  startImport: protectedProcedure.input(importInput).mutation(({ ctx, input }) => db.createMediaImport(ctx.user.id, input)),
  recordImportClientOutcomes: protectedProcedure.input(z.object({ importId: z.number().int(), failedFiles: z.number().int().min(0).max(5000), skippedFiles: z.number().int().min(0).max(5000) })).mutation(async ({ ctx, input }) => {
    if (!await db.getMediaImportById(ctx.user.id, input.importId)) throw new TRPCError({ code: "NOT_FOUND", message: "Importación no encontrada" });
    await db.recordMediaImportOutcome(ctx.user.id, input.importId, "failed", input.failedFiles);
    await db.recordMediaImportOutcome(ctx.user.id, input.importId, "skipped", input.skippedFiles);
  }),
  completeImport: protectedProcedure.input(z.object({ importId: z.number().int() })).mutation(async ({ ctx, input }) => db.completeMediaImport(ctx.user.id, input.importId)),
  claimLegacyImport: protectedProcedure.input(z.object({ sourceUserId: z.number().int() })).mutation(async ({ ctx, input }) => {
    if (!isProjectOwner(ctx.user.openId)) throw new TRPCError({ code: "FORBIDDEN", message: "Solo el propietario del proyecto puede recuperar el lote inicial" });
    const result = await db.claimLegacyImport(ctx.user.id, input.sourceUserId);
    if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "El lote inicial ya fue recuperado o no existe" });
    return result;
  }),

  createProject: protectedProcedure.input(z.object({ name: z.string().min(2).max(180), location: z.string().max(220).optional(), notes: z.string().max(2000).optional() })).mutation(({ ctx, input }) => db.createProject(ctx.user.id, input.name, input.location, input.notes)),
  updateAsset: protectedProcedure.input(z.object({ assetId: z.number().int(), category: categorySchema.optional(), projectId: z.number().int().nullable().optional(), stage: stageSchema.nullable().optional(), reviewStatus: z.enum(["Pendiente", "Aprobado", "Excluir"]).optional() })).mutation(async ({ ctx, input }) => {
    if (!await db.getMediaAssetById(ctx.user.id, input.assetId)) throw new TRPCError({ code: "NOT_FOUND", message: "Archivo no encontrado" });
    const { assetId, category, ...rest } = input;
    return db.updateMediaAsset(ctx.user.id, assetId, category === undefined ? rest : { ...rest, category, classificationSource: "manual" });
  }),
  analyze: protectedProcedure.input(z.object({ assetId: z.number().int() })).mutation(async ({ ctx, input }) => {
    const asset = await db.getMediaAssetById(ctx.user.id, input.assetId);
    if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Archivo no encontrado" });
    return classifyImageAsset(ctx.user.id, asset);
  }),
  analyzeBatch: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(20).default(12) })).mutation(async ({ ctx, input }) => {
    const candidates = await db.getBatchClassificationCandidates(ctx.user.id, input.limit);
    let processed = 0; let failed = 0;
    for (const asset of candidates) {
      try { await classifyImageAsset(ctx.user.id, asset); processed += 1; } catch { failed += 1; }
    }
    return { requested: candidates.length, processed, failed };
  }),

  createExport: protectedProcedure.input(z.object({ assetId: z.number().int(), preset: z.enum(["Feed", "Stories"]) })).mutation(async ({ ctx, input }) => {
    const asset = await db.getMediaAssetById(ctx.user.id, input.assetId);
    if (!asset || asset.mediaType !== "image") throw new TRPCError({ code: "BAD_REQUEST", message: "Solo las imágenes pueden exportarse en este formato" });
    const target = getMetaExportDimensions(input.preset);
    const source = Buffer.from(await (await fetch(await storageGetSignedUrl(asset.storageKey))).arrayBuffer());
    const output = await sharp(source, { failOn: "none" }).rotate().resize({ ...target, fit: "cover", position: "attention" }).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toBuffer();
    const storage = await storagePut(`users/${ctx.user.id}/exports/${input.preset.toLowerCase()}/${asset.id}.jpg`, output, "image/jpeg");
    return { exportId: await db.createMediaExport(ctx.user.id, asset.id, input.preset, target.width, target.height, storage.key, storage.url), ...storage, ...target };
  }),
  assignToCalendar: protectedProcedure.input(z.object({ assetId: z.number().int(), scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), format: contentFormatSchema, captionNote: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    if (!await db.getMediaAssetById(ctx.user.id, input.assetId)) throw new TRPCError({ code: "NOT_FOUND", message: "Archivo no encontrado" });
    return db.createContentSlot(ctx.user.id, input.assetId, input.scheduledDate, input.format, input.captionNote);
  }),
  readyForFacebook: protectedProcedure.input(z.object({ slotId: z.number().int() })).mutation(async ({ ctx, input }) => {
    if (!isProjectOwner(ctx.user.openId)) throw new TRPCError({ code: "FORBIDDEN", message: "Solo el propietario puede preparar publicaciones de Facebook" });
    const slot = await db.getContentSlotById(ctx.user.id, input.slotId);
    const asset = slot ? await db.getMediaAssetById(ctx.user.id, slot.assetId) : undefined;
    if (!slot || !asset || !asset.backupVerified) throw new TRPCError({ code: "NOT_FOUND", message: "El borrador no tiene un medio respaldado y verificable" });
    if (slot.format === "Feed" && asset.mediaType !== "image") throw new TRPCError({ code: "BAD_REQUEST", message: "Para una publicación de Feed, selecciona una imagen" });
    if (slot.format === "Reel" && asset.mediaType !== "video") throw new TRPCError({ code: "BAD_REQUEST", message: "Para un Reel, selecciona un video" });
    if (slot.format === "Stories") throw new TRPCError({ code: "BAD_REQUEST", message: "Las Stories conservan el borrador; esta versión publica Feed y Reels de Facebook" });
    return db.updateContentSlot(ctx.user.id, slot.id, { status: "Listo para publicar", publishError: null });
  }),
  publishToFacebook: protectedProcedure.input(z.object({ slotId: z.number().int() })).mutation(async ({ ctx, input }) => {
    if (!isProjectOwner(ctx.user.openId)) throw new TRPCError({ code: "FORBIDDEN", message: "Solo el propietario puede publicar en Facebook" });
    const [slot, connection] = await Promise.all([db.getContentSlotById(ctx.user.id, input.slotId), db.getFacebookConnectionByUser(ctx.user.id)]);
    if (!slot || slot.status !== "Listo para publicar") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Primero prepara y revisa el borrador antes de publicar" });
    if (!connection) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Conecta tu Página de Facebook antes de publicar" });
    const asset = await db.getMediaAssetById(ctx.user.id, slot.assetId);
    if (!asset || !asset.backupVerified) throw new TRPCError({ code: "NOT_FOUND", message: "El medio no está disponible para publicación" });
    try {
      const token = decryptFacebookToken(connection.accessTokenEncrypted);
      const sourceUrl = await storageGetSignedUrl(asset.storageKey);
      const caption = slot.captionNote || "";
      const facebookPostId = slot.format === "Reel"
        ? await publishFacebookReel({ pageId: connection.pageId, pageAccessToken: token, videoUrl: sourceUrl, description: caption })
        : await publishFacebookPhoto({ pageId: connection.pageId, pageAccessToken: token, imageUrl: sourceUrl, caption });
      await db.updateContentSlot(ctx.user.id, slot.id, { status: "Publicado", facebookPostId, publishedAt: new Date(), publishError: null });
      return { facebookPostId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Facebook rechazó la publicación";
      await db.updateContentSlot(ctx.user.id, slot.id, { status: "Error", publishError: message });
      throw new TRPCError({ code: "BAD_REQUEST", message });
    }
  }),
  reviewCleanup: protectedProcedure.input(z.object({ candidateId: z.number().int(), status: z.enum(["Aprobado", "Descartado"]) })).mutation(async ({ ctx, input }) => {
    await db.updateCleanupCandidate(ctx.user.id, input.candidateId, input.status);
    return { success: true, notice: "La aprobación queda registrada; la aplicación nunca elimina archivos del iPhone por sí sola." };
  }),
});
