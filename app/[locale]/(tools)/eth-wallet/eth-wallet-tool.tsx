"use client";

import { useLocale } from "@/components/locale-provider";
import {
  formatAttempts,
  formatProbability,
  formatSecondsEn,
} from "@/lib/eth-wallet-math";
import type { AppLocale } from "@/lib/i18n";
import { Clipboard, Download, KeyRound, Sparkles } from "lucide-react";
import {
  defaultPath,
  getAddress,
  HDNodeWallet,
  hexlify,
  Mnemonic,
  Wallet,
  randomBytes,
} from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const WORD_TO_ENTROPY_BYTES: Record<number, number> = {
  12: 16,
  15: 20,
  18: 24,
  21: 28,
  24: 32,
};

function normalizeHexPattern(
  raw: string,
  invalidMsg: string,
): { ok: true; hex: string } | { ok: false; message: string } {
  let s = raw.trim();
  if (s.startsWith("0x") || s.startsWith("0X")) s = s.slice(2);
  if (!s) return { ok: true, hex: "" };
  if (!/^[0-9a-fA-F]*$/.test(s)) {
    return { ok: false, message: invalidMsg };
  }
  return { ok: true, hex: s.toLowerCase() };
}

function formatSecondsLocale(seconds: number, locale: AppLocale): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (locale !== "zh-CN") return formatSecondsEn(seconds);
  if (seconds < 90) return `≈ ${seconds.toFixed(1)} 秒`;
  if (seconds < 3600) return `≈ ${(seconds / 60).toFixed(1)} 分钟`;
  if (seconds < 86400) return `≈ ${(seconds / 3600).toFixed(2)} 小时`;
  if (seconds < 86400 * 365) return `≈ ${(seconds / 86400).toFixed(2)} 天`;
  return `≈ ${(seconds / (86400 * 365)).toFixed(2)} 年`;
}

const COPY_MS = 2000;

