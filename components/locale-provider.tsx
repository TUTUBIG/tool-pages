"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppLocale } from "@/lib/i18n";

const LocaleContext = createContext<AppLocale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): AppLocale {
  return useContext(LocaleContext);
}
