import { describe, expect, it } from "vitest";
import { canRecoverLegacyImport, getImportCompletionStatus, isBatchClassificationCandidate, MAX_DIRECT_UPLOAD_BYTES, MAX_SERVER_UPLOAD_BYTES } from "./mediaImportRules";

describe("media import rules", () => {
  it("keeps server uploads conservative and supports direct uploads up to one GB", () => {
    expect(MAX_SERVER_UPLOAD_BYTES).toBe(250 * 1024 * 1024);
    expect(MAX_DIRECT_UPLOAD_BYTES).toBe(1024 * 1024 * 1024);
    expect(MAX_DIRECT_UPLOAD_BYTES).toBeGreaterThan(MAX_SERVER_UPLOAD_BYTES);
  });

  it("marks an import with duplicates or failures as requiring review", () => {
    expect(getImportCompletionStatus({ duplicateFiles: 0, failedFiles: 0, skippedFiles: 0 })).toBe("Completada");
    expect(getImportCompletionStatus({ duplicateFiles: 1, failedFiles: 0, skippedFiles: 0 })).toBe("Con incidencias");
    expect(getImportCompletionStatus({ duplicateFiles: 0, failedFiles: 1, skippedFiles: 0 })).toBe("Con incidencias");
  });

  it("allows recovery only for the configured project owner", () => {
    expect(canRecoverLegacyImport("owner", "owner")).toBe(true);
    expect(canRecoverLegacyImport("member", "owner")).toBe(false);
    expect(canRecoverLegacyImport("owner", "")).toBe(false);
  });

  it("never selects manually classified media for the automatic batch", () => {
    expect(isBatchClassificationCandidate({ mediaType: "image", category: "Pendiente de revisar", classificationSource: null })).toBe(true);
    expect(isBatchClassificationCandidate({ mediaType: "image", category: "Pendiente de revisar", classificationSource: "manual" })).toBe(false);
    expect(isBatchClassificationCandidate({ mediaType: "video", category: "Pendiente de revisar", classificationSource: "initial" })).toBe(false);
  });
});
