"use client";

import { Clipboard, Hash } from "lucide-react";
import { getBytes, keccak256, toUtf8Bytes } from "ethers";
import { useCallback, useState } from "react";

type InputMode = "utf8" | "hex";

export function KeccakTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<InputMode>("utf8");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const run = useCallback(() => {
    setError(null);
    try {
      if (mode === "utf8") {
        const hash = keccak256(toUtf8Bytes(input));
        setOutput(hash);
      } else {
        const trimmed = input.trim();
        if (!trimmed) {
          setOutput("");
          setHasRun(true);
          return;
        }
        const hex = trimmed.startsWith("0x") || trimmed.startsWith("0X") ? trimmed : `0x${trimmed}`;
        const hash = keccak256(getBytes(hex));
        setOutput(hash);
      }
      setHasRun(true);
    } catch {
      setOutput("");
      setHasRun(true);
      setError(mode === "hex" ? "Invalid hex input." : "Could not compute hash.");
    }
  }, [input, mode]);

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

  const showError = Boolean(error);
  const copyDisabled = !hasRun || Boolean(error) || !output;
  const placeholder = mode === "utf8" ? "Text to hash…" : "Hex bytes (with or without 0x)…";

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="keccak-input"
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
          id="keccak-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-48 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="sr-only sm:not-sr-only sm:inline">Input mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as InputMode)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="utf8">UTF-8 text</option>
            <option value="hex">Hex bytes</option>
          </select>
        </label>
        <button
          type="button"
          onClick={run}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:shadow-indigo-500/20 dark:focus-visible:ring-offset-neutral-950"
        >
          <Hash className="h-5 w-5" aria-hidden />
          Keccak-256
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Digest
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
          className={`min-h-[120px] w-full whitespace-pre-wrap break-all rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 ${
            showError ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-100"
          } ${!hasRun && !error ? "text-neutral-500 dark:text-neutral-500" : ""}`}
        >
          {error ?? (!hasRun && !error ? "Hex digest appears here…" : output)}
        </div>
      </div>
    </div>
  );
}
