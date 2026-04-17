import { ToolFlowHome } from "@/components/toolflow-home";
import { getMessages, resolveLocale } from "@/lib/messages";
import { LOCALES, withLocale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const m = getMessages(locale);
  const languages = Object.fromEntries(
    LOCALES.map((lo) => [lo, withLocale(lo, "/")] as const),
  ) as Record<string, string>;
  return {
    title: { absolute: m.site.homeTitle },
    description: m.site.homeDescription,
    alternates: {
      canonical: withLocale(locale, "/"),
      languages,
    },
  };
}

export default function Home() {
  return <ToolFlowHome />;
}
