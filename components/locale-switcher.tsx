"use client";

import { usePathname, useRouter } from "next/navigation";
import { stripLocaleFromPathname, withLocale, type AppLocale } from "@/lib/i18n";

const OPTIONS: { locale: AppLocale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "zh-CN", label: "中文" },
];

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const parsed = stripLocaleFromPathname(pathname);
  const current = parsed?.locale ?? "en";

  function go(target: AppLocale) {
    if (target === current) return;
    const rest = parsed?.pathname ?? "/";
    router.push(withLocale(target, rest));
  }

  return (
    <div
      className={`flex shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-600 dark:bg-neutral-800 ${className}`}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map(({ locale, label }) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => go(locale)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
