import type { ReactNode } from "react";
import { createToolMetadata } from "@/lib/tool-metadata";

export const generateMetadata = createToolMetadata("svg-to-ico");

export default function ToolSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
