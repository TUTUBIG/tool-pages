export const LOCALES = ["en", "zh-CN"] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export function isAppLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * If `pathname` starts with `/${locale}/` or equals `/${locale}`, returns the
 * locale and the path **without** the locale prefix (always starts with `/`).
 */
export function stripLocaleFromPathname(pathname: string): {
  locale: AppLocale;
  pathname: string;
} | null {
  for (const locale of LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix) {
      return { locale, pathname: "/" };
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return { locale, pathname: pathname.slice(prefix.length) };
    }
  }
  return null;
}

/** Prefix a site path with locale (`/json` → `/en/json`). Leaves full URLs unchanged. */
export function withLocale(locale: AppLocale, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  for (const lo of LOCALES) {
    if (normalized === `/${lo}` || normalized.startsWith(`/${lo}/`)) {
      return normalized;
    }
  }
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}
