import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Regex Builder | Tools Library",
  description: "Build and test JavaScript regular expressions against sample text.",
};

export default function RegexLayout({ children }: { children: ReactNode }) {
  return children;
}
