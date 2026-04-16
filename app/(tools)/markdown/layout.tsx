import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Markdown Editor | Tools Library",
  description: "Write Markdown and preview sanitized HTML locally in your browser.",
};

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  return children;
}
