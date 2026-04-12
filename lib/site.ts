/** Public repo or org URL for the header link. Override with NEXT_PUBLIC_GITHUB_URL. */
export const SITE_GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";

/** Shown on the home page and tool shell — local-only, no backend processing. */
export const SITE_TAGLINE =
  "All processing happens in your browser—nothing is sent to our servers.";

/** Meta description / SEO. */
export const SITE_DESCRIPTION =
  "Small browser-based utilities for development and design. Everything runs locally in your browser; your input is not uploaded or sent to our servers.";
