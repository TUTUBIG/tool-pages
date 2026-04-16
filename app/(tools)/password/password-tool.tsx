"use client";

import { Clipboard, Lock } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*-_+=?";

function pickCharset(
  useLower: boolean,
  useUpper: boolean,
  useDigits: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean,
): string {
  let s = "";
  if (useLower) s += excludeAmbiguous ? LOWER : "abcdefghijklmnopqrstuvwxyz";
  if (useUpper) s += excludeAmbiguous ? UPPER : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useDigits) s += excludeAmbiguous ? DIGITS : "0123456789";
  if (useSymbols) s += SYMBOLS;
  return s;
}

function generate(len: number, alphabet: string): string {
  if (!alphabet || len < 1) return "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i]! % alphabet.length]!;
  }
  return out;
}

export function PasswordTool() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  const alphabet = useMemo(
    () => pickCharset(lower, upper, digits, symbols, excludeAmbiguous),
    [lower, upper, digits, symbols, excludeAmbiguous],
  );

  const roll = useCallback(() => {
    setPassword(generate(length, alphabet));
  }, [length, alphabet]);

  const copy = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [password]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <label className="mb-4 flex flex-wrap items-center gap-4 text-sm text-neutral-700 dark:text-neutral-300">
          Length {length}
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-48"
          />
        </label>
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-neutral-700 dark:text-neutral-300">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} />a–z
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />A–Z
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} />0–9
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
            Symbols
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            />
            Exclude ambiguous (0/O, 1/l/I)
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={roll}
            disabled={!alphabet}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            Generate
          </button>
          <button
            type="button"
            disabled={!password}
            onClick={() => void copy()}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 disabled:opacity-40 dark:text-indigo-400"
          >
            <Clipboard className="h-4 w-4" />
            {copyDone ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <p className="break-all font-mono text-lg text-neutral-900 dark:text-neutral-100">
          {password || "Click Generate."}
        </p>
        {!alphabet ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">Select at least one character set.</p>
        ) : null}
      </div>
    </div>
  );
}
