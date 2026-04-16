import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Wei ↔ Human | Tools Library",
  description:
    "Convert Ethereum-style base units (wei) to human-readable decimals and back using ERC-20 decimals. Runs locally in your browser.",
};

export default function WeiLayout({ children }: { children: ReactNode }) {
  return children;
}
