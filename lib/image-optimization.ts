"use client";

export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 50_000_000;

export type OptimizedCarImage = {
  full: File;
  thumbnail: File;
};

async function resizeToWebp(file: File, maxWidth: number, quality: number, suffix: string) {
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > MAX_SOURCE_PIXELS) throw new Error("Image resolution is too large");
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("WebP conversion failed")), "image/webp", quality);
    });
    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || "car";
    return new File([blob], `${stem}-${suffix}.webp`, { type: "image/webp", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

export async function optimizeCarImage(file: File): Promise<OptimizedCarImage> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error("The source image must be 10 MB or smaller");
  const [full, thumbnail] = await Promise.all([
    resizeToWebp(file, 1920, 0.82, "full"),
    resizeToWebp(file, 640, 0.76, "thumb"),
  ]);
  return { full, thumbnail };
}
