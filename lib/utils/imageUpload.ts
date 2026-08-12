/**
 * Deteksi tipe gambar dari magic bytes (bukan header MIME / nama file)
 * yang bisa dipalsukan. Hanya mengizinkan JPEG, PNG, dan WebP.
 */
export function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSignature.every((byte, i) => buffer[i] === byte)) {
    return { mime: "image/png", ext: "png" };
  }

  // WebP: "RIFF" .... "WEBP"
  const riff = buffer.toString("latin1", 0, 4);
  const webp = buffer.toString("latin1", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }

  return null;
}

export function isAllowedImageMime(mime: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(mime);
}
