"use client";

import { Braces, Clipboard } from "lucide-react";
import {
  AbiCoder,
  Interface,
  getAddress,
  getBytes,
  hexlify,
  isAddress,
  type InterfaceAbi,
} from "ethers";
import { useCallback, useState } from "react";
import { splitCommaSeparatedAbiTypes } from "@/lib/split-abi-types";

type CodecMode = "encode" | "decode";

const coder = AbiCoder.defaultAbiCoder();

function jsonStringifyWithBigInt(value: unknown): string {
  return JSON.stringify(
    value,
    (_k, v) => {
      if (typeof v === "bigint") return v.toString();
      return v;
    },
    2,
  );
}

/** Re-checksum any 0x-prefixed 20-byte strings so encode() accepts all-lower or wrong EIP-55 casing. */
function normalizeAddressLikeDeep(value: unknown): unknown {
  if (typeof value === "string" && isAddress(value)) {
    return getAddress(value);
  }
  if (Array.isArray(value)) {
    return value.map(normalizeAddressLikeDeep);
  }
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    const o = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(o)) {
      out[k] = normalizeAddressLikeDeep(o[k]);
    }
    return out;
  }
  return value;
}

/** Lines shown above decoded JSON: resolved method from optional ABI, else raw 4-byte selector when strip is on. */
function formatDecodeMethodHeader(
  fullHex: string,
  stripSelector: boolean,
  abiJson: string,
): string {
  const lines: string[] = [];
  let fullBytes: Uint8Array;
  try {
    fullBytes = getBytes(fullHex);
  } catch {
    return "";
  }

  const abiStr = abiJson.trim();
  if (abiStr.length > 0) {
    try {
      const raw = JSON.parse(abiStr) as unknown;
      const iface = new Interface(raw as InterfaceAbi);
      const txDesc = iface.parseTransaction({ data: fullHex });
      if (txDesc != null) {
        lines.push(`Method: ${txDesc.signature}`);
        lines.push(`Selector: ${txDesc.selector}`);
      }
    } catch {
      /* invalid ABI or data does not match any function */
    }
  }

  if (lines.length === 0 && stripSelector && fullBytes.length >= 4) {
    lines.push(`Function selector: ${hexlify(fullBytes.slice(0, 4))}`);
  }

  return lines.length > 0 ? `${lines.join("\n")}\n\n` : "";
}

export function AbiTool() {
  const [mode, setMode] = useState<CodecMode>("encode");
  const [typesInput, setTypesInput] = useState("uint256,address");
  const [valuesJson, setValuesJson] = useState('["1000000000000000000","0xdAC17F958D2ee523a2206206994597C13D831ec7"]');
  const [dataHex, setDataHex] = useState("");
  const [decodeAbiJson, setDecodeAbiJson] = useState("");
  const [stripSelector, setStripSelector] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const run = useCallback(() => {
    setError(null);
    try {
      const types = splitCommaSeparatedAbiTypes(typesInput);
      if (types.length === 0) {
        throw new Error("Provide at least one ABI type.");
      }
      if (mode === "encode") {
        const parsed = JSON.parse(valuesJson) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error("Values must be a JSON array matching the types in order.");
        }
        if (parsed.length !== types.length) {
          throw new Error(`Values array length (${parsed.length}) must match types (${types.length}).`);
        }
        const normalized = normalizeAddressLikeDeep(parsed) as unknown[];
        const encoded = coder.encode(types, normalized);
        setOutput(encoded);
        setHasRun(true);
      } else {
        let hex = dataHex.trim();
        if (!hex) {
          setOutput("");
          setHasRun(true);
          return;
        }
        if (!hex.startsWith("0x")) hex = `0x${hex}`;
        const fullBytes = getBytes(hex);
        let bytes = fullBytes;
        if (stripSelector) {
          if (bytes.length < 4) {
            throw new Error("Calldata is too short to strip a 4-byte selector.");
          }
          bytes = bytes.slice(4);
        }
        const decoded = coder.decode(types, bytes);
        const asArray = [...decoded];
        const header = formatDecodeMethodHeader(hex, stripSelector, decodeAbiJson);
        setOutput(header + jsonStringifyWithBigInt(asArray));
        setHasRun(true);
      }
    } catch (e) {
      setOutput("");
      setHasRun(true);
      setError(e instanceof Error ? e.message : "Operation failed.");
    }
  }, [mode, typesInput, valuesJson, dataHex, stripSelector, decodeAbiJson]);

  const clear = useCallback(() => {
    setTypesInput("uint256,address");
    setValuesJson('["1000000000000000000","0xdAC17F958D2ee523a2206206994597C13D831ec7"]');
    setDataHex("");
    setDecodeAbiJson("");
    setOutput("");
    setError(null);
    setHasRun(false);
  }, []);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (mode === "encode") {
        setValuesJson(text);
      } else {
        setDataHex(text);
      }
    } catch {
      setError("Clipboard access was denied. Paste manually (⌘V / Ctrl+V).");
    }
  }, [mode]);

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
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Types are comma-separated at the top level (tuple inner commas are fine). For large{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">uint256</code>{" "}
        values, use JSON strings (e.g.{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">
          &quot;115792089237316195423570985008687907853269984665640564039457584007913129639935&quot;
        </code>
        ). Ethereum addresses are re-checksummed automatically (all-lowercase or wrong EIP-55 casing is
        fixed before encoding).
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <label
          htmlFor="abi-types"
          className="mb-2 block text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
        >
          ABI types
        </label>
        <input
          id="abi-types"
          value={typesInput}
          onChange={(e) => setTypesInput(e.target.value)}
          className="mb-6 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          placeholder="uint256,address"
          spellCheck={false}
          autoComplete="off"
        />

        {mode === "encode" ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="abi-values"
                className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
              >
                Values (JSON array)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  Reset
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
              id="abi-values"
              value={valuesJson}
              onChange={(e) => setValuesJson(e.target.value)}
              className="h-40 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              spellCheck={false}
              autoComplete="off"
            />
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="abi-data"
                className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
              >
                Hex data
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  Reset
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
              id="abi-data"
              value={dataHex}
              onChange={(e) => setDataHex(e.target.value)}
              className="mb-4 h-32 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              placeholder="0x…"
              spellCheck={false}
              autoComplete="off"
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={stripSelector}
                onChange={(e) => setStripSelector(e.target.checked)}
                className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              Calldata includes 4-byte selector (strip before decode)
            </label>
            <div className="mt-6">
              <label
                htmlFor="abi-decode-contract"
                className="mb-2 block text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
              >
                Contract ABI (optional)
              </label>
              <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                Paste a JSON ABI array. When it matches the calldata, decode output includes the human-readable{" "}
                <span className="font-mono">Method</span> and <span className="font-mono">Selector</span> lines.
              </p>
              <textarea
                id="abi-decode-contract"
                value={decodeAbiJson}
                onChange={(e) => setDecodeAbiJson(e.target.value)}
                className="h-28 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                placeholder='[{"type":"function","name":"transfer",...}]'
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="sr-only sm:not-sr-only sm:inline">Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CodecMode)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </label>
        <button
          type="button"
          onClick={run}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:shadow-indigo-500/20 dark:focus-visible:ring-offset-neutral-950"
        >
          <Braces className="h-5 w-5" aria-hidden />
          {mode === "encode" ? "Encode" : "Decode"}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {mode === "encode" ? "Encoded bytes" : "Decode output"}
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
          {error ?? (!hasRun && !error ? "Output appears here after Encode or Decode." : output)}
        </div>
      </div>
    </div>
  );
}
