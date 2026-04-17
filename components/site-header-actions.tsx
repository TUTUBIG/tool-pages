"use client";

import { GitHubLink } from "./github-link";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

/** GitHub, language, theme (search lives beside this in the shell). */
export function SiteHeaderActions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex shrink-0 items-center gap-3 ${className}`}>
      <GitHubLink />
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  );
}
