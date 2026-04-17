"use client";

import { Clipboard } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  MAX_SQRT_RATIO_V3,
  MAX_U160,
  MIN_SQRT_RATIO_V3,
  formatRational,
  formatSqrtPriceX96,
  parsePositiveDecimal,
  priceToSqrtPriceX96,
  sqrtPriceX96ToPriceParts,
} from "@/lib/uniswap-sqrt";

type Mode = "decode" | "encode";

function parseSqrtInput(s: string): bigint {
  const t = s.trim().replace(/\s+/g, "");
  if (t.length === 0) {
    throw new Error("Enter sqrtPriceX96.");
  }
  if (!/^\d+$/.test(t)) {
    throw new Error("sqrtPriceX96 must be a non-negative integer string.");
  }
  return BigInt(t);
}

export function UniswapSqrtTool() {
  const [mode, setMode] = useState<Mode>("decode");

  const [sqrtStr, setSqrtStr] = useState("");
  const [dec0, setDec0] = useState("18");
  const [dec1, setDec1] = useState("18");

  const [priceStr, setPriceStr] = useState("1");

  const [error, setError] = useState<string | null>(null);
  const [humanNumeric, setHumanNumeric] = useState("");
  const [rawOut, setRawOut] = useState("");
  const [sqrtOut, setSqrtOut] = useState("");
  const [rangeNote, setRangeNote] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState<string | null>(null);

  const dec0n = useMemo(() => {
    const n = Number(dec0);
    return Number.isInteger(n) && n >= 0 && n <= 255 ? n : NaN;
  }, [dec0]);
  const dec1n = useMemo(() => {
    const n = Number(dec1);
    return Number.isInteger(n) && n >= 0 && n <= 255 ? n : NaN;
  }, [dec1]);

  const runDecode = useCallback(() => {
    setError(null);
    setRangeNote(null);
    setHumanNumeric("");
    setRawOut("");
    try {
      const d0 = dec0n;
      const d1 = dec1n;
      if (Number.isNaN(d0) || Number.isNaN(d1)) {
        throw new Error("Token decimals must be integers from 0 to 255.");
      }
      const sqrtP = parseSqrtInput(sqrtStr);
      if (sqrtP === 0n) {
        throw new Error("sqrtPriceX96 must be positive.");
      }
      if (sqrtP > MAX_U160) {
        throw new Error("Value exceeds uint160.");
      }
      if (sqrtP < MIN_SQRT_RATIO_V3 || sqrtP > MAX_SQRT_RATIO_V3) {
        setRangeNote(
          "Outside Uniswap V3 TickMath min/max sqrt ratio; decoded math is still shown for reference.",
        );
      }
      const parts = sqrtPriceX96ToPriceParts(sqrtP, d0, d1);
      setRawOut(
        `token1/token0 (raw, wei): ${parts.rawRatioNum.toString()} / ${parts.rawRatioDen.toString()} = ${formatRational(parts.rawRatioNum, parts.rawRatioDen, 24)}`,
      );
      setHumanNumeric(formatRational(parts.humanNum, parts.humanDen, 24));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decode failed.");
    }
  }, [sqrtStr, dec0n, dec1n]);

  const runEncode = useCallback(() => {
    setError(null);
    setSqrtOut("");
    setRangeNote(null);
    try {
      const d0 = dec0n;
      const d1 = dec1n;
      if (Number.isNaN(d0) || Number.isNaN(d1)) {
        throw new Error("Token decimals must be integers from 0 to 255.");
      }
      parsePositiveDecimal(priceStr);
      const sqrt = priceToSqrtPriceX96(priceStr, d0, d1);
      if (sqrt > MAX_U160) {
        throw new Error("Result exceeds uint160; try a smaller price or different decimals.");
      }
      if (sqrt < MIN_SQRT_RATIO_V3 || sqrt > MAX_SQRT_RATIO_V3) {
        setRangeNote(
          "Outside Uniswap V3 TickMath min/max sqrt ratio; value may not be reachable on-chain.",
        );
      }
      setSqrtOut(formatSqrtPriceX96(sqrt));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Encode failed.");
    }
  }, [priceStr, dec0n, dec1n]);

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
        Uniswap V3 uses Q64.96 <code className="font-mono text-xs text-neutral-800 dark:text-neutral-200">sqrtPriceX96</code>{" "}
        where <code className="font-mono text-xs">(sqrtPriceX96 / 2^96)^2</code> is{" "}
        <code className="font-mono text-xs">token1/token0</code> in smallest units (raw). Human price is token1 per
        token0 adjusted by decimals.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("decode");
            setError(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "decode"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Decode sqrtPriceX96
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("encode");
            setError(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "encode"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Encode price → sqrtPriceX96
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Token0 decimals
          </span>
          <input
            type="number"
            min={0}
            max={255}
            value={dec0}
            onChange={(e) => setDec0(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Token1 decimals
          </span>
          <input
            type="number"
            min={0}
            max={255}
            value={dec1}
            onChange={(e) => setDec1(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
      </div>

      {mode === "decode" ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <label
            htmlFor="sqrt-input"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            sqrtPriceX96
          </label>
          <textarea
            id="sqrt-input"
            value={sqrtStr}
            onChange={(e) => setSqrtStr(e.target.value)}
            className="mt-2 h-28 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            placeholder="e.g. 79228162514264337593543950336"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={runDecode}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:opacity-95"
            >
              Decode
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <label
            htmlFor="price-input"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Price (token1 per 1 token0, human)
          </label>
          <input
            id="price-input"
            type="text"
            inputMode="decimal"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            placeholder="e.g. 1950.42"
            autoComplete="off"
          />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={runEncode}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:opacity-95"
            >
              Encode
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {rangeNote ? (
        <p className="text-center text-sm text-amber-700 dark:text-amber-400/90">{rangeNote}</p>
      ) : null}

      {mode === "decode" && humanNumeric ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                Human price
              </h2>
              <button
                type="button"
                onClick={() => void copy("human", humanNumeric)}
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
              >
                <Clipboard className="h-4 w-4" aria-hidden />
                {copyLabel === "human" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
              {humanNumeric}{" "}
              <span className="text-neutral-500 dark:text-neutral-400">
                (token1 per 1 token0, human units)
              </span>
            </p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                Raw ratio
              </h2>
              <button
                type="button"
                onClick={() => void copy("raw", rawOut)}
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
              >
                <Clipboard className="h-4 w-4" aria-hidden />
                {copyLabel === "raw" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="break-all font-mono text-xs text-neutral-700 dark:text-neutral-300">{rawOut}</p>
          </div>
        </div>
      ) : null}

      {mode === "encode" && sqrtOut ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              sqrtPriceX96
            </h2>
            <button
              type="button"
              onClick={() => void copy("sqrt", sqrtOut)}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              <Clipboard className="h-4 w-4" aria-hidden />
              {copyLabel === "sqrt" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{sqrtOut}</p>
        </div>
      ) : null}
    </div>
  );
}
