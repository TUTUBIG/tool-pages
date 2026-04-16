import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Password Generator | Tools Library",
  description: "Generate strong random passwords locally with crypto.getRandomValues.",
};

export default function PasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