export function EthWalletTool() {
  const locale = useLocale();
  const tr = STRINGS[locale];

  /** —— Vanity —— */
  const [prefixIn, setPrefixIn] = useState("");
  const [suffixIn, setSuffixIn] = useState("");
  const [assumedRate, setAssumedRate] = useState("40000");
  const [vanityError, setVanityError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [measuredRate, setMeasuredRate] = useState<number | null>(null);
  const [foundWallet, setFoundWallet] = useState<Wallet | null>(null);
  const abortRef = useRef(false);
  const attemptsRef = useRef(0);
  const t0Ref = useRef(0);

  const prefixParsed = useMemo(() => normalizeHexPattern(prefixIn, tr.invalidHex), [prefixIn, tr.invalidHex]);
  const suffixParsed = useMemo(() => normalizeHexPattern(suffixIn, tr.invalidHex), [suffixIn, tr.invalidHex]);

  const constraint = useMemo(() => {
    if (!prefixParsed.ok || !suffixParsed.ok) return null;
    const p = prefixParsed.hex.length;
    const s = suffixParsed.hex.length;
    return { p, s, total: p + s };
  }, [prefixParsed, suffixParsed]);

  const rateNum = Number(assumedRate);
  const rateOk = Number.isFinite(rateNum) && rateNum > 0 && rateNum <= 10_000_000;

  const stats = useMemo(() => {
    if (!constraint || constraint.total === 0 || !prefixParsed.ok || !suffixParsed.ok) return null;
    if (constraint.total > 40) return { error: tr.overlapError };
    const n = constraint.total;
    const etaAssumed =
      rateOk ? formatSecondsLocale(expectedSeconds(n, rateNum), locale) : "—";
    return {
      hexDigits: n,
      probability: formatProbability(n),
      expectedAttempts: formatAttempts(n),
      etaAssumed,
    };
  }, [constraint, prefixParsed.ok, suffixParsed.ok, rateNum, rateOk, locale, tr.overlapError]);

  const stopSearch = useCallback(() => {
    abortRef.current = true;
    setSearching(false);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const startVanity = useCallback(() => {
    setVanityError(null);
    setFoundWallet(null);
    setAttempts(0);
    attemptsRef.current = 0;

    if (!prefixParsed.ok) {
      setVanityError(prefixParsed.message);
      return;
    }
    if (!suffixParsed.ok) {
      setVanityError(suffixParsed.message);
      return;
    }
    const pre = prefixParsed.hex;
    const suf = suffixParsed.hex;
    if (!pre.length && !suf.length) {
      setVanityError(tr.needPattern);
      return;
    }
    if (pre.length + suf.length > 40) {
      setVanityError(tr.overlapError);
      return;
    }

    abortRef.current = false;
    setSearching(true);
    setMeasuredRate(null);
    t0Ref.current = performance.now();

    const BATCH = 2500;
    let lastUi = performance.now();

    const tick = () => {
      if (abortRef.current) {
        setSearching(false);
        return;
      }
      for (let i = 0; i < BATCH; i++) {
        const w = new Wallet(hexlify(randomBytes(32)));
        const addr = w.address.slice(2).toLowerCase();
        attemptsRef.current += 1;
        if (addr.startsWith(pre) && addr.endsWith(suf)) {
          setFoundWallet(w);
          setAttempts(attemptsRef.current);
          setSearching(false);
          const elapsed = (performance.now() - t0Ref.current) / 1000;
          if (elapsed > 0) setMeasuredRate(attemptsRef.current / elapsed);
          return;
        }
      }

      const now = performance.now();
      if (now - lastUi > 120) {
        lastUi = now;
        const n = attemptsRef.current;
        setAttempts(n);
        const elapsed = (now - t0Ref.current) / 1000;
        if (elapsed > 0.2) setMeasuredRate(n / elapsed);
      }

      setTimeout(tick, 0);
    };

    setTimeout(tick, 0);
  }, [prefixParsed, suffixParsed, tr]);

  const [copyVk, setCopyVk] = useState(false);
  const copyVanityKey = useCallback(async () => {
    if (!foundWallet) return;
    try {
      await navigator.clipboard.writeText(foundWallet.privateKey);
      setCopyVk(true);
      window.setTimeout(() => setCopyVk(false), COPY_MS);
    } catch {
      setVanityError(tr.clipboardDenied);
    }
  }, [foundWallet, tr.clipboardDenied]);

  /** —— Mnemonic —— */
  const [wordCount, setWordCount] = useState<12 | 15 | 18 | 21 | 24>(12);
  const [derivationPath, setDerivationPath] = useState(defaultPath);
  const [mnemonicPhrase, setMnemonicPhrase] = useState("");
  const [mnemonicWallet, setMnemonicWallet] = useState<HDNodeWallet | null>(null);
  const [mnemonicError, setMnemonicError] = useState<string | null>(null);
  const [copyPhrase, setCopyPhrase] = useState(false);

  const generateMnemonic = useCallback(() => {
    setMnemonicError(null);
    try {
      const entropyBytes = WORD_TO_ENTROPY_BYTES[wordCount];
      const mnemonic = Mnemonic.fromEntropy(randomBytes(entropyBytes));
      const path = derivationPath.trim() || defaultPath;
      const hd = HDNodeWallet.fromMnemonic(mnemonic, path);
      setMnemonicPhrase(mnemonic.phrase);
      setMnemonicWallet(hd);
    } catch (e) {
      setMnemonicWallet(null);
      setMnemonicPhrase("");
      setMnemonicError(e instanceof Error ? e.message : tr.mnemonicGenFailed);
    }
  }, [wordCount, derivationPath, tr.mnemonicGenFailed]);

  const applyPhrase = useCallback(() => {
    setMnemonicError(null);
    const phrase = mnemonicPhrase.trim().replace(/\s+/g, " ");
    if (!phrase) {
      setMnemonicWallet(null);
      setMnemonicError(tr.emptyPhrase);
      return;
    }
    try {
      if (!Mnemonic.isValidMnemonic(phrase)) {
        setMnemonicWallet(null);
        setMnemonicError(tr.invalidMnemonic);
        return;
      }
      const path = derivationPath.trim() || defaultPath;
      const hd = HDNodeWallet.fromPhrase(phrase, "", path);
      setMnemonicWallet(hd);
    } catch (e) {
      setMnemonicWallet(null);
      setMnemonicError(e instanceof Error ? e.message : tr.deriveFailed);
    }
  }, [mnemonicPhrase, derivationPath, tr]);

  const copyMnemonic = useCallback(async () => {
    if (!mnemonicPhrase) return;
    try {
      await navigator.clipboard.writeText(mnemonicPhrase);
      setCopyPhrase(true);
      window.setTimeout(() => setCopyPhrase(false), COPY_MS);
    } catch {
      setMnemonicError(tr.clipboardDenied);
    }
  }, [mnemonicPhrase, tr.clipboardDenied]);

  const [copyPk, setCopyPk] = useState(false);
  const copyPrivateKey = useCallback(async () => {
    if (!mnemonicWallet) return;
    try {
      await navigator.clipboard.writeText(mnemonicWallet.privateKey);
      setCopyPk(true);
      window.setTimeout(() => setCopyPk(false), COPY_MS);
    } catch {
      setMnemonicError(tr.clipboardDenied);
    }
  }, [mnemonicWallet, tr.clipboardDenied]);

  const [copyAddr, setCopyAddr] = useState(false);
  const copyDerivedAddress = useCallback(async () => {
    if (!mnemonicWallet) return;
    try {
      await navigator.clipboard.writeText(getAddress(mnemonicWallet.address));
      setCopyAddr(true);
      window.setTimeout(() => setCopyAddr(false), COPY_MS);
    } catch {
      setMnemonicError(tr.clipboardDenied);
    }
  }, [mnemonicWallet, tr.clipboardDenied]);

  const buildMnemonicExportJson = useCallback(() => {
    if (!mnemonicWallet) return "";
    const path =
      mnemonicWallet.path ?? (derivationPath.trim() || defaultPath);
    return JSON.stringify(
      {
        derivationPath: path,
        address: getAddress(mnemonicWallet.address),
        privateKey: mnemonicWallet.privateKey,
      },
      null,
      2,
    );
  }, [mnemonicWallet, derivationPath]);

  const [copyJsonDone, setCopyJsonDone] = useState(false);
  const copyMnemonicExportJson = useCallback(async () => {
    const json = buildMnemonicExportJson();
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
      setCopyJsonDone(true);
      window.setTimeout(() => setCopyJsonDone(false), COPY_MS);
    } catch {
      setMnemonicError(tr.clipboardDenied);
    }
  }, [buildMnemonicExportJson, tr.clipboardDenied]);

  const downloadMnemonicExportJson = useCallback(() => {
    const json = buildMnemonicExportJson();
    if (!json || !mnemonicWallet) return;
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eth-wallet-export-${Date.now()}.json`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [buildMnemonicExportJson, mnemonicWallet]);

  return (
    <div className="max-w-6xl space-y-10">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{tr.lead}</p>

      <div
        role="alert"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100"
      >
        {tr.securityWarning}
      </div>

      {/* Vanity */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <Sparkles className="h-5 w-5 text-indigo-500" aria-hidden />
          {tr.vanityTitle}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{tr.vanityDesc}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/80">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.prefixLabel}
            </label>
            <input
              value={prefixIn}
              onChange={(e) => setPrefixIn(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="dead"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/80">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.suffixLabel}
            </label>
            <input
              value={suffixIn}
              onChange={(e) => setSuffixIn(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="beef"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        {(!prefixParsed.ok || !suffixParsed.ok) && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {!prefixParsed.ok
              ? prefixParsed.message
              : !suffixParsed.ok
                ? suffixParsed.message
                : null}
          </p>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/80">
          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {tr.assumedRateLabel}
          </label>
          <input
            type="number"
            min={1000}
            max={10_000_000}
            step={1000}
            value={assumedRate}
            onChange={(e) => setAssumedRate(e.target.value)}
            className="mt-2 w-full max-w-xs rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{tr.assumedRateHint}</p>
        </div>

        {stats?.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{stats.error}</p>
        ) : stats ? (
          <dl className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-950/50">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">{tr.statHexDigits}</dt>
              <dd className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{stats.hexDigits}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">{tr.statProbability}</dt>
              <dd className="break-all font-mono text-neutral-900 dark:text-neutral-100">{stats.probability}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">{tr.statAttempts}</dt>
              <dd className="break-all font-mono text-neutral-900 dark:text-neutral-100">{stats.expectedAttempts}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">{tr.statEta}</dt>
              <dd className="font-mono text-neutral-900 dark:text-neutral-100">{stats.etaAssumed}</dd>
            </div>
          </dl>
        ) : null}

        {!rateOk ? <p className="text-sm text-amber-700 dark:text-amber-300">{tr.rateInvalid}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startVanity}
            disabled={searching || !stats || "error" in stats}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 disabled:opacity-40"
          >
            {searching ? tr.searching : tr.startSearch}
          </button>
          <button
            type="button"
            onClick={stopSearch}
            disabled={!searching}
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-800 disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-200"
          >
            {tr.stopSearch}
          </button>
          {searching || attempts > 0 ? (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {tr.attempts}: {attempts.toLocaleString()}
              {measuredRate != null ? ` · ${measuredRate.toFixed(0)} ${tr.attemptsPerSec}` : ""}
            </span>
          ) : null}
        </div>

        {vanityError ? <p className="text-sm text-red-600 dark:text-red-400">{vanityError}</p> : null}

        {foundWallet ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">{tr.found}</p>
            <p className="mt-2 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
              {getAddress(foundWallet.address)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyVanityKey}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 dark:border-red-800 dark:bg-neutral-900 dark:text-red-200"
              >
                <Clipboard className="h-3.5 w-3.5" aria-hidden />
                {copyVk ? tr.copied : tr.copyPrivateKey}
              </button>
            </div>
            <p className="mt-2 font-mono text-xs break-all text-red-800 dark:text-red-300">{foundWallet.privateKey}</p>
          </div>
        ) : null}
      </section>

      {/* Mnemonic */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <KeyRound className="h-5 w-5 text-indigo-500" aria-hidden />
          {tr.mnemonicTitle}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{tr.mnemonicDesc}</p>

        <div className="flex flex-wrap gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/80">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.wordCount}
            </label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value) as 12 | 15 | 18 | 21 | 24)}
              className="mt-2 block rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            >
              {[12, 15, 18, 21, 24].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[min(100%,24rem)] flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.derivationPath}
            </label>
            <input
              value={derivationPath}
              onChange={(e) => setDerivationPath(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateMnemonic}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30"
          >
            {tr.generateMnemonic}
          </button>
          <button
            type="button"
            onClick={applyPhrase}
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-800 dark:border-neutral-600 dark:text-neutral-200"
          >
            {tr.deriveFromPhrase}
          </button>
          <button
            type="button"
            onClick={copyMnemonic}
            disabled={!mnemonicPhrase}
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-800 disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-200"
          >
            {copyPhrase ? tr.copied : tr.copyPhrase}
          </button>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/80">
          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {tr.phraseLabel}
          </label>
          <textarea
            value={mnemonicPhrase}
            onChange={(e) => setMnemonicPhrase(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            placeholder={tr.phrasePlaceholder}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {mnemonicError ? <p className="text-sm text-red-600 dark:text-red-400">{mnemonicError}</p> : null}

        {mnemonicWallet ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-950/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.exportSectionTitle}
            </p>
            <p className="mt-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
              {mnemonicWallet.path ?? (derivationPath.trim() || defaultPath)}
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-500">{tr.pathHint}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.addressLabel}
            </p>
            <p className="mt-1 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">
              {getAddress(mnemonicWallet.address)}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {tr.privateKeyLabel}
            </p>
            <p className="mt-1 font-mono text-xs break-all text-red-800 dark:text-red-300">{mnemonicWallet.privateKey}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyDerivedAddress}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <Clipboard className="h-3.5 w-3.5" aria-hidden />
                {copyAddr ? tr.copied : tr.copyAddress}
              </button>
              <button
                type="button"
                onClick={copyPrivateKey}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 dark:border-red-800 dark:bg-neutral-900 dark:text-red-200"
              >
                <Clipboard className="h-3.5 w-3.5" aria-hidden />
                {copyPk ? tr.copied : tr.copyPrivateKey}
              </button>
              <button
                type="button"
                onClick={copyMnemonicExportJson}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 dark:border-indigo-700 dark:bg-neutral-900 dark:text-indigo-200"
              >
                <Clipboard className="h-3.5 w-3.5" aria-hidden />
                {copyJsonDone ? tr.copied : tr.copyJsonExport}
              </button>
              <button
                type="button"
                onClick={downloadMnemonicExportJson}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 dark:border-indigo-700 dark:bg-neutral-900 dark:text-indigo-200"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {tr.downloadJsonExport}
              </button>
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-neutral-200 bg-white p-3 font-mono text-[10px] leading-relaxed text-neutral-800 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-300">
              {buildMnemonicExportJson()}
            </pre>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function expectedSeconds(hexDigits: number, rate: number): number {
  return Math.pow(16, hexDigits) / rate;
}

const STRINGS: Record<
  AppLocale,
  {
    lead: string;
    securityWarning: string;
    vanityTitle: string;
    vanityDesc: string;
    prefixLabel: string;
    suffixLabel: string;
    assumedRateLabel: string;
    assumedRateHint: string;
    statHexDigits: string;
    statProbability: string;
    statAttempts: string;
    statEta: string;
    rateInvalid: string;
    startSearch: string;
    searching: string;
    stopSearch: string;
    attempts: string;
    attemptsPerSec: string;
    needPattern: string;
    overlapError: string;
    found: string;
    copyPrivateKey: string;
    clipboardDenied: string;
    copied: string;
    mnemonicTitle: string;
    mnemonicDesc: string;
    wordCount: string;
    derivationPath: string;
    generateMnemonic: string;
    deriveFromPhrase: string;
    copyPhrase: string;
    phraseLabel: string;
    phrasePlaceholder: string;
    addressLabel: string;
    privateKeyLabel: string;
    exportSectionTitle: string;
    pathHint: string;
    copyAddress: string;
    copyJsonExport: string;
    downloadJsonExport: string;
    emptyPhrase: string;
    invalidMnemonic: string;
    deriveFailed: string;
    mnemonicGenFailed: string;
    invalidHex: string;
  }
> = {
  en: {
    lead:
      "Generate vanity addresses and BIP-39 mnemonics entirely in your browser. Nothing is sent to our servers.",
    securityWarning:
      "Never share mnemonics or private keys. This page is for education and testing; use hardware wallets or offline tools for significant funds.",
    vanityTitle: "Vanity address (prefix / suffix)",
    vanityDesc:
      "Match is case-insensitive on the 40 hex characters (ignores EIP-55 casing). Probability per attempt is 16^(−n) where n is the total length of prefix + suffix. Expected time uses your assumed attempts/second.",
    prefixLabel: "Hex prefix (after 0x)",
    suffixLabel: "Hex suffix",
    assumedRateLabel: "Assumed attempts per second (for ETA)",
    assumedRateHint:
      "Used only for the ETA estimate; your machine’s speed is shown live while searching.",
    statHexDigits: "Matched hex digits (n)",
    statProbability: "Approx. probability per attempt",
    statAttempts: "Approx. expected attempts",
    statEta: "Approx. expected time (at assumed rate)",
    rateInvalid: "Enter an attempts/sec value between 1,000 and 10,000,000 for ETA.",
    startSearch: "Start search",
    searching: "Searching…",
    stopSearch: "Stop",
    attempts: "Attempts",
    attemptsPerSec: "/s",
    needPattern: "Enter at least a non-empty prefix or suffix.",
    overlapError: "Prefix + suffix length must be ≤ 40 so the regions do not overlap.",
    found: "Match found",
    copyPrivateKey: "Copy private key",
    clipboardDenied: "Clipboard access denied.",
    copied: "Copied",
    mnemonicTitle: "BIP-39 mnemonic",
    mnemonicDesc:
      "Generate a random phrase or paste one to derive the Ethereum account at the path below (English wordlist). After deriving, copy or download the address and private key as JSON—mnemonic is never included in exports.",
    wordCount: "Word count",
    derivationPath: "Derivation path",
    generateMnemonic: "Generate new mnemonic",
    deriveFromPhrase: "Derive from phrase",
    copyPhrase: "Copy phrase",
    phraseLabel: "Mnemonic phrase",
    phrasePlaceholder: "twelve or more English words …",
    addressLabel: "Address (this path)",
    privateKeyLabel: "Private key",
    exportSectionTitle: "Export from mnemonic",
    pathHint:
      "JSON export and download include derivation path, checksummed address, and private key—not the mnemonic.",
    copyAddress: "Copy address",
    copyJsonExport: "Copy JSON export",
    downloadJsonExport: "Download JSON",
    emptyPhrase: "Enter a mnemonic phrase.",
    invalidMnemonic: "That phrase is not a valid BIP-39 mnemonic (checksum or words).",
    deriveFailed: "Could not derive wallet from that phrase and path.",
    mnemonicGenFailed: "Could not generate mnemonic.",
    invalidHex: "Only hex characters (0–9, a–f) are allowed.",
  },
  "zh-CN": {
    lead: "靓号地址与 BIP-39 助记词均在浏览器本地生成与校验，不会上传到服务器。",
    securityWarning:
      "切勿向任何人泄露助记词或私钥。本页仅供学习与测试；大额资产请使用硬件钱包或在离线环境中操作。",
    vanityTitle: "靓号地址（前缀 / 后缀）",
    vanityDesc:
      "匹配规则：比较地址中 40 个十六进制字符（忽略 EIP-55 大小写）。单次命中概率约为 16^(−n)，n 为前缀与后缀十六进制位数之和。下方预计时间基于你填写的每秒尝试次数。",
    prefixLabel: "十六进制前缀（不含 0x）",
    suffixLabel: "十六进制后缀",
    assumedRateLabel: "假定每秒尝试次数（用于估算耗时）",
    assumedRateHint: "仅用于估算预计时间；搜索时会显示实测速度。",
    statHexDigits: "需匹配的十六进制位数 (n)",
    statProbability: "单次随机地址命中概率（约）",
    statAttempts: "期望尝试次数（约）",
    statEta: "期望耗时（按假定速度）",
    rateInvalid: "请输入 1,000～10,000,000 之间的每秒尝试次数以计算预计耗时。",
    startSearch: "开始碰撞",
    searching: "搜索中…",
    stopSearch: "停止",
    attempts: "已尝试",
    attemptsPerSec: "次/秒",
    needPattern: "请至少填写前缀或后缀之一。",
    overlapError: "前缀与后缀长度之和必须 ≤ 40（区域不重叠）。",
    found: "已找到匹配地址",
    copyPrivateKey: "复制私钥",
    clipboardDenied: "无法访问剪贴板。",
    copied: "已复制",
    mnemonicTitle: "BIP-39 助记词",
    mnemonicDesc:
      "可随机生成英文助记词，或粘贴助记词后在下方路径推导以太坊账户（默认英文词表）。推导成功后可复制或下载地址与私钥的 JSON；导出内容不含助记词。",
    wordCount: "词数",
    derivationPath: "派生路径",
    generateMnemonic: "随机生成助记词",
    deriveFromPhrase: "从助记词推导",
    copyPhrase: "复制助记词",
    phraseLabel: "助记词",
    phrasePlaceholder: "十二个或以上英文单词…",
    addressLabel: "地址（当前路径）",
    privateKeyLabel: "私钥",
    exportSectionTitle: "从助记词导出",
    pathHint: "复制或下载的 JSON 含派生路径、校验和地址与私钥，不含助记词。",
    copyAddress: "复制地址",
    copyJsonExport: "复制 JSON 导出",
    downloadJsonExport: "下载 JSON",
    emptyPhrase: "请输入助记词。",
    invalidMnemonic: "不是有效的 BIP-39 助记词（词表或校验和错误）。",
    deriveFailed: "无法从该助记词与路径推导钱包。",
    mnemonicGenFailed: "生成助记词失败。",
    invalidHex: "仅允许十六进制字符（0–9、a–f）。",
  },
};
