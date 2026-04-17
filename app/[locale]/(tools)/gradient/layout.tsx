import type { ReactNode } from "react";
import { createToolMetadata } from "@/lib/tool-metadata";

export const generateMetadata = createToolMetadata("gradient-generator");

export default function ToolSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
