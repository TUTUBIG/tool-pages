import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "API Tester | Tools Library",
  description: "Send HTTP requests from the browser. Targets must allow CORS.",
};

export default function ApiLayout({ children }: { children: ReactNode }) {
  return children;
}
