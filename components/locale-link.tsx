"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/locale-provider";
import { withLocale } from "@/lib/i18n";

type LinkProps = ComponentProps<typeof Link>;

export function LocaleLink({
  href,
  ...rest
}: Omit<LinkProps, "href"> & { href: string }) {
  const locale = useLocale();
  const localized =
    href.startsWith("http://") || href.startsWith("https://")
      ? href
      : withLocale(locale, href);
  return <Link href={localized} {...rest} />;
}
