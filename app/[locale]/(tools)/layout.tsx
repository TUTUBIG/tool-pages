import type { ReactNode } from "react";
import { ToolShell } from "@/components/tool-shell";

export default function ToolsGroupLayout({ children }: { children: ReactNode }) {
  return <ToolShell>{children}</ToolShell>;
}
