export type UrlDecodeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function encodeUrlComponent(text: string): string {
  return encodeURIComponent(text);
}

export function decodeUrlComponent(text: string): UrlDecodeResult {
  try {
    return { ok: true, value: decodeURIComponent(text) };
  } catch {
    return { ok: false, error: "Invalid percent-encoding in input." };
  }
}
