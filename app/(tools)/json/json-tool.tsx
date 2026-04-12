"use client";

import { CheckCircle, Clipboard, FileJson } from "lucide-react";
import { useCallback, useState } from "react";
import { formatJson, validateJson } from "@/lib/json";

type LastAction = "format" | "validate" | null;

const PLACEHOLDER = "Validation or formatted JSON will appear here...";

const VALID_MESSAGE = "Valid JSON.";

export function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<LastAction>(null);
  const [copyDone, setCopyDone] = useState(false);

  const runFormat = useCallback(() => {
    setLastAction("format");
    const result = formatJson(input);
    if (result.ok) {
      setError(null);
      setOutput(result.value);
    } else {
      setOutput("");
      setError(result.error);
    }
  }, [input]);

  const runValidate = useCallback(() => {
    setLastAction("validate");
    const result = validateJson(input);
    if (result.ok) {
      setError(null);
      setOutput(VALID_MESSAGE);
    } else {
      setOutput("");
      setError(result.error);
    }
  }, [input]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
    setLastAction(null);
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
    if (lastAction === null || error) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [lastAction, error, output]);

  const copyDisabled =
    lastAction === null ||
    Boolean(error) ||
    (lastAction === "validate" && output === VALID_MESSAGE);

  const awaitingFirstRun = lastAction === null && !error;
  const displayText = error ?? (awaitingFirstRun ? PLACEHOLDER : output);
  const showError = Boolean(error);
  const mutedOutput = awaitingFirstRun && !error;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="json-input"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            JSON input
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
          id="json-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-48 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder='{"hello": "world"} or paste a JSON array...'
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={runValidate}
          className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:shadow-indigo-500/20 dark:focus-visible:ring-offset-neutral-950 ${
            lastAction === "validate" ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950" : ""
          }`}
        >
          <CheckCircle className="h-5 w-5" aria-hidden />
          Validate
        </button>
        <button
          type="button"
          onClick={runFormat}
          className={`flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-8 py-3 text-sm font-semibold text-neutral-900 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-indigo-500 dark:hover:bg-neutral-700 ${
            lastAction === "format"
              ? "ring-2 ring-indigo-400/60 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950"
              : ""
          }`}
        >
          <FileJson className="h-5 w-5" aria-hidden />
          Format
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="json-output"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Result
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
          id="json-output"
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
