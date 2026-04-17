import type { ReactNode } from "react";
import { createToolMetadata } from "@/lib/tool-metadata";

export const generateMetadata = createToolMetadata("function-selector");

export default function ToolSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
