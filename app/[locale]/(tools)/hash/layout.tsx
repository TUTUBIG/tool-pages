import type { ReactNode } from "react";
import { createToolMetadata } from "@/lib/tool-metadata";

export const generateMetadata = createToolMetadata("hash-generator");

export default function ToolSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
