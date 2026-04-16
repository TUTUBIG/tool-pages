import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Email Template | Tools Library",
  description: "Fill a simple responsive HTML email and copy the markup locally.",
};

export default function EmailLayout({ children }: { children: ReactNode }) {
  return children;
}
