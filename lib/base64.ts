export type DecodeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Normalize common Base64 variants (whitespace, URL-safe alphabet). */
export function normalizeBase64Input(input: string): string {
  return input.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
}

export function encodeUtf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function decodeBase64ToUtf8(input: string): DecodeResult {
  const normalized = normalizeBase64Input(input);
  if (normalized.length === 0) {
    return { ok: true, value: "" };
  }
  try {
    const pad = normalized.length % 4;
    const padded =
      pad === 0 ? normalized : normalized + "=".repeat(4 - pad);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { ok: true, value: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: "Invalid Base64 input." };
  }
}
