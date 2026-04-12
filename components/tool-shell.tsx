"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SITE_TAGLINE } from "@/lib/site";
import { TOOLS, getToolByHref } from "@/lib/tools";
import { getToolLucideIcon } from "@/lib/tool-lucide-icons";
import { SearchTrigger } from "./search-trigger";
import { SiteHeaderActions } from "./site-header-actions";

export function ToolShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = getToolByHref(pathname);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 font-[family-name:var(--font-inter)] transition-colors dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <header className="shrink-0 border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex min-w-0 items-center gap-2">
              <div className="shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
                <Zap className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold leading-tight text-neutral-900 dark:text-white">
                  Tools Library
                </h1>
                <p className="mt-0.5 line-clamp-2 max-w-[min(100%,22rem)] text-[10px] leading-snug text-neutral-500 sm:max-w-lg sm:text-xs dark:text-neutral-400">
                  {SITE_TAGLINE}
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <div className="min-w-0 max-w-2xl flex-1">
              <SearchTrigger variant="compact" />
            </div>
            <SiteHeaderActions />
          </div>
        </div>
      </header>

      <nav
        className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-neutral-200 px-3 py-2 dark:border-neutral-800 md:hidden"
        aria-label="Tools"
      >
        {TOOLS.map((tool) => {
          const active = pathname === tool.href;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {tool.title}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="sticky top-0 hidden h-full w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50 md:flex md:flex-col">
          <div className="p-4">
            <h2 className="mb-3 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Tools
            </h2>
            <nav className="space-y-1" aria-label="Tools">
              {TOOLS.map((tool) => {
                const Icon = getToolLucideIcon(tool.id);
                const active = pathname === tool.href;
                return (
                  <Link
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
                    <span className="truncate">{tool.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-8">
          {current ? (
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
                {current.title}
              </h1>
              <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                {current.description}
              </p>
            </header>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
