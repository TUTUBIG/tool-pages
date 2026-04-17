"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { LocaleLink } from "@/components/locale-link";
import { useLocale } from "@/components/locale-provider";
import { getMessages, type Messages } from "@/lib/messages";
import { TOOLS, type ToolDefinition } from "@/lib/tools";
import { useHydratedMostUsedToolIds } from "@/hooks/use-hydrated-most-used-tool-ids";
import { getToolLucideIcon } from "@/lib/tool-lucide-icons";
import { useSearchModal } from "./search-modal-context";

function matchesQuery(
  tool: ToolDefinition,
  q: string,
  mostUsedIds: Set<string>,
  messages: Messages,
) {
  if (!q.trim()) return false;
  const s = q.trim().toLowerCase();
  const copy = messages.tools[tool.id];
  const hay = [
    copy?.title,
    copy?.description,
    tool.title,
    tool.description,
    messages.categories[tool.category],
    tool.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    hay.includes(s) ||
    (s.replace(/\s+/g, "").includes("mostused") && mostUsedIds.has(tool.id))
  );
}

function ToolsSearchModalInner({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const messages = useMemo(() => getMessages(locale), [locale]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const [query, setQuery] = useState("");
  const { ids: mostUsedIds } = useHydratedMostUsedToolIds(999);

  const filteredTools = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const mostUsed = new Set(mostUsedIds);
    return TOOLS.filter((t) => matchesQuery(t, q, mostUsed, messages));
  }, [query, mostUsedIds, messages]);

  const groupedResults = useMemo(() => {
    return filteredTools.reduce(
      (acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
      },
      {} as Record<string, ToolDefinition[]>,
    );
  }, [filteredTools]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const emptyHint =
    query.trim() === ""
      ? messages.site.searchModalStartTyping
      : filteredTools.length === 0
        ? messages.site.searchModalNoResults.replace("{query}", query)
        : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 z-50 flex cursor-pointer items-start justify-center px-4 pt-[20vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={panelId}
          className="flex max-h-[60vh] w-full max-w-2xl cursor-default flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-700">
            <Search className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-500" aria-hidden />
            <input
              ref={inputRef}
              id={panelId}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500"
              placeholder={messages.site.searchModalPlaceholder}
              type="search"
              autoComplete="off"
            />
            <button
              type="button"
              className="rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Close search"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {emptyHint ? (
              <p className="py-12 text-center text-neutral-500 dark:text-neutral-400">{emptyHint}</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedResults).map(([category, categoryTools]) => (
                  <div key={category}>
                    <h3 className="mb-2 px-2 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                      {messages.categories[category as keyof Messages["categories"]]}
                    </h3>
                    <div className="space-y-1">
                      {categoryTools.map((tool) => {
                        const Icon = getToolLucideIcon(tool.id);
                        const copy = messages.tools[tool.id];
                        return (
                          <LocaleLink
                            key={tool.id}
                            href={tool.href}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            onClick={onClose}
                          >
                            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-2 dark:from-indigo-950/50 dark:to-purple-950/50">
                              <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-neutral-900 dark:text-white">
                                {copy?.title ?? tool.title}
                              </div>
                              <div className="truncate text-sm text-neutral-600 dark:text-neutral-400">
                                {copy?.description ?? tool.description}
                              </div>
                            </div>
                          </LocaleLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            {messages.site.searchModalFooter}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolsSearchModal() {
  const { open, setOpen } = useSearchModal();
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  if (!open) return null;
  return <ToolsSearchModalInner onClose={onClose} />;
}
