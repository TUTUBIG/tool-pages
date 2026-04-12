import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Base64 Encoder | Tools Library",
  description: "Encode and decode text with Base64 in your browser.",
};

export default function Base64Layout({ children }: { children: ReactNode }) {
  return children;
}
