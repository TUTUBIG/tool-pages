/**
 * Build a Windows ICO containing PNG-encoded images (Vista+).
 * Each `data` buffer must be a full PNG file (magic 0x89 "PNG\r\n\x1a\n").
 */
export function encodeIcoFromPngs(
  images: readonly { width: number; height: number; data: Uint8Array }[],
): Uint8Array {
  const count = images.length;
  if (count === 0 || count > 255) {
    throw new Error("ICO must contain between 1 and 255 images.");
  }
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + count * entrySize;
  let offset = dirSize;
  const totalSize = dirSize + images.reduce((s, img) => s + img.data.length, 0);
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  for (let i = 0; i < count; i++) {
    const img = images[i]!;
    const eoff = headerSize + i * entrySize;
    const w = img.width >= 256 ? 0 : img.width;
    const h = img.height >= 256 ? 0 : img.height;
    out[eoff] = w;
    out[eoff + 1] = h;
    out[eoff + 2] = 0;
    out[eoff + 3] = 0;
    view.setUint16(eoff + 4, 1, true);
    view.setUint16(eoff + 6, 0, true);
    view.setUint32(eoff + 8, img.data.length, true);
    view.setUint32(eoff + 12, offset, true);
    out.set(img.data, offset);
    offset += img.data.length;
  }

  return out;
}
