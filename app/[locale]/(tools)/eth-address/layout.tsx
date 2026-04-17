import type { ReactNode } from "react";
import { createToolMetadata } from "@/lib/tool-metadata";

export const generateMetadata = createToolMetadata("eth-address");

export default function ToolSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
