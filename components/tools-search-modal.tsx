"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { TOOLS, type ToolDefinition } from "@/lib/tools";
import { getToolLucideIcon } from "@/lib/tool-lucide-icons";
import { useSearchModal } from "./search-modal-context";

function matchesQuery(tool: ToolDefinition, q: string) {
  if (!q.trim()) return false;
  const s = q.trim().toLowerCase();
  return (
    tool.title.toLowerCase().includes(s) ||
    tool.description.toLowerCase().includes(s) ||
    tool.category.toLowerCase().includes(s)
  );
}

function ToolsSearchModalInner({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const [query, setQuery] = useState("");

  const filteredTools = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return TOOLS.filter((t) => matchesQuery(t, q));
  }, [query]);

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
      ? "Start typing to search all tools"
      : filteredTools.length === 0
        ? `No tools found matching "${query}"`
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
              placeholder="Search all tools..."
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
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {categoryTools.map((tool) => {
                        const Icon = getToolLucideIcon(tool.id);
                        return (
                          <Link
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
                                {tool.title}
                              </div>
                              <div className="truncate text-sm text-neutral-600 dark:text-neutral-400">
                                {tool.description}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            <span>Press </span>
            <kbd className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 dark:border-neutral-700 dark:bg-neutral-800">
              ESC
            </kbd>
            <span> to close</span>
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
