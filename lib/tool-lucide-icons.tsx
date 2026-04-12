import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Code,
  Database,
  FileText,
  Image,
  LineChart,
  Lock,
  Mail,
  Palette,
  Terminal,
} from "lucide-react";

/** Lucide icons for each tool id — matches Untitled / Figma bundle. */
export const TOOL_LUCIDE_ICONS: Record<string, LucideIcon> = {
  "code-formatter": Code,
  "color-picker": Palette,
  "json-validator": Database,
  "analytics-dashboard": LineChart,
  "markdown-editor": FileText,
  "image-compressor": Image,
  "email-template": Mail,
  "password-generator": Lock,
  "api-tester": Cloud,
  "regex-builder": Terminal,
  "gradient-generator": Palette,
  "base64-encoder": Code,
};

export function getToolLucideIcon(id: string): LucideIcon {
  return TOOL_LUCIDE_ICONS[id] ?? Code;
}
