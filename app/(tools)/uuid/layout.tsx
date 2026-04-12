import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "UUID Generator | Tools Library",
  description: "Generate cryptographically random UUID version 4 identifiers in your browser.",
};

export default function UuidLayout({ children }: { children: ReactNode }) {
  return children;
}
