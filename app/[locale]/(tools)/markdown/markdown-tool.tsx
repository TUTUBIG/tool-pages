"use client";

import { useEffect, useState } from "react";

const DEFAULT = `# Markdown preview

- **Bold** and *italic*
- [Link](https://example.com)
- \`inline code\`

\`\`\`ts
const x = 1;
\`\`\`
`;

export function MarkdownTool() {
  const [md, setMd] = useState(DEFAULT);
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void Promise.all([import("marked"), import("dompurify")])
      .then(([{ marked }, { default: DOMPurify }]) => {
        if (cancelled) return;
        try {
          const raw = marked.parse(md, { async: false });
          const str = typeof raw === "string" ? raw : String(raw);
          setHtml(DOMPurify.sanitize(str));
        } catch {
          setHtml("");
          setError("Could not parse Markdown.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load preview engine.");
      });
    return () => {
      cancelled = true;
    };
  }, [md]);

  return (
    <div className="max-w-6xl space-y-6">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid min-h-[min(70vh,560px)] gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <label
            htmlFor="md-src"
            className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400"
          >
            Markdown
          </label>
          <textarea
            id="md-src"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="h-[min(65vh,520px)] w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <span className="mb-2 block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Preview (sanitized)
          </span>
          <div
            className="max-h-[min(65vh,520px)] overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 [&_a]:text-indigo-600 [&_a]:underline dark:[&_a]:text-indigo-400 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-neutral-200 [&_code]:px-1 [&_code]:font-mono dark:[&_code]:bg-neutral-800 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-neutral-100 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
