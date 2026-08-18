import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const mediaCategoryValues = [
  "Trabajos de Geo Carpentry",
  "Personal",
  "Capturas de pantalla",
  "Videos",
  "Pendiente de revisar",
] as const;

export const mediaStageValues = ["Antes", "Durante", "Después"] as const;
export const mediaImportStatusValues = ["En progreso", "Completada", "Con incidencias"] as const;
export const mediaImportOriginValues = ["Carga web", "Recuperación temporal"] as const;
export const contentFormatValues = ["Feed", "Stories", "Reel"] as const;
export const contentSlotStatusValues = ["Borrador", "Aprobado", "Listo para publicar", "Publicado", "Error"] as const;

export const mediaImports = mysqlTable("media_imports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  label: varchar("label", { length: 180 }).notNull(),
  origin: mysqlEnum("origin", mediaImportOriginValues).default("Carga web").notNull(),
  requestedFiles: int("requestedFiles").default(0).notNull(),
  uploadedFiles: int("uploadedFiles").default(0).notNull(),
  duplicateFiles: int("duplicateFiles").default(0).notNull(),
  failedFiles: int("failedFiles").default(0).notNull(),
  skippedFiles: int("skippedFiles").default(0).notNull(),
  totalBytes: bigint("totalBytes", { mode: "number" }).default(0).notNull(),
  status: mysqlEnum("status", mediaImportStatusValues).default("En progreso").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  importId: int("importId").references(() => mediaImports.id),
  originalFilename: varchar("originalFilename", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  checksumSha256: varchar("checksumSha256", { length: 64 }).notNull(),
  storageKey: text("storageKey").notNull(),
  storageUrl: text("storageUrl").notNull(),
  backupVerified: boolean("backupVerified").default(false).notNull(),
  category: mysqlEnum("category", mediaCategoryValues).default("Pendiente de revisar").notNull(),
  classificationSource: mysqlEnum("classificationSource", ["initial", "ai", "manual"]),
  classificationConfidence: int("classificationConfidence"),
  classificationNote: text("classificationNote"),
  blurScore: int("blurScore"),
  duplicateOfId: int("duplicateOfId"),
  projectId: int("projectId"),
  stage: mysqlEnum("stage", mediaStageValues),
  reviewStatus: mysqlEnum("reviewStatus", ["Pendiente", "Aprobado", "Excluir"]).default("Pendiente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const constructionProjects = mysqlTable("construction_projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 180 }).notNull(),
  location: varchar("location", { length: 220 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const mediaExports = mysqlTable("media_exports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  assetId: int("assetId").notNull().references(() => mediaAssets.id),
  preset: mysqlEnum("preset", ["Feed", "Stories"]).notNull(),
  width: int("width").notNull(),
  height: int("height").notNull(),
  storageKey: text("storageKey").notNull(),
  storageUrl: text("storageUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contentSlots = mysqlTable("content_slots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  assetId: int("assetId").notNull().references(() => mediaAssets.id),
  scheduledDate: varchar("scheduledDate", { length: 16 }).notNull(),
  format: mysqlEnum("format", contentFormatValues).notNull(),
  captionNote: text("captionNote"),
  status: mysqlEnum("status", contentSlotStatusValues).default("Borrador").notNull(),
  facebookPostId: varchar("facebookPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  publishError: text("publishError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const facebookConnections = mysqlTable("facebook_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  pageId: varchar("pageId", { length: 80 }).notNull(),
  pageName: varchar("pageName", { length: 240 }).notNull(),
  accessTokenEncrypted: text("accessTokenEncrypted").notNull(),
  scopes: text("scopes"),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cleanupCandidates = mysqlTable("cleanup_candidates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  assetId: int("assetId").notNull().references(() => mediaAssets.id),
  reason: varchar("reason", { length: 240 }).notNull(),
  status: mysqlEnum("status", ["Propuesto", "Aprobado", "Descartado"]).default("Propuesto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;
export type ConstructionProject = typeof constructionProjects.$inferSelect;
export type ContentSlot = typeof contentSlots.$inferSelect;
export type CleanupCandidate = typeof cleanupCandidates.$inferSelect;
export type MediaImport = typeof mediaImports.$inferSelect;
export type FacebookConnection = typeof facebookConnections.$inferSelect;
