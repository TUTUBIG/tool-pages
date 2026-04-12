import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "JSON Validator | Tools Library",
  description: "Validate JSON syntax and pretty-print with consistent indentation in your browser.",
};

export default function JsonLayout({ children }: { children: ReactNode }) {
  return children;
}
