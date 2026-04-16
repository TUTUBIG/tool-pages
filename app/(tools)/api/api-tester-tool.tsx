"use client";

import { Cloud } from "lucide-react";
import { useCallback, useState } from "react";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"] as const;

export function ApiTesterTool() {
  const [method, setMethod] = useState<(typeof METHODS)[number]>("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [headersJson, setHeadersJson] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [respHeaders, setRespHeaders] = useState("");
  const [respBody, setRespBody] = useState("");

  const send = useCallback(async () => {
    setError(null);
    setStatus(null);
    setElapsedMs(null);
    setRespHeaders("");
    setRespBody("");
    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(headersJson) as Record<string, string>;
      if (headers === null || typeof headers !== "object" || Array.isArray(headers)) {
        throw new Error("Headers must be a JSON object.");
      }
    } catch {
      setError("Headers must be valid JSON object.");
      return;
    }
    const u = url.trim();
    if (!u) {
      setError("URL is required.");
      return;
    }
    setBusy(true);
    const t0 = performance.now();
    try {
      const init: RequestInit = {
        method,
        headers,
      };
      if (method !== "GET" && method !== "HEAD" && body.trim()) {
        init.body = body;
      }
      const res = await fetch(u, init);
      const t1 = performance.now();
      setElapsedMs(Math.round(t1 - t0));
      setStatus(res.status);
      const hLines: string[] = [];
      res.headers.forEach((v, k) => hLines.push(`${k}: ${v}`));
      setRespHeaders(hLines.join("\n"));
      const text = await res.text();
      const max = 200000;
      setRespBody(text.length > max ? `${text.slice(0, max)}\n… [truncated]` : text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed (often CORS or network).");
    } finally {
      setBusy(false);
    }
  }, [method, url, headersJson, body]);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Browsers only allow reading responses when the server sends permissive CORS headers. Try{" "}
        <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">https://httpbin.org</code>{" "}
        for demos.
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as (typeof METHODS)[number])}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-w-[12rem] flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            spellCheck={false}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void send()}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Cloud className="h-4 w-4" />
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
        <label className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          Headers (JSON object)
        </label>
        <textarea
          value={headersJson}
          onChange={(e) => setHeadersJson(e.target.value)}
          rows={4}
          className="mb-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          spellCheck={false}
        />
        <label className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          Body (non-GET / non-HEAD)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          spellCheck={false}
        />
        {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      </div>

      {(status !== null || respBody) && (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          {status !== null ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Status <strong>{status}</strong>
              {elapsedMs !== null ? (
                <>
                  {" "}
                  · <strong>{elapsedMs}</strong> ms
                </>
              ) : null}
            </p>
          ) : null}
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Response headers
            </h3>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-100 p-3 font-mono text-xs dark:bg-neutral-950 dark:text-neutral-300">
              {respHeaders || "—"}
            </pre>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">Body</h3>
            <pre className="max-h-[min(50vh,400px)] overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-100 p-3 font-mono text-xs dark:bg-neutral-950 dark:text-neutral-300">
              {respBody || "—"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
