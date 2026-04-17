"use client";

import { Mail } from "lucide-react";
import { useMemo } from "react";
import { GitHubIcon } from "@/components/github-icon";
import { useLocale } from "@/components/locale-provider";
import { getMessages } from "@/lib/messages";
import { SITE_NAME, githubNewIssueUrl, supportMailtoUrl } from "@/lib/site";

type Props = {
  /** Localized tool name for issue / email subject lines */
  toolTitle: string;
};

export function ToolFeedback({ toolTitle }: Props) {
  const locale = useLocale();
  const m = useMemo(() => getMessages(locale), [locale]);
  const subject = `[${SITE_NAME}] ${toolTitle} — feedback`;

  return (
    <aside
      className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800"
      aria-labelledby="tool-feedback-heading"
    >
      <h2
        id="tool-feedback-heading"
        className="text-sm font-semibold tracking-wide text-neutral-900 uppercase dark:text-white"
      >
        {m.site.toolFeedbackHeading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {m.site.toolFeedbackBody}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={githubNewIssueUrl(subject)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-indigo-500 dark:hover:bg-neutral-700"
        >
          <GitHubIcon className="h-4 w-4 shrink-0 opacity-80" />
          {m.site.toolFeedbackGitHub}
        </a>
        <a
          href={supportMailtoUrl(subject)}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-indigo-500 dark:hover:bg-neutral-700"
        >
          <Mail className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          {m.site.toolFeedbackEmail}
        </a>
      </div>
    </aside>
  );
}
