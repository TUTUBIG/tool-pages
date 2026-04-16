"use client";

import { Clipboard, Square } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function normalizeColorInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("#")) return t;
  if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(t)) return `#${t}`;
  return t;
}

function isSupportedColor(value: string): boolean {
  if (!value || typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("color", value) || CSS.supports("background-color", value);
}

export function ColorViewTool() {
  const [input, setInput] = useState("#6366f1");
  const [copyDone, setCopyDone] = useState(false);

  const normalized = useMemo(() => normalizeColorInput(input), [input]);
  const valid = useMemo(() => isSupportedColor(normalized), [normalized]);

  const copy = useCallback(async () => {
    if (!normalized || !valid) return;
    try {
      await navigator.clipboard.writeText(normalized);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [normalized, valid]);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Supports hex (<code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">#rgb</code>,{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">#rrggbb</code>),{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">rgb()</code>,{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">hsl()</code>, and CSS color
        keywords (e.g. <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">tomato</code>
        ).
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <label
          htmlFor="color-code-input"
          className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400"
        >
          Color code
        </label>
        <input
          id="color-code-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-base text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder="#22c55e or rgb(34, 197, 94)"
          spellCheck={false}
          autoComplete="off"
        />
        {normalized && !valid ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">This browser does not recognize that color value.</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">Preview</span>
          <button
            type="button"
            disabled={!valid || !normalized}
            onClick={() => void copy()}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 disabled:opacity-40 dark:text-indigo-400"
          >
            <Clipboard className="h-4 w-4" />
            {copyDone ? "Copied" : "Copy value"}
          </button>
        </div>
        <div
          className={`flex min-h-[min(40vh,280px)] w-full items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 ${
            !valid || !normalized ? "bg-neutral-100 dark:bg-neutral-800" : ""
          }`}
          style={valid && normalized ? { backgroundColor: normalized } : undefined}
        >
          {!valid || !normalized ? (
            <span className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Square className="h-5 w-5 shrink-0" aria-hidden />
              Enter a valid color to preview it here.
            </span>
          ) : (
            <span className="rounded-lg bg-black/35 px-3 py-1.5 font-mono text-sm font-medium text-white shadow-sm backdrop-blur-sm">
              {normalized}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
