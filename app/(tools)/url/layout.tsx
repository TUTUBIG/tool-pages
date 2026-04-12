import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "URL Encoder | Tools Library",
  description: "Encode and decode URL components with percent-encoding in your browser.",
};

export default function UrlLayout({ children }: { children: ReactNode }) {
  return children;
}
