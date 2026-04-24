import { HomeJsonLd } from "@/components/home-json-ld";
import { ToolFlowHome } from "@/components/toolflow-home";
import { getMessages, resolveLocale } from "@/lib/messages";
import { LOCALES, withLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { TOOLS } from "@/lib/tools";
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
    LOCALES.map((lo) => [lo, absoluteUrl(withLocale(lo, "/"))] as const),
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

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  const m = getMessages(locale);
  const tools = TOOLS.filter((t) => t.status === "live").map((t) => ({
    name: m.tools[t.id]?.title ?? t.title,
    url: absoluteUrl(withLocale(locale, t.href)),
  }));

  return (
    <>
      <HomeJsonLd locale={locale} description={m.site.homeDescription} tools={tools} />
      <ToolFlowHome />
    </>
  );
}
