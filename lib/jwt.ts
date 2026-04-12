export type JwtParseResult =
  | {
      ok: true;
      header: string;
      payload: string;
      signatureB64url: string;
    }
  | { ok: false; error: string };

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function bytesToBase64Url(data: Uint8Array | ArrayBuffer): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return uint8ToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(segment: string): Uint8Array | null {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad === 0 ? normalized : normalized + "=".repeat(4 - pad);
  try {
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

function decodeJwtPart(segment: string): { ok: true; json: string } | { ok: false; error: string } {
  const bytes = base64UrlToBytes(segment);
  if (!bytes) {
    return { ok: false, error: "Invalid Base64url segment." };
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, error: "Segment is not valid UTF-8." };
  }
  try {
    const parsed = JSON.parse(text) as unknown;
    return { ok: true, json: JSON.stringify(parsed, null, 2) };
  } catch {
    return { ok: false, error: "Segment is not valid JSON." };
  }
}

export function parseJwt(token: string): JwtParseResult {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "A JWT must have three dot-separated parts." };
  }
  const [h, p, sig] = parts;
  const headerResult = decodeJwtPart(h);
  if (!headerResult.ok) {
    return { ok: false, error: `Header: ${headerResult.error}` };
  }
  const payloadResult = decodeJwtPart(p);
  if (!payloadResult.ok) {
    return { ok: false, error: `Payload: ${payloadResult.error}` };
  }
  return {
    ok: true,
    header: headerResult.json,
    payload: payloadResult.json,
    signatureB64url: sig,
  };
}

function minifyJson(text: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const v = JSON.parse(text) as unknown;
    return { ok: true, value: JSON.stringify(v) };
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
}

export async function signJwtHs256(
  headerJson: string,
  payloadJson: string,
  secret: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  if (secret.length === 0) {
    return { ok: false, error: "Secret cannot be empty." };
  }
  const h = minifyJson(headerJson);
  if (!h.ok) return { ok: false, error: `Header: ${h.error}` };
  const p = minifyJson(payloadJson);
  if (!p.ok) return { ok: false, error: `Payload: ${p.error}` };

  const headerObj = JSON.parse(h.value) as Record<string, unknown>;
  if (headerObj.alg !== "HS256") {
    return { ok: false, error: 'Header must include "alg": "HS256" for this generator.' };
  }

  const enc = new TextEncoder();
  const headerPart = bytesToBase64Url(enc.encode(h.value));
  const payloadPart = bytesToBase64Url(enc.encode(p.value));
  const signingInput = `${headerPart}.${payloadPart}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(signingInput));
  const sigPart = bytesToBase64Url(sigBuf);
  return { ok: true, token: `${signingInput}.${sigPart}` };
}
