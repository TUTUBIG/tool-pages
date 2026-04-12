import { GitHubIcon } from "@/components/github-icon";
import { SITE_GITHUB_URL } from "@/lib/site";

export function GitHubLink() {
  return (
    <a
      href={SITE_GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg bg-neutral-100 p-2 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      aria-label="View on GitHub"
      title="GitHub"
    >
      <GitHubIcon className="h-5 w-5" />
    </a>
  );
}
