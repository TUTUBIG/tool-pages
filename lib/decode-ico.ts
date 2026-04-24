const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function isPngSlice(data: Uint8Array): boolean {
  if (data.length < PNG_MAGIC.length) return false;
  for (let i = 0; i < PNG_MAGIC.length; i++) {
    if (data[i] !== PNG_MAGIC[i]) return false;
  }
  return true;
}

/** Read width/height from PNG IHDR (big-endian). */
export function readPngDimensions(png: Uint8Array): { width: number; height: number } {
  if (png.length < 24 || !isPngSlice(png)) throw new Error("Invalid PNG buffer.");
  const dv = new DataView(png.buffer, png.byteOffset + 16, 8);
  return {
    width: dv.getUint32(0, false),
    height: dv.getUint32(4, false),
  };
}

export type IcoPngLayer = {
  /** Declared in ICO directory (1–256; 0 means 256 in file). */
  dirWidth: number;
  dirHeight: number;
  data: Uint8Array;
  /** From PNG IHDR when readable. */
  pngWidth: number;
  pngHeight: number;
};

/**
 * Parse an ICO and return embedded PNG images only (Vista-style ICO).
 * BMP/DIB layers are skipped.
 */
export function decodeIcoPngLayers(bytes: Uint8Array): IcoPngLayer[] {
  if (bytes.byteLength < 22) throw new Error("File too small to be an ICO.");
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (v.getUint16(0, true) !== 0) throw new Error("Invalid ICO (reserved != 0).");
  const type = v.getUint16(2, true);
  if (type !== 1) throw new Error("Not an icon resource (expected type 1).");
  const count = v.getUint16(4, true);
  if (count === 0 || count > 255) throw new Error("Invalid ICO image count.");

  const out: IcoPngLayer[] = [];

  for (let i = 0; i < count; i++) {
    const o = 6 + i * 16;
    let dw = bytes[o]!;
    let dh = bytes[o + 1]!;
    if (dw === 0) dw = 256;
    if (dh === 0) dh = 256;
    const size = v.getUint32(o + 8, true);
    const offset = v.getUint32(o + 12, true);
    if (size > bytes.byteLength || offset > bytes.byteLength - size) {
      throw new Error("ICO directory points outside the file.");
    }
    const slice = bytes.subarray(offset, offset + size);
    if (!isPngSlice(slice)) continue;

    let pngW = dw;
    let pngH = dh;
    try {
      const d = readPngDimensions(slice);
      pngW = d.width;
      pngH = d.height;
    } catch {
      /* keep directory dimensions */
    }

    out.push({
      dirWidth: dw,
      dirHeight: dh,
      data: slice,
      pngWidth: pngW,
      pngHeight: pngH,
    });
  }

  if (out.length === 0) {
    throw new Error("No PNG layers found. BMP-only ICO files are not supported.");
  }

  return out;
}
