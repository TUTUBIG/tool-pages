"use client";

import { Clipboard } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function buildHtml(fields: {
  preheader: string;
  title: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
}): string {
  const { preheader, title, body, ctaText, ctaUrl } = fields;
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const bodyHtml = body
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#374151;">${esc(p)}</p>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
<tr><td style="padding:28px 24px 8px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
<h1 style="margin:0 0 8px;font-size:22px;line-height:1.25;color:#111827;">${esc(title)}</h1>
</td></tr>
<tr><td style="padding:0 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
${bodyHtml}
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:8px;"><tr><td style="border-radius:8px;background:linear-gradient(90deg,#6366f1,#9333ea);">
<a href="${esc(ctaUrl)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(ctaText)}</a>
</td></tr></table>
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;font-family:system-ui,sans-serif;">Sent with Tools Library email template</p>
</td></tr></table>
</body></html>`;
}

export function EmailTemplateTool() {
  const [preheader, setPreheader] = useState("You have a new message");
  const [title, setTitle] = useState("Hello from our team");
  const [body, setBody] = useState(
    "Thanks for trying the template.\n\nEdit the fields on the left and watch the preview update.",
  );
  const [ctaText, setCtaText] = useState("Open link");
  const [ctaUrl, setCtaUrl] = useState("https://example.com");
  const [copyDone, setCopyDone] = useState(false);

  const html = useMemo(
    () => buildHtml({ preheader, title, body, ctaText, ctaUrl }),
    [preheader, title, body, ctaText, ctaUrl],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [html]);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void copy()}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-indigo-400"
        >
          <Clipboard className="h-4 w-4" />
          {copyDone ? "Copied HTML" : "Copy HTML"}
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Preheader (hidden preview text)
            <input
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Body (paragraphs separated by blank lines)
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Button label
              <input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Button URL
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
          </div>
        </div>
        <div className="min-h-[420px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <iframe title="Email preview" className="h-[min(560px,70vh)] w-full bg-white" srcDoc={html} />
        </div>
      </div>
    </div>
  );
}
