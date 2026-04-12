import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Data Format Converter | Tools Library",
  description:
    "Convert between JSON, YAML, XML, CSV, and TSV in your browser. Parsing and serialization run locally.",
};

export default function ConvertLayout({ children }: { children: ReactNode }) {
  return children;
}
