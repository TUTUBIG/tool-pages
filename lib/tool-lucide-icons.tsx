import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Cloud,
  Code,
  Database,
  FileText,
  Fingerprint,
  Hash,
  Image,
  KeyRound,
  LineChart,
  Link,
  Lock,
  Mail,
  Palette,
  Scale,
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
  "url-encoder": Link,
  "jwt-tool": KeyRound,
  "hash-generator": Hash,
  "uuid-generator": Fingerprint,
  "format-converter": ArrowLeftRight,
  "unit-converter": Scale,
};

export function getToolLucideIcon(id: string): LucideIcon {
  return TOOL_LUCIDE_ICONS[id] ?? Code;
}
