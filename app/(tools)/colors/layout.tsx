import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Color Picker | Tools Library",
  description: "Sample hex and RGB colors from an image in your browser.",
};

export default function ColorsLayout({ children }: { children: ReactNode }) {
  return children;
}
