"use client";

import { ArrowLeftRight, Clipboard } from "lucide-react";
import { getBytes, hexlify, isHexString, toUtf8Bytes, toUtf8String } from "ethers";
import { useCallback, useState } from "react";

type Direction = "hexToUtf8" | "utf8ToHex";

function stripSpaces(s: string): string {
  return s.replace(/\s+/g, "");
}

export function HexTool() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("hexToUtf8");
  const [prefix0xOut, setPrefix0xOut] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const run = useCallback(() => {
    setError(null);
    try {
      if (direction === "utf8ToHex") {
        const hex = hexlify(toUtf8Bytes(input));
        setOutput(prefix0xOut ? hex : hex.slice(2));
        setHasRun(true);
        return;
      }
      const compact = stripSpaces(input.trim());
      if (!compact) {
        setOutput("");
        setHasRun(true);
        return;
      }
      const with0x = compact.startsWith("0x") || compact.startsWith("0X") ? compact : `0x${compact}`;
      if (!isHexString(with0x, true) || (with0x.length - 2) % 2 !== 0) {
        throw new Error("Invalid hex (use pairs of hex digits).");
      }
      const bytes = getBytes(with0x);
      setOutput(toUtf8String(bytes));
      setHasRun(true);
    } catch (e) {
      setOutput("");
      setHasRun(true);
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [input, direction, prefix0xOut]);

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

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="hex-input"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            {direction === "hexToUtf8" ? "Hex" : "UTF-8 text"}
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
          id="hex-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-48 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder={direction === "hexToUtf8" ? "0xdeadbeef or deadbeef" : "Plain text…"}
          spellCheck={direction === "utf8ToHex"}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="sr-only sm:not-sr-only sm:inline">Direction</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="hexToUtf8">Hex → UTF-8</option>
            <option value="utf8ToHex">UTF-8 → Hex</option>
          </select>
        </label>
        {direction === "utf8ToHex" ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={prefix0xOut}
              onChange={(e) => setPrefix0xOut(e.target.checked)}
              className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
            />
            Prefix with 0x
          </label>
        ) : null}
        <button
          type="button"
          onClick={run}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:shadow-indigo-500/20 dark:focus-visible:ring-offset-neutral-950"
        >
          <ArrowLeftRight className="h-5 w-5" aria-hidden />
          Convert
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {direction === "hexToUtf8" ? "UTF-8 output" : "Hex output"}
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
          {error ?? (!hasRun && !error ? "Output appears here after Convert." : output)}
        </div>
      </div>
    </div>
  );
}
