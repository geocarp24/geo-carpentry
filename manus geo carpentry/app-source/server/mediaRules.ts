export const mediaCategoryValues = [
  "Trabajos de Geo Carpentry",
  "Personal",
  "Capturas de pantalla",
  "Videos",
  "Pendiente de revisar",
] as const;

export const mediaStageValues = ["Antes", "Durante", "Después"] as const;

export const ALLOWED_EXTENSIONS = new Set([".heic", ".heif", ".jpg", ".jpeg", ".png", ".mov", ".mp4"]);

export function classifyFile(filename: string, mimeType: string) {
  const lowerName = filename.toLowerCase();
  const mediaType = mimeType.startsWith("video/") || /\.(mov|mp4)$/i.test(filename) ? "video" as const : "image" as const;
  if (mediaType === "video") return { mediaType, category: "Videos" as const };
  if (lowerName.includes("screenshot") || lowerName.includes("captura")) return { mediaType, category: "Capturas de pantalla" as const };
  return { mediaType, category: "Pendiente de revisar" as const };
}

export function shouldProposeBlurCleanup(backupVerified: boolean, blurScore: number | null) {
  return backupVerified && blurScore !== null && blurScore < 12;
}

export function duplicateReviewReason(filename: string) {
  return `Duplicado exacto detectado durante la carga: ${filename}`;
}

export function getMetaExportDimensions(preset: "Feed" | "Stories") {
  return preset === "Feed" ? { width: 1080, height: 1350 } : { width: 1080, height: 1920 };
}
