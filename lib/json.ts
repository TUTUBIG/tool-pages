export type JsonOk<T> = { ok: true; value: T };
export type JsonErr = { ok: false; error: string };
export type JsonResult<T> = JsonOk<T> | JsonErr;

export function validateJson(input: string): JsonResult<unknown> {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Enter JSON to validate." };
  }
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON.";
    return { ok: false, error: msg };
  }
}

export function formatJson(input: string, indent = 2): JsonResult<string> {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Enter JSON to format." };
  }
  try {
    const value = JSON.parse(input);
    return { ok: true, value: JSON.stringify(value, null, indent) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON.";
    return { ok: false, error: msg };
  }
}
