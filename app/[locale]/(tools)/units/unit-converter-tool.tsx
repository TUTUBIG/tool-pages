"use client";

import { ArrowLeftRight, Clipboard } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { convertCurrency, fetchCurrencyNames, type CurrencyList } from "@/lib/units/currency";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  TEMP_LABELS,
  type UnitCategory,
  labelLength,
  labelVolume,
  labelWeight,
} from "@/lib/units/labels";
import {
  LENGTH_TO_M,
  VOLUME_TO_L,
  WEIGHT_TO_KG,
  type TempUnit,
  convertMultiplicative,
  convertTemperature,
} from "@/lib/units/physical";

const FALLBACK_CURRENCIES: CurrencyList = {
  USD: "United States dollar",
  EUR: "Euro",
  GBP: "British pound",
  JPY: "Japanese yen",
  CHF: "Swiss franc",
  CAD: "Canadian dollar",
  AUD: "Australian dollar",
  CNY: "Chinese renminbi",
  INR: "Indian rupee",
  SEK: "Swedish krona",
  NOK: "Norwegian krone",
  DKK: "Danish krone",
  PLN: "Polish zloty",
  NZD: "New Zealand dollar",
  SGD: "Singapore dollar",
  HKD: "Hong Kong dollar",
  MXN: "Mexican peso",
  BRL: "Brazilian real",
  ZAR: "South African rand",
  TRY: "Turkish lira",
  KRW: "South Korean won",
};

function formatPhysical(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 10 });
}

