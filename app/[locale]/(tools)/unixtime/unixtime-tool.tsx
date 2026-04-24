"use client";

import { Clipboard } from "lucide-react";
import { useCallback, useState } from "react";

type Mode = "unix-to-date" | "date-to-unix";
type UnixUnit = "auto" | "s" | "ms";

function parseUnixToMs(raw: string, unit: UnixUnit): number {
  const trimmed = raw.trim().replace(/[,_\s]/g, "");
  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    throw new Error("Enter an integer Unix timestamp (optional separators: space, comma, underscore).");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error("That value is outside the range this page can represent.");
  }
  let resolved: "s" | "ms" = unit === "auto" ? "s" : unit;
  if (unit === "auto") {
    const digits = trimmed.replace(/^-/, "").length;
    resolved = digits >= 13 ? "ms" : "s";
  }
  const ms = resolved === "ms" ? n : n * 1000;
  if (!Number.isFinite(ms)) {
    throw new Error("Invalid range after unit conversion.");
  }
  return ms;
}

function parseDateToMs(raw: string): number {
  const s = raw.trim();
  if (!s) {
    throw new Error("Enter a date string.");
  }
  const t = Date.parse(s);
  if (Number.isNaN(t)) {
    throw new Error("Could not parse that date. Try ISO 8601, e.g. 2024-03-20T15:30:00Z.");
  }
  return t;
}

export function UnixtimeTool() {
  const [mode, setMode] = useState<Mode>("unix-to-date");
  const [unixInput, setUnixInput] = useState("");
  const [unixUnit, setUnixUnit] = useState<UnixUnit>("auto");
  const [dateInput, setDateInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState<string | null>(null);

  const [isoUtc, setIsoUtc] = useState("");
  const [isoLocal, setIsoLocal] = useState("");
  const [localeString, setLocaleString] = useState("");
  const [unixSecOut, setUnixSecOut] = useState("");
  const [unixMsOut, setUnixMsOut] = useState("");

  const clearOutputs = useCallback(() => {
    setIsoUtc("");
    setIsoLocal("");
    setLocaleString("");
    setUnixSecOut("");
    setUnixMsOut("");
  }, []);

  const runUnixToDate = useCallback(() => {
    setError(null);
    clearOutputs();
    try {
      const ms = parseUnixToMs(unixInput, unixUnit);
      const d = new Date(ms);
      if (Number.isNaN(d.getTime())) {
        throw new Error("That timestamp does not map to a valid date.");
      }
      setIsoUtc(d.toISOString());
      setIsoLocal(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`,
      );
      setLocaleString(d.toString());
      const sec = Math.trunc(ms / 1000);
      const msPart = Math.trunc(ms % 1000);
      setUnixSecOut(String(sec));
      setUnixMsOut(String(sec * 1000 + msPart));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [unixInput, unixUnit, clearOutputs]);

  const runDateToUnix = useCallback(() => {
    setError(null);
    clearOutputs();
    try {
      const ms = parseDateToMs(dateInput);
      const d = new Date(ms);
      if (Number.isNaN(d.getTime())) {
        throw new Error("That date is invalid.");
      }
      const sec = Math.trunc(ms / 1000);
      const msPart = Math.trunc(ms % 1000);
      setUnixSecOut(String(sec));
      setUnixMsOut(String(sec * 1000 + msPart));
      setIsoUtc(d.toISOString());
      setIsoLocal(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`,
      );
      setLocaleString(d.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [dateInput, clearOutputs]);

  const copy = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel(label);
      window.setTimeout(() => setCopyLabel(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, []);

  const fillNowUnix = useCallback(() => {
    setUnixInput(String(Math.floor(Date.now() / 1000)));
    setUnixUnit("s");
    setError(null);
  }, []);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Convert between Unix epoch values and calendar time. Auto mode treats 13+ digit magnitudes as
        milliseconds and shorter integers as seconds. Everything runs locally in your browser.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("unix-to-date");
            setError(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "unix-to-date"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Unix → date
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("date-to-unix");
            setError(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "date-to-unix"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Date → Unix
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        {mode === "unix-to-date" ? (
          <>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  Unix timestamp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={unixInput}
                  onChange={(e) => setUnixInput(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                  placeholder="e.g. 1700000000 or 1700000000000"
                  spellCheck={false}
                  autoComplete="off"
                />
              </label>
              <fieldset className="flex flex-wrap gap-4 border-0 p-0">
                <legend className="mb-2 w-full text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  Unit
                </legend>
                {(
                  [
                    ["auto", "Auto"],
                    ["s", "Seconds"],
                    ["ms", "Milliseconds"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="unix-unit"
                      value={value}
                      checked={unixUnit === value}
                      onChange={() => setUnixUnit(value)}
                      className="h-4 w-4 border-neutral-300 text-indigo-600 focus:ring-indigo-500/20 dark:border-neutral-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                  </label>
                ))}
              </fieldset>
              <button
                type="button"
                onClick={fillNowUnix}
                className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                Now (seconds)
              </button>
            </div>
          </>
        ) : (
          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Date / time
            </span>
            <textarea
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="mt-2 h-28 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="e.g. 2024-03-20T15:30:00Z or Wed Mar 20 2024 15:30:00 GMT+0000"
              spellCheck={false}
              autoComplete="off"
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Any value JavaScript{" "}
              <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">Date.parse</code>{" "}
              accepts; ISO 8601 with a timezone is recommended.
            </p>
          </label>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={mode === "unix-to-date" ? runUnixToDate : runDateToUnix}
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

      {(isoUtc || unixSecOut) && !error ? (
        <div className="space-y-4">
          {mode === "unix-to-date" && isoUtc ? (
            <>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    UTC (ISO 8601)
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copy("utc", isoUtc)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Clipboard className="h-4 w-4" aria-hidden />
                    {copyLabel === "utc" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{isoUtc}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    Local (no timezone suffix)
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copy("local", isoLocal)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Clipboard className="h-4 w-4" aria-hidden />
                    {copyLabel === "local" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{isoLocal}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    Locale string
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copy("locale", localeString)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Clipboard className="h-4 w-4" aria-hidden />
                    {copyLabel === "locale" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{localeString}</p>
              </div>
            </>
          ) : null}

          {unixSecOut ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
              <h2 className="mb-4 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                {mode === "date-to-unix" ? "Result" : "Same instant (seconds / milliseconds)"}
              </h2>
              <div className="space-y-4">
                {mode === "date-to-unix" && isoUtc ? (
                  <div className="flex flex-col gap-2 border-b border-neutral-100 pb-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">UTC (ISO 8601)</span>
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end">
                      <span className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
                        {isoUtc}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copy("parsed-utc", isoUtc)}
                        className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        {copyLabel === "parsed-utc" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Seconds</span>
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end">
                    <span className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
                      {unixSecOut}
                    </span>
                    <button
                      type="button"
                      onClick={() => void copy("sec", unixSecOut)}
                      className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                    >
                      {copyLabel === "sec" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Milliseconds</span>
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end">
                    <span className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
                      {unixMsOut}
                    </span>
                    <button
                      type="button"
                      onClick={() => void copy("ms", unixMsOut)}
                      className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                    >
                      {copyLabel === "ms" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
