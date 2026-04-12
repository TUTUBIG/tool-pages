import { notFound } from "next/navigation";
import { getToolBySlug, SOON_SLUGS } from "@/lib/tools";

export function generateStaticParams() {
  return SOON_SLUGS.map((slug) => ({ slug }));
}

export default async function ToolSoonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || tool.status !== "soon") {
    notFound();
  }

  return (
    <div className="flex min-h-[min(60vh,480px)] items-center justify-center rounded-2xl border border-neutral-200 bg-white/80 shadow-inner dark:border-neutral-700 dark:bg-neutral-900/50">
      <p className="text-lg text-neutral-600 dark:text-neutral-400">Coming soon</p>
    </div>
  );
}
