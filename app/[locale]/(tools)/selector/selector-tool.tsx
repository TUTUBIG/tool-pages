"use client";

import { Clipboard, Code2 } from "lucide-react";
import { Interface, type FunctionFragment } from "ethers";
import { useCallback, useState } from "react";

function normalizeSignature(raw: string): string {
  const s = raw.trim();
  if (!s) throw new Error("Signature is empty.");
  if (/^function\s/i.test(s)) return s;
  return `function ${s}`;
}

export function SelectorTool() {
  const [input, setInput] = useState("transfer(address,uint256)");
  const [selector, setSelector] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const run = useCallback(() => {
    setError(null);
    try {
      const decl = normalizeSignature(input);
      const iface = new Interface([decl]);
      const fn = iface.fragments.find((f): f is FunctionFragment => f.type === "function");
      if (!fn) {
        throw new Error("Expected a single function declaration.");
      }
      setSelector(fn.selector);
      setHasRun(true);
    } catch (e) {
      setSelector("");
      setHasRun(true);
      setError(e instanceof Error ? e.message : "Could not parse signature.");
    }
  }, [input]);

  const clear = useCallback(() => {
    setInput("");
    setSelector("");
    setError(null);
    setHasRun(false);
  }, []);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      setError("Clipboard access was denied. Paste manually (⌘V / Ctrl+V).");
    }
  }, []);

  const copyResult = useCallback(async () => {
    if (!hasRun || error || !selector) return;
    try {
      await navigator.clipboard.writeText(selector);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [hasRun, error, selector]);

  const showError = Boolean(error);
  const copyDisabled = !hasRun || Boolean(error) || !selector;

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Use the canonical form{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">
          name(type1,type2)
        </code>
        . The{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">function</code>{" "}
        keyword is optional.
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="selector-input"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Function signature
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clear}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={paste}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              Paste
            </button>
          </div>
        </div>
        <textarea
          id="selector-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-28 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder="transfer(address,uint256)"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={run}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:shadow-indigo-500/20 dark:focus-visible:ring-offset-neutral-950"
        >
          <Code2 className="h-5 w-5" aria-hidden />
          Compute selector
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            4-byte selector
          </span>
          <button
            type="button"
            onClick={copyResult}
            disabled={copyDisabled}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400"
          >
            <Clipboard className="h-4 w-4" aria-hidden />
            {copyDone ? "Copied" : "Copy"}
          </button>
        </div>
        <div
          role="status"
          aria-live="polite"
          className={`min-h-[80px] w-full whitespace-pre-wrap break-all rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 ${
            showError ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-100"
          } ${!hasRun && !error ? "text-neutral-500 dark:text-neutral-500" : ""}`}
        >
          {error ??
            (hasRun && selector
              ? selector
              : hasRun
                ? ""
                : "Result appears here after Compute selector.")}
        </div>
      </div>
    </div>
  );
}
