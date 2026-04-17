"use client";

import { GitHubIcon } from "@/components/github-icon";
import { LocaleLink } from "@/components/locale-link";
import { useLocale } from "@/components/locale-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getMessages } from "@/lib/messages";
import { useMemo, useState } from "react";
import { FILTER_LABELS, TOOLS, type FilterLabel, type ToolDefinition } from "@/lib/tools";
import { useHydratedMostUsedToolIds } from "@/hooks/use-hydrated-most-used-tool-ids";
import { getToolLucideIcon } from "@/lib/tool-lucide-icons";
import { SITE_GITHUB_URL } from "@/lib/site";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";
import { ToolflowLogoMark, ToolflowWordmark } from "./toolflow-logo";

function matchesFilter(
  tool: ToolDefinition,
  filter: FilterLabel,
  mostUsedIds: readonly string[],
): boolean {
  if (filter === "Most used") return mostUsedIds.includes(tool.id);
  return tool.category === filter;
}

export function ToolFlowHome() {
  const locale = useLocale();
  const m = useMemo(() => getMessages(locale), [locale]);
  const [filter, setFilter] = useState<FilterLabel>("Most used");
  const { ids: mostUsedIds, usageHydrated, hasUsageRecords } = useHydratedMostUsedToolIds();

  const visible = useMemo(() => {
    const filtered = TOOLS.filter((t) => matchesFilter(t, filter, mostUsedIds));
    if (filter !== "Most used") return filtered;
    const byId = new Map(filtered.map((t) => [t.id, t]));
    return mostUsedIds
      .map((id) => byId.get(id))
      .filter((t): t is ToolDefinition => t != null);
  }, [filter, mostUsedIds]);

  const emptyCategoryMessage =
    filter === "Most used" && !usageHydrated
      ? m.site.emptyMostUsedLoading
      : filter === "Most used" && usageHydrated && !hasUsageRecords
        ? m.site.emptyMostUsedNoRecords
        : m.site.emptyCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 font-[family-name:var(--font-inter)] transition-colors dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <ToolflowLogoMark size={44} className="h-11 w-11 shrink-0" decorative />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight">
                  <ToolflowWordmark className="text-xl" />
                </h1>
                <p className="mt-0.5 max-w-xl text-xs leading-snug text-neutral-600 sm:text-sm dark:text-neutral-400">
                  {m.site.tagline}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={SITE_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-neutral-100 p-2 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="GitHub"
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex justify-center">
            <SearchTrigger variant="field" placeholder={m.site.searchPlaceholder} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
            {FILTER_LABELS.map((category) => {
              const active = filter === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFilter(category)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {m.filters[category]}
                </button>
              );
            })}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((tool) => {
              const Icon = getToolLucideIcon(tool.id);
              const copy = m.tools[tool.id];
              return (
                <LocaleLink
                  key={tool.id}
                  href={tool.href}
                  className={`group rounded-xl border border-neutral-200 bg-white/50 p-6 text-left backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-indigo-400 dark:hover:shadow-indigo-500/5 ${
                    tool.status === "soon" ? "opacity-90" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="w-fit rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-3 transition-all group-hover:from-indigo-500 group-hover:to-purple-600 dark:from-indigo-950/50 dark:to-purple-950/50">
                      <Icon className="h-6 w-6 text-indigo-600 transition-colors group-hover:text-white dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">
                        {copy?.title ?? tool.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {copy?.description ?? tool.description}
                      </p>
                      <span className="mt-4 inline-block rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500">
                        {m.categories[tool.category]}
                      </span>
                    </div>
                  </div>
                </LocaleLink>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-neutral-500 dark:text-neutral-400" role="status">
              {emptyCategoryMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
