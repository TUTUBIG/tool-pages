"use client";

import { Terminal } from "lucide-react";
import { useMemo, useState } from "react";

function runRegex(
  pattern: string,
  flags: string,
  haystack: string,
): { matches: { m: string; index: number }[]; error: string | null } {
  try {
    const re = new RegExp(pattern, flags);
    const out: { m: string; index: number }[] = [];
    if (flags.includes("g")) {
      let x: RegExpExecArray | null;
      const copy = new RegExp(re.source, re.flags);
      while ((x = copy.exec(haystack)) !== null) {
        out.push({ m: x[0], index: x.index });
        if (x[0].length === 0) copy.lastIndex++;
      }
    } else {
      const x = re.exec(haystack);
      if (x) out.push({ m: x[0], index: x.index });
    }
    return { matches: out, error: null };
  } catch (e) {
    return {
      matches: [],
      error: e instanceof Error ? e.message : "Invalid regex",
    };
  }
}

export function RegexTool() {
  const [pattern, setPattern] = useState(String.raw`\b\w{4,}\b`);
  const [flags, setFlags] = useState("g");
  const [haystack, setHaystack] = useState("The quick brown fox jumps over the lazy dog.");

  const { matches, error } = useMemo(
    () => runRegex(pattern, flags, haystack),
    [pattern, flags, haystack],
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <label className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          Pattern
        </label>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="mb-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          spellCheck={false}
        />
        <label className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          Flags (e.g. g i m)
        </label>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
          className="mb-4 w-32 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
        />
        <label className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          Test string
        </label>
        <textarea
          value={haystack}
          onChange={(e) => setHaystack(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
        />
        {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          <Terminal className="h-4 w-4" />
          Matches ({matches.length})
        </div>
        <ul className="max-h-64 space-y-2 overflow-auto font-mono text-sm">
          {matches.map((row, i) => (
            <li key={`${row.index}-${i}`} className="text-neutral-800 dark:text-neutral-200">
              <span className="text-neutral-500 dark:text-neutral-500">@{row.index}:</span>{" "}
              <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">{row.m}</code>
            </li>
          ))}
          {!error && matches.length === 0 ? <li className="text-neutral-500">No matches.</li> : null}
        </ul>
      </div>
    </div>
  );
}