function formatCurrencyAmount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>("currency");

  const [amountStr, setAmountStr] = useState("1");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  const [currencies, setCurrencies] = useState<CurrencyList>(FALLBACK_CURRENCIES);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  const [curFrom, setCurFrom] = useState("USD");
  const [curTo, setCurTo] = useState("EUR");

  const [tempFrom, setTempFrom] = useState<TempUnit>("c");
  const [tempTo, setTempTo] = useState<TempUnit>("f");

  const [wFrom, setWFrom] = useState("kg");
  const [wTo, setWTo] = useState("lb");

  const [lenFrom, setLenFrom] = useState("m");
  const [lenTo, setLenTo] = useState("ft");

  const [volFrom, setVolFrom] = useState("l");
  const [volTo, setVolTo] = useState("us_gal");

  const [rateDate, setRateDate] = useState<string | null>(null);
  const [currencyBusy, setCurrencyBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCurrencyNames();
        if (!cancelled) {
          setCurrencies(list);
        }
      } catch {
        if (!cancelled) {
          setCurrencies(FALLBACK_CURRENCIES);
        }
      } finally {
        if (!cancelled) {
          setCurrenciesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currencyCodes = useMemo(() => Object.keys(currencies).sort(), [currencies]);

  const parseAmount = useCallback((): number | null => {
    const t = amountStr.trim();
    if (t === "") return null;
    const n = Number(t.replace(/,/g, ""));
    if (Number.isNaN(n)) return null;
    return n;
  }, [amountStr]);

  const runConvert = useCallback(async () => {
    setError(null);
    setRateDate(null);
    const value = parseAmount();
    if (value === null) {
      setResult("");
      setError("Enter a valid number.");
      return;
    }

    try {
      switch (category) {
        case "currency": {
          setCurrencyBusy(true);
          try {
            const { value: out, date } = await convertCurrency(value, curFrom, curTo);
            setResult(formatCurrencyAmount(out));
            setRateDate(date);
          } finally {
            setCurrencyBusy(false);
          }
          break;
        }
        case "temperature": {
          setResult(formatPhysical(convertTemperature(value, tempFrom, tempTo)));
          break;
        }
        case "weight": {
          setResult(formatPhysical(convertMultiplicative(value, wFrom, wTo, WEIGHT_TO_KG)));
          break;
        }
        case "length": {
          setResult(formatPhysical(convertMultiplicative(value, lenFrom, lenTo, LENGTH_TO_M)));
          break;
        }
        case "volume": {
          setResult(formatPhysical(convertMultiplicative(value, volFrom, volTo, VOLUME_TO_L)));
          break;
        }
      }
    } catch (e) {
      setResult("");
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }, [
    category,
    parseAmount,
    curFrom,
    curTo,
    tempFrom,
    tempTo,
    wFrom,
    wTo,
    lenFrom,
    lenTo,
    volFrom,
    volTo,
  ]);

  const swapUnits = useCallback(() => {
    if (category === "currency") {
      setCurFrom(curTo);
      setCurTo(curFrom);
    } else if (category === "temperature") {
      setTempFrom(tempTo);
      setTempTo(tempFrom);
    } else if (category === "weight") {
      setWFrom(wTo);
      setWTo(wFrom);
    } else if (category === "length") {
      setLenFrom(lenTo);
      setLenTo(lenFrom);
    } else if (category === "volume") {
      setVolFrom(volTo);
      setVolTo(volFrom);
    }
  }, [category, curFrom, curTo, tempFrom, tempTo, wFrom, wTo, lenFrom, lenTo, volFrom, volTo]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.replace(/,/g, ""));
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [result]);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Currency rates use the{" "}
        <a
          href="https://www.frankfurter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
        >
          Frankfurter
        </a>{" "}
        v2 API (<code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">api.frankfurter.dev</code>
        ). Temperature, weight, length, and volume convert locally using fixed factors.
      </p>

      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_ORDER.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategory(c);
                setError(null);
                setResult("");
                setRateDate(null);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                  : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4">
          <label
            htmlFor="unit-amount"
            className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
          >
            Amount
          </label>
          <input
            id="unit-amount"
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-lg text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              From
            </span>
            {category === "currency" ? (
              <select
                value={curFrom}
                onChange={(e) => setCurFrom(e.target.value)}
                disabled={currenciesLoading}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {currencyCodes.map((code) => (
                  <option key={code} value={code}>
                    {code} — {currencies[code] ?? code}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "temperature" ? (
              <select
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value as TempUnit)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {(Object.keys(TEMP_LABELS) as TempUnit[]).map((u) => (
                  <option key={u} value={u}>
                    {TEMP_LABELS[u]}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "weight" ? (
              <select
                value={wFrom}
                onChange={(e) => setWFrom(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.keys(WEIGHT_TO_KG).map((id) => (
                  <option key={id} value={id}>
                    {labelWeight(id)}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "length" ? (
              <select
                value={lenFrom}
                onChange={(e) => setLenFrom(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.keys(LENGTH_TO_M).map((id) => (
                  <option key={id} value={id}>
                    {labelLength(id)}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "volume" ? (
              <select
                value={volFrom}
                onChange={(e) => setVolFrom(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.keys(VOLUME_TO_L).map((id) => (
                  <option key={id} value={id}>
                    {labelVolume(id)}
                  </option>
                ))}
              </select>
            ) : null}
          </label>

          <div className="flex justify-center lg:pb-1">
            <button
              type="button"
              onClick={swapUnits}
              className="rounded-full border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              aria-label="Swap from and to units"
            >
              <ArrowLeftRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <label className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              To
            </span>
            {category === "currency" ? (
              <select
                value={curTo}
                onChange={(e) => setCurTo(e.target.value)}
                disabled={currenciesLoading}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {currencyCodes.map((code) => (
                  <option key={code} value={code}>
                    {code} — {currencies[code] ?? code}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "temperature" ? (
              <select
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value as TempUnit)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {(Object.keys(TEMP_LABELS) as TempUnit[]).map((u) => (
                  <option key={u} value={u}>
                    {TEMP_LABELS[u]}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "weight" ? (
              <select
                value={wTo}
                onChange={(e) => setWTo(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.keys(WEIGHT_TO_KG).map((id) => (
                  <option key={id} value={id}>
                    {labelWeight(id)}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "length" ? (
              <select
                value={lenTo}
                onChange={(e) => setLenTo(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.keys(LENGTH_TO_M).map((id) => (
                  <option key={id} value={id}>
                    {labelLength(id)}
                  </option>
                ))}
              </select>
            ) : null}
            {category === "volume" ? (
              <select
                value={volTo}
                onChange={(e) => setVolTo(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.keys(VOLUME_TO_L).map((id) => (
                  <option key={id} value={id}>
                    {labelVolume(id)}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void runConvert()}
            disabled={category === "currency" && currencyBusy}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 disabled:opacity-60 dark:shadow-indigo-500/20"
          >
            {category === "currency" && currencyBusy ? "Converting…" : "Convert"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Result
            </h2>
            <button
              type="button"
              onClick={copyResult}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              <Clipboard className="h-4 w-4" aria-hidden />
              {copyDone ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="font-mono text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {result}
          </p>
          {category === "currency" && rateDate ? (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Rate date: {rateDate}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
