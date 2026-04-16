import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gradient Generator | Tools Library",
  description: "Build CSS linear-gradient() values with a live preview.",
};

export default function GradientLayout({ children }: { children: ReactNode }) {
  return children;
}
