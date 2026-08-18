import { describe, expect, it } from "vitest";
import { ALLOWED_EXTENSIONS, classifyFile, duplicateReviewReason, getMetaExportDimensions, shouldProposeBlurCleanup } from "./mediaRules";

describe("media upload safeguards", () => {
  it("accepts exactly the iPhone and desktop media formats required by the workspace", () => {
    [".heic", ".jpg", ".png", ".mov", ".mp4"].forEach(extension => {
      expect(ALLOWED_EXTENSIONS.has(extension)).toBe(true);
    });
    expect(ALLOWED_EXTENSIONS.has(".gif")).toBe(false);
    expect(ALLOWED_EXTENSIONS.has(".pdf")).toBe(false);
  });

  it("routes video files to the exact Videos category before AI review", () => {
    expect(classifyFile("deck-walkthrough.MOV", "video/quicktime")).toEqual({
      mediaType: "video",
      category: "Videos",
    });
  });

  it("routes screenshot filenames to the exact Capturas de pantalla category", () => {
    expect(classifyFile("Screenshot 2026-08-16.png", "image/png")).toEqual({
      mediaType: "image",
      category: "Capturas de pantalla",
    });
  });

  it("keeps unclassified images in Pendiente de revisar rather than making an unsafe assumption", () => {
    expect(classifyFile("IMG_8124.HEIC", "image/heic")).toEqual({
      mediaType: "image",
      category: "Pendiente de revisar",
    });
  });

  it("only proposes a blurry-file cleanup after a verified backup exists", () => {
    expect(shouldProposeBlurCleanup(false, 4)).toBe(false);
    expect(shouldProposeBlurCleanup(true, 4)).toBe(true);
    expect(shouldProposeBlurCleanup(true, 20)).toBe(false);
  });

  it("uses the exact Meta output sizes requested for Feed and Stories", () => {
    expect(getMetaExportDimensions("Feed")).toEqual({ width: 1080, height: 1350 });
    expect(getMetaExportDimensions("Stories")).toEqual({ width: 1080, height: 1920 });
  });

  it("records exact duplicates as review evidence instead of scheduling deletion", () => {
    expect(duplicateReviewReason("IMG_3001.HEIC")).toContain("Duplicado exacto detectado");
    expect(duplicateReviewReason("IMG_3001.HEIC")).toContain("IMG_3001.HEIC");
  });
});
