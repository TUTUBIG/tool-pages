/** Split top-level ABI type list on commas, respecting `()` and `[]` nesting. */
export function splitCommaSeparatedAbiTypes(input: string): string[] {
  const s = input.trim();
  if (!s) return [];
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      const t = cur.trim();
      if (t) out.push(t);
      cur = "";
      continue;
    }
    cur += ch;
  }
  const last = cur.trim();
  if (last) out.push(last);
  return out;
}
