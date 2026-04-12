"use client";

import { Clipboard, KeyRound, ScanSearch } from "lucide-react";
import { useCallback, useState } from "react";
import { parseJwt, signJwtHs256 } from "@/lib/jwt";

const DEFAULT_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

function defaultPayload(): string {
  return `{
  "sub": "user-123",
  "iat": ${Math.floor(Date.now() / 1000)}
}`;
}

type Mode = "parse" | "generate";

export function JwtTool() {
  const [mode, setMode] = useState<Mode>("parse");

  const [parseInput, setParseInput] = useState("");
  const [headerOut, setHeaderOut] = useState("");
  const [payloadOut, setPayloadOut] = useState("");
  const [sigOut, setSigOut] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseDone, setParseDone] = useState(false);

  const [genHeader, setGenHeader] = useState(DEFAULT_HEADER);
  const [genPayload, setGenPayload] = useState(defaultPayload);
  const [secret, setSecret] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [copyParse, setCopyParse] = useState<string | null>(null);
  const [copyToken, setCopyToken] = useState(false);

  const runParse = useCallback(() => {
    const result = parseJwt(parseInput);
    if (result.ok) {
      setParseError(null);
      setHeaderOut(result.header);
      setPayloadOut(result.payload);
      setSigOut(result.signatureB64url);
      setParseDone(true);
    } else {
      setHeaderOut("");
      setPayloadOut("");
      setSigOut("");
      setParseError(result.error);
      setParseDone(false);
    }
  }, [parseInput]);

  const runGenerate = useCallback(async () => {
    setGenBusy(true);
    setGenError(null);
    try {
      const result = await signJwtHs256(genHeader, genPayload, secret);
      if (result.ok) {
        setTokenOut(result.token);
      } else {
        setTokenOut("");
        setGenError(result.error);
      }
    } catch {
      setTokenOut("");
      setGenError("Signing failed.");
    } finally {
      setGenBusy(false);
    }
  }, [genHeader, genPayload, secret]);

  const copySection = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyParse(label);
      window.setTimeout(() => setCopyParse(null), 2000);
    } catch {
      setParseError("Could not copy to clipboard.");
    }
  }, []);

  const copyTokenFn = useCallback(async () => {
    if (!tokenOut) return;
    try {
      await navigator.clipboard.writeText(tokenOut);
      setCopyToken(true);
      window.setTimeout(() => setCopyToken(false), 2000);
    } catch {
      setGenError("Could not copy to clipboard.");
    }
  }, [tokenOut]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("parse")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "parse"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <ScanSearch className="h-4 w-4" aria-hidden />
            Parse
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("generate")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            mode === "generate"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
              : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <KeyRound className="h-4 w-4" aria-hidden />
            Generate (HS256)
          </span>
        </button>
      </div>

      {mode === "parse" ? (
        <>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
            <label
              htmlFor="jwt-parse-input"
              className="mb-4 block text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
            >
              JWT string
            </label>
            <textarea
              id="jwt-parse-input"
              value={parseInput}
              onChange={(e) => {
                setParseInput(e.target.value);
                setParseDone(false);
                setParseError(null);
              }}
              className="h-40 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="eyJhbGciOiJIUzI1NiJ9..."
              spellCheck={false}
              autoComplete="off"
            />
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={runParse}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95"
              >
                Parse
              </button>
            </div>
            {parseError ? (
              <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
                {parseError}
              </p>
            ) : null}
          </div>

          {parseDone ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    Header
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copySection("header", headerOut)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Clipboard className="h-4 w-4" aria-hidden />
                    {copyParse === "header" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100">
                  {headerOut}
                </pre>
              </section>
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    Payload
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copySection("payload", payloadOut)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Clipboard className="h-4 w-4" aria-hidden />
                    {copyParse === "payload" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100">
                  {payloadOut}
                </pre>
              </section>
            </div>
          ) : null}

          {parseDone ? (
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  Signature (Base64url)
                </h2>
                <button
                  type="button"
                  onClick={() => void copySection("sig", sigOut)}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                >
                  <Clipboard className="h-4 w-4" aria-hidden />
                  {copyParse === "sig" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="break-all font-mono text-sm text-neutral-800 dark:text-neutral-200">{sigOut}</p>
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                Parsing does not verify the signature; it only decodes the parts.
              </p>
            </section>
          ) : null}
        </>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
              <label
                htmlFor="jwt-header"
                className="mb-4 block text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
              >
                Header (JSON)
              </label>
              <textarea
                id="jwt-header"
                value={genHeader}
                onChange={(e) => setGenHeader(e.target.value)}
                className="h-44 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
              <label
                htmlFor="jwt-payload"
                className="mb-4 block text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
              >
                Payload (JSON)
              </label>
              <textarea
                id="jwt-payload"
                value={genPayload}
                onChange={(e) => setGenPayload(e.target.value)}
                className="h-44 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
            <label
              htmlFor="jwt-secret"
              className="mb-4 block text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
            >
              Secret (HMAC key)
            </label>
            <input
              id="jwt-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="Shared secret"
              autoComplete="off"
            />
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => void runGenerate()}
                disabled={genBusy}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 disabled:opacity-60"
              >
                {genBusy ? "Signing…" : "Sign JWT"}
              </button>
            </div>
            {genError ? (
              <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
                {genError}
              </p>
            ) : null}
          </div>

          {tokenOut ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  JWT
                </label>
                <button
                  type="button"
                  onClick={() => void copyTokenFn()}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                >
                  <Clipboard className="h-4 w-4" aria-hidden />
                  {copyToken ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{tokenOut}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
