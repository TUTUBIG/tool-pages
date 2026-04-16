import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Function selector | Tools Library",
  description:
    "Compute the Solidity 4-byte function selector from a canonical signature. Runs locally in your browser.",
};

export default function SelectorLayout({ children }: { children: ReactNode }) {
  return children;
}
