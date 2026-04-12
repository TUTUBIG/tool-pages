import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Unit Converter | Tools Library",
  description:
    "Convert currency (live ECB-based rates), temperature, weight, length, and volume in your browser.",
};

export default function UnitsLayout({ children }: { children: ReactNode }) {
  return children;
}
