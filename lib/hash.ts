export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const HEX = "0123456789abcdef";

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    s += HEX[b >> 4] + HEX[b & 0xf];
  }
  return s;
}

export async function digestText(algorithm: HashAlgorithm, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(hash);
}
