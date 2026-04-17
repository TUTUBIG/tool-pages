"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { LocaleLink } from "@/components/locale-link";
import { useLocale } from "@/components/locale-provider";
import { getMessages } from "@/lib/messages";
import { withLocale } from "@/lib/i18n";
import { incrementToolUse } from "@/lib/tool-usage";
import { TOOLS, getToolByHref } from "@/lib/tools";
import { getToolLucideIcon } from "@/lib/tool-lucide-icons";
import { SearchTrigger } from "./search-trigger";
import { SiteHeaderActions } from "./site-header-actions";
import { ToolFeedback } from "./tool-feedback";
import { ToolflowLogoMark, ToolflowWordmark } from "./toolflow-logo";

export function ToolShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const m = useMemo(() => getMessages(locale), [locale]);
  const current = getToolByHref(pathname);
  const currentCopy = current ? m.tools[current.id] : undefined;

  useEffect(() => {
    const tool = getToolByHref(pathname);
    if (!tool || tool.status !== "live") return;
    incrementToolUse(tool.id);
  }, [pathname]);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 font-[family-name:var(--font-inter)] transition-colors dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <header className="shrink-0 border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <LocaleLink
              href="/"
              className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label={m.site.backToHome}
            >
              <ArrowLeft className="h-5 w-5" />
            </LocaleLink>
            <div className="flex min-w-0 items-center gap-2">
              <ToolflowLogoMark size={36} className="h-9 w-9 shrink-0" decorative />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold leading-tight">
                  <ToolflowWordmark className="text-lg" />
                </h1>
                <p className="mt-0.5 line-clamp-2 max-w-[min(100%,22rem)] text-[10px] leading-snug text-neutral-500 sm:max-w-lg sm:text-xs dark:text-neutral-400">
                  {m.site.tagline}
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <div className="min-w-0 max-w-2xl flex-1">
              <SearchTrigger variant="compact" placeholder={m.site.searchPlaceholder} />
            </div>
            <SiteHeaderActions />
          </div>
        </div>
      </header>

      <nav
        className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-neutral-200 px-3 py-2 dark:border-neutral-800 md:hidden"
        aria-label={m.site.toolsNav}
      >
        {TOOLS.map((tool) => {
          const localized = withLocale(locale, tool.href);
          const active = pathname === localized;
          const copy = m.tools[tool.id];
          return (
            <LocaleLink
              key={tool.id}
              href={tool.href}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {copy?.title ?? tool.title}
            </LocaleLink>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="sticky top-0 hidden h-full w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50 md:flex md:flex-col">
          <div className="p-4">
            <h2 className="mb-3 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              {m.site.toolsNav}
            </h2>
            <nav className="space-y-1" aria-label={m.site.toolsNav}>
              {TOOLS.map((tool) => {
                const Icon = getToolLucideIcon(tool.id);
                const localized = withLocale(locale, tool.href);
                const active = pathname === localized;
                const copy = m.tools[tool.id];
                return (
                  <LocaleLink
                    key={tool.id}
                    href={tool.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${active ? "text-white" : ""}`}
                    />
                    <span className="truncate">{copy?.title ?? tool.title}</span>
                  </LocaleLink>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-8">
          {current && currentCopy ? (
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
                {currentCopy.title}
              </h1>
              <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                {currentCopy.description}
              </p>
            </header>
          ) : null}
          {children}
          {current && currentCopy ? <ToolFeedback toolTitle={currentCopy.title} /> : null}
        </main>
      </div>
    </div>
  );
}
