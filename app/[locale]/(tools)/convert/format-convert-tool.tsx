"use client";

import { ArrowRight, Clipboard, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import {
  FORMAT_LABELS,
  FORMAT_ORDER,
  type DataFormat,
  convertFormat,
} from "@/lib/format-convert";

export function FormatConvertTool() {
  const [from, setFrom] = useState<DataFormat>("json");
  const [to, setTo] = useState<DataFormat>("yaml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
    setInput(output);
    setOutput("");
    setError(null);
  }, [from, to, output]);

  const runConvert = useCallback(() => {
    setError(null);
    const result = convertFormat(input, from, to);
    if (result.ok) {
      setOutput(result.output);
    } else {
      setOutput("");
      setError(result.error);
    }
  }, [input, from, to]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      setError("Clipboard access was denied. Paste manually (⌘V / Ctrl+V).");
    }
  }, []);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [output]);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        CSV and TSV expect a header row. To export as CSV/TSV, use an array of objects, a single
        object, or one object with a single property that is an array of objects (for example{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-neutral-800">
          {`{ "items": [ {...}, {...} ] }`}
        </code>
        ). Nested values are JSON-encoded in spreadsheet cells.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-center">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            From
          </span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as DataFormat)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {FORMAT_ORDER.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-center lg:pb-1">
          <button
            type="button"
            onClick={swap}
            className="rounded-full border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            aria-label="Swap from, to, and move output into input"
            title="Swap from / to and move output into input"
          >
            <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" aria-hidden />
          </button>
        </div>

        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            To
          </span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as DataFormat)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {FORMAT_ORDER.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="format-input"
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
          id="format-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-56 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder={`Paste ${FORMAT_LABELS[from]} here…`}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={runConvert}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 dark:shadow-indigo-500/20"
        >
          <RefreshCw className="h-5 w-5" aria-hidden />
          Convert
        </button>
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="format-output"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Output ({FORMAT_LABELS[to]})
          </label>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!output}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400"
          >
            <Clipboard className="h-4 w-4" aria-hidden />
            {copyDone ? "Copied" : "Copy"}
          </button>
        </div>
        <textarea
          id="format-output"
          readOnly
          value={output}
          className="h-56 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder={`Converted ${FORMAT_LABELS[to]} will appear here…`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
