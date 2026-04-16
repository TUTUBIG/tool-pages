import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hex ↔ UTF-8 | Tools Library",
  description: "Convert between hexadecimal byte strings and UTF-8 text locally in your browser.",
};

export default function HexLayout({ children }: { children: ReactNode }) {
  return children;
}
