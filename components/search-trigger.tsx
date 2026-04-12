"use client";

import { Search } from "lucide-react";
import { useSearchModal } from "./search-modal-context";

type Props = {
  className?: string;
  placeholder?: string;
  /** When true, looks like the wide home search bar (Figma / Untitled) */
  variant?: "field" | "compact";
};

export function SearchTrigger({
  className = "",
  placeholder = "Search tools...",
  variant = "compact",
}: Props) {
  const { setOpen } = useSearchModal();

  if (variant === "field") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full max-w-2xl items-center gap-3 rounded-xl border border-neutral-200 bg-white px-6 py-4 text-left text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 ${className}`}
      >
        <Search className="h-5 w-5 shrink-0" aria-hidden />
        <span className="flex-1">{placeholder}</span>
        <kbd className="hidden items-center rounded border border-neutral-200 bg-neutral-100 px-2.5 py-1 font-mono text-xs font-medium text-neutral-600 sm:inline-flex dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`relative flex w-full min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white py-2 pr-3 pl-9 text-left text-sm text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 ${className}`}
    >
      <Search
        className="pointer-events-none absolute left-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-500"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{placeholder}</span>
      <kbd className="hidden shrink-0 items-center rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] text-neutral-600 md:inline-flex dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
        ⌘K
      </kbd>
    </button>
  );
}
