import { LocaleProvider } from "@/components/locale-provider";
import { isAppLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh-CN" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
