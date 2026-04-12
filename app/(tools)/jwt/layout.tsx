import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "JWT Parser | Tools Library",
  description: "Decode JWT header and payload, and sign HS256 tokens locally with Web Crypto.",
};

export default function JwtLayout({ children }: { children: ReactNode }) {
  return children;
}
