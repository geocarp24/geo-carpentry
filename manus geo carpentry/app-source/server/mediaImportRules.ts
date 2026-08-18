export const MAX_SERVER_UPLOAD_BYTES = 250 * 1024 * 1024;
export const MAX_DIRECT_UPLOAD_BYTES = 1024 * 1024 * 1024;

export type ImportCounters = {
  duplicateFiles: number;
  failedFiles: number;
  skippedFiles: number;
};

export function getImportCompletionStatus(counters: ImportCounters) {
  return counters.duplicateFiles + counters.failedFiles + counters.skippedFiles > 0 ? "Con incidencias" as const : "Completada" as const;
}

export function canRecoverLegacyImport(currentOpenId: string, ownerOpenId: string) {
  return Boolean(ownerOpenId) && currentOpenId === ownerOpenId;
}

export function isBatchClassificationCandidate(asset: { mediaType: "image" | "video"; category: string; classificationSource: "initial" | "ai" | "manual" | null }) {
  return asset.mediaType === "image" && asset.category === "Pendiente de revisar" && asset.classificationSource !== "manual";
}
