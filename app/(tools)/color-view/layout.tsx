import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Color preview | Tools Library",
  description: "Enter a CSS color (hex, rgb(), hsl(), or name) and preview it in your browser.",
};

export default function ColorViewLayout({ children }: { children: ReactNode }) {
  return children;
}
