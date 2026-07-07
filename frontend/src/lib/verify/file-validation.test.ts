import { describe, expect, it } from "vitest";

import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_BYTES,
  checkImageAspect,
  validateVerifyFile,
} from "./file-validation";

function fakeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateVerifyFile", () => {
  it("accepts jpeg, png, and webp under the size cap", () => {
    for (const type of ALLOWED_MIME_TYPES) {
      const file = fakeFile("selfie.jpg", type, 1024);
      expect(validateVerifyFile(file).ok).toBe(true);
    }
  });

  it("rejects empty files", () => {
    const file = fakeFile("selfie.jpg", "image/jpeg", 0);
    const result = validateVerifyFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("empty");
  });

  it("rejects files above 8 MB", () => {
    const file = fakeFile("selfie.jpg", "image/jpeg", MAX_FILE_BYTES + 1);
    const result = validateVerifyFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("too_large");
  });

  it("rejects non-image MIME types", () => {
    const file = fakeFile("selfie.heic", "image/heic", 1024);
    const result = validateVerifyFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("wrong_type");
  });

  it("rejects PDF and video uploads", () => {
    const pdf = fakeFile("selfie.pdf", "application/pdf", 1024);
    const mp4 = fakeFile("selfie.mp4", "video/mp4", 1024);
    expect(validateVerifyFile(pdf).ok).toBe(false);
    expect(validateVerifyFile(mp4).ok).toBe(false);
  });
});

describe("checkImageAspect", () => {
  it("flags corrupt images that fail to decode", async () => {
    const hasObjectURL =
      typeof URL.createObjectURL === "function" &&
      typeof URL.revokeObjectURL === "function";
    if (!hasObjectURL) {
      // happy-dom does not implement URL.createObjectURL. The function is
      // exercised in real browser runs; skip in jsdom/happy-dom.
      return;
    }
    const file = fakeFile("selfie.jpg", "image/jpeg", 1024);
    const result = await checkImageAspect(file);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/corrupt|could not be read/);
  });
});