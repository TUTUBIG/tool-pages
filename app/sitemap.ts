import type { MetadataRoute } from "next";
import { LOCALES, withLocale, type AppLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export const dynamic = "force-static";

function localePaths(locale: AppLocale): string[] {
  const home = withLocale(locale, "/");
  const tools = TOOLS.filter((t) => t.status === "live").map((t) => withLocale(locale, t.href));
  return [home, ...tools];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of localePaths(locale)) {
      const isHome = path === `/${locale}`;
      entries.push({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: isHome ? "weekly" : "monthly",
        priority: isHome ? 1 : 0.8,
      });
    }
  }

  return entries;
}
