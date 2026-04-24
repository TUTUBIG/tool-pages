import type { Metadata } from "next";
import { getMessages, resolveLocale } from "@/lib/messages";
import { LOCALES, withLocale } from "@/lib/i18n";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

function pathForToolId(toolId: string): string {
  const t = TOOLS.find((x) => x.id === toolId);
  return t?.href ?? "/";
}

export function createToolMetadata(toolId: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale: raw } = await params;
    const locale = resolveLocale(raw);
    const m = getMessages(locale);
    const tool = m.tools[toolId];
    const path = pathForToolId(toolId);
    if (!tool) {
      return { title: SITE_NAME };
    }
    const languages = Object.fromEntries(
      LOCALES.map((lo) => [lo, absoluteUrl(withLocale(lo, path))] as const),
    ) as Record<string, string>;
    return {
      title: tool.title,
      description: tool.metaDescription,
      alternates: {
        canonical: withLocale(locale, path),
        languages,
      },
    };
  };
}
