import type { AppLocale } from "@/lib/i18n";
import { DEFAULT_LOCALE, isAppLocale } from "@/lib/i18n";
import type { Messages } from "./types";
import { en } from "./en";
import { zhCN } from "./zh-CN";

export type { Messages } from "./types";

export function resolveLocale(raw: string): AppLocale {
  return isAppLocale(raw) ? raw : DEFAULT_LOCALE;
}

export function getMessages(locale: AppLocale): Messages {
  return locale === "zh-CN" ? zhCN : en;
}
