"use client";

import { Clipboard, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";

export function UuidTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copyAllDone, setCopyAllDone] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const generate = useCallback(() => {
    const n = Math.min(50, Math.max(1, Math.floor(Number(count)) || 1));
    setCount(n);
    const next: string[] = [];
    for (let i = 0; i < n; i++) {
      next.push(crypto.randomUUID());
    }
    setUuids(next);
  }, [count]);

  const copyOne = useCallback(async (index: number, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(index);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  const copyAll = useCallback(async () => {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopyAllDone(true);
      window.setTimeout(() => setCopyAllDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [uuids]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-center">
        <label className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Count
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 sm:w-28"
          />
        </label>
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 dark:shadow-indigo-500/20"
        >
          <RefreshCw className="h-5 w-5" aria-hidden />
          Generate UUIDs
        </button>
        <button
          type="button"
          onClick={() => void copyAll()}
          disabled={uuids.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        >
          <Clipboard className="h-5 w-5" aria-hidden />
          {copyAllDone ? "Copied all" : "Copy all"}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          UUID v4
        </h2>
        {uuids.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Choose a count and click Generate to create random UUIDs (RFC 4122 version 4).
          </p>
        ) : (
          <ul className="space-y-2">
            {uuids.map((id, i) => (
              <li
                key={`${id}-${i}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-950"
              >
                <span className="min-w-0 flex-1 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
                  {id}
                </span>
                <button
                  type="button"
                  onClick={() => void copyOne(i, id)}
                  className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                >
                  {copiedId === i ? "Copied" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
