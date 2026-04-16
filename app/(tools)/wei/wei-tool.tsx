"use client";

import { Clipboard } from "lucide-react";
import { useCallback, useState } from "react";
import { humanToWei, weiToHuman } from "@/lib/wei";

type Mode = "wei-to-human" | "human-to-wei";

const DECIMAL_PRESETS = [18, 6, 8, 9] as const;

export function WeiTool() {
  const [mode, setMode] = useState<Mode>("wei-to-human");
  const [weiInput, setWeiInput] = useState("");
  const [humanInput, setHumanInput] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [commaGroups, setCommaGroups] = useState(true);
  const [weiOut, setWeiOut] = useState("");
  const [humanOut, setHumanOut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState<string | null>(null);

  const decn = useCallback((): number => {
    const n = Number(decimals);
    if (!Number.isInteger(n) || n < 0 || n > 255) {
      return NaN;
    }
    return n;
  }, [decimals]);

  const runWeiToHuman = useCallback(() => {
    setError(null);
    setHumanOut("");
    try {
      const d = decn();
      if (Number.isNaN(d)) {
        throw new Error("Decimals must be an integer from 0 to 255.");
      }
      setHumanOut(weiToHuman(weiInput, d, commaGroups));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [weiInput, decn, commaGroups]);

  const runHumanToWei = useCallback(() => {
    setError(null);
    setWeiOut("");
    try {
      const d = decn();
      if (Number.isNaN(d)) {
        throw new Error("Decimals must be an integer from 0 to 255.");
      }
      const w = humanToWei(humanInput, d);
      setWeiOut(w.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [humanInput, decn]);

  const copy = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel(label);
      window.setTimeout(() => setCopyLabel(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, []);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Convert ERC-20–style base units (often called “wei” when decimals=18) to a decimal string and
        back. Uses arbitrary precision; no network calls.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("wei-to-human");
            setError(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "wei-to-human"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Wei → human
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("human-to-wei");
            setError(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "human-to-wei"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Human → wei
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[8rem] flex-col gap-2">
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Decimals
            </span>
            <input
              type="number"
              min={0}
              max={255}
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-xs text-neutral-500 dark:text-neutral-400">Presets:</span>
            {DECIMAL_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDecimals(String(d))}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {mode === "wei-to-human" ? (
          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Base units (wei)
            </span>
            <textarea
              value={weiInput}
              onChange={(e) => setWeiInput(e.target.value)}
              className="mt-2 h-28 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="e.g. 1000000000000000000"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Human amount
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={humanInput}
              onChange={(e) => setHumanInput(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="e.g. 1.5"
              autoComplete="off"
            />
          </label>
        )}

        {mode === "wei-to-human" ? (
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={commaGroups}
              onChange={(e) => setCommaGroups(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500/20 dark:border-neutral-600"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Thousands separators in integer part
            </span>
          </label>
        ) : null}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={mode === "wei-to-human" ? runWeiToHuman : runHumanToWei}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:opacity-95"
          >
            Convert
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {mode === "wei-to-human" && humanOut ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Human-readable
            </h2>
            <button
              type="button"
              onClick={() => void copy("human", humanOut.replace(/,/g, ""))}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              <Clipboard className="h-4 w-4" aria-hidden />
              {copyLabel === "human" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="break-all font-mono text-lg text-neutral-900 dark:text-neutral-100">{humanOut}</p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Copy strips thousands separators for pasting into contracts or tools.
          </p>
        </div>
      ) : null}

      {mode === "human-to-wei" && weiOut ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Base units (wei)
            </h2>
            <button
              type="button"
              onClick={() => void copy("wei", weiOut)}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              <Clipboard className="h-4 w-4" aria-hidden />
              {copyLabel === "wei" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{weiOut}</p>
        </div>
      ) : null}
    </div>
  );
}
