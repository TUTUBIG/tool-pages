import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hash Generator | Tools Library",
  description: "Compute SHA-1 and SHA-2 family hashes of text in your browser with Web Crypto.",
};

export default function HashLayout({ children }: { children: ReactNode }) {
  return children;
}
