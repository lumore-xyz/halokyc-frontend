export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_ASPECT_RATIO = 4;

export type FileValidationResult =
  | { ok: true }
  | { ok: false; code: FileValidationError; message: string };

export type FileValidationError =
  | "empty"
  | "wrong_type"
  | "too_large"
  | "corrupt"
  | "extreme_aspect";

export function validateVerifyFile(file: File): FileValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, code: "empty", message: "Choose a non-empty photo." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      code: "too_large",
      message: `Photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 50 MB.`,
    };
  }
  const allowed = ALLOWED_MIME_TYPES as ReadonlyArray<string>;
  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      code: "wrong_type",
      message: "Use a JPEG, PNG, or WEBP photo.",
    };
  }
  return { ok: true };
}

export type AspectCheckResult = {
  ok: boolean;
  width: number;
  height: number;
  message: string | null;
};

export function checkImageAspect(file: File): Promise<AspectCheckResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (width === 0 || height === 0) {
        resolve({ ok: false, width, height, message: "The photo is corrupt." });
        return;
      }
      const ratio = width / height;
      const extreme = ratio > MAX_ASPECT_RATIO || ratio < 1 / MAX_ASPECT_RATIO;
      resolve({
        ok: !extreme,
        width,
        height,
        message: extreme
          ? "This photo looks like a screen capture. Use a real camera photo."
          : null,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        ok: false,
        width: 0,
        height: 0,
        message: "The photo could not be read. Choose another file.",
      });
    };
    img.src = url;
  });
}
