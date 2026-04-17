/** Public repo or org URL for the header link. Override with NEXT_PUBLIC_GITHUB_URL. */
export const SITE_GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/TUTUBIG/tool-pages";

/** Support inbox for product feedback (shown on tool pages). Override with NEXT_PUBLIC_SUPPORT_EMAIL. */
export const SITE_SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@fipulse.tech";

/** Product name (UI + document titles). */
export const SITE_NAME = "ToolFlow";

const githubBase = SITE_GITHUB_URL.replace(/\/$/, "");

/** Open the repo’s new-issue form (optional title prefill). */
export function githubNewIssueUrl(prefillTitle?: string): string {
  const base = `${githubBase}/issues/new`;
  if (!prefillTitle) return base;
  return `${base}?title=${encodeURIComponent(prefillTitle)}`;
}

/** mailto link with optional subject and body for feedback routing. */
export function supportMailtoUrl(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return qs ? `mailto:${SITE_SUPPORT_EMAIL}?${qs}` : `mailto:${SITE_SUPPORT_EMAIL}`;
}

/** Shown on the home page and tool shell — local-only, no backend processing. */
export const SITE_TAGLINE =
  "All processing happens in your browser, nothing is sent to our servers.";

/** Meta description / SEO. */
export const SITE_DESCRIPTION =
  "ToolFlow — small browser-based utilities for development and design. Everything runs locally in your browser; your input is not uploaded or sent to our servers.";
