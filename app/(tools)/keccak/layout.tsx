import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Keccak-256 | Tools Library",
  description: "Compute Keccak-256 over UTF-8 text or hex bytes in your browser.",
};

export default function KeccakLayout({ children }: { children: ReactNode }) {
  return children;
}
