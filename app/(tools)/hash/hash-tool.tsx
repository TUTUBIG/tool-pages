"use client";

import { Clipboard, Fingerprint } from "lucide-react";
import { useCallback, useState } from "react";
import { type HashAlgorithm, digestText } from "@/lib/hash";

const ALGORITHMS: HashAlgorithm[] = ["SHA-256", "SHA-384", "SHA-512", "SHA-1"];

const PLACEHOLDER = "Hex digest will appear here...";

export function HashTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const runHash = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const hex = await digestText(algorithm, input);
      setOutput(hex);
      setHasRun(true);
    } catch {
      setOutput("");
      setError("Could not compute hash.");
    } finally {
      setBusy(false);
    }
  }, [input, algorithm]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
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
    if (!hasRun || error || !output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [hasRun, error, output]);

  const displayText = error ?? (!hasRun && !error ? PLACEHOLDER : output);
  const showError = Boolean(error);
  const mutedOutput = !hasRun && !error;
  const copyDisabled = !hasRun || Boolean(error);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="hash-input"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Input
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
          id="hash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-48 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder="Text to hash..."
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="sr-only sm:not-sr-only sm:inline">Algorithm</span>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {ALGORITHMS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void runHash()}
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 disabled:opacity-60 dark:shadow-indigo-500/20 dark:focus-visible:ring-offset-neutral-950"
        >
          <Fingerprint className="h-5 w-5" aria-hidden />
          {busy ? "Hashing…" : "Hash"}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="hash-output"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Hex digest
          </label>
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
          id="hash-output"
          role="status"
          aria-live="polite"
          className={`min-h-[120px] w-full whitespace-pre-wrap break-all rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 ${
            showError ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-100"
          } ${mutedOutput ? "text-neutral-500 dark:text-neutral-500" : ""}`}
        >
          {displayText}
        </div>
      </div>
    </div>
  );
}
