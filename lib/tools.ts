export type ToolCategory =
  | "Development"
  | "Design"
  | "Analytics"
  | "Productivity"
  | "Communication";

export type ToolStatus = "live" | "soon";

export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: string;
  href: string;
  status: ToolStatus;
};

export const FILTER_LABELS = [
  "All",
  "Development",
  "Design",
  "Analytics",
  "Productivity",
  "Communication",
] as const;

export type FilterLabel = (typeof FILTER_LABELS)[number];

export const TOOLS: ToolDefinition[] = [
  {
    id: "code-formatter",
    title: "Code Formatter",
    description: "Format and beautify your code",
    category: "Development",
    icon: "code",
    href: "/tools/code-formatter",
    status: "soon",
  },
  {
    id: "color-picker",
    title: "Color Picker",
    description: "Extract colors from images",
    category: "Design",
    icon: "palette",
    href: "/tools/color-picker",
    status: "soon",
  },
  {
    id: "json-validator",
    title: "JSON Validator",
    description: "Validate and format JSON data",
    category: "Development",
    icon: "database",
    href: "/json",
    status: "live",
  },
  {
    id: "analytics-dashboard",
    title: "Analytics Dashboard",
    description: "Track your metrics",
    category: "Analytics",
    icon: "monitoring",
    href: "/tools/analytics-dashboard",
    status: "soon",
  },
  {
    id: "markdown-editor",
    title: "Markdown Editor",
    description: "Write and preview markdown",
    category: "Productivity",
    icon: "article",
    href: "/tools/markdown-editor",
    status: "soon",
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Optimize image file sizes",
    category: "Design",
    icon: "image",
    href: "/tools/image-compressor",
    status: "soon",
  },
  {
    id: "email-template",
    title: "Email Template",
    description: "Create responsive emails",
    category: "Communication",
    icon: "mail",
    href: "/tools/email-template",
    status: "soon",
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate secure passwords",
    category: "Productivity",
    icon: "lock",
    href: "/tools/password-generator",
    status: "soon",
  },
  {
    id: "api-tester",
    title: "API Tester",
    description: "Test REST API endpoints",
    category: "Development",
    icon: "cloud",
    href: "/tools/api-tester",
    status: "soon",
  },
  {
    id: "regex-builder",
    title: "Regex Builder",
    description: "Build and test regex patterns",
    category: "Development",
    icon: "terminal",
    href: "/tools/regex-builder",
    status: "soon",
  },
  {
    id: "gradient-generator",
    title: "Gradient Generator",
    description: "Create CSS gradients",
    category: "Design",
    icon: "palette",
    href: "/tools/gradient-generator",
    status: "soon",
  },
  {
    id: "base64-encoder",
    title: "Base64 Encoder",
    description: "Encode and decode Base64",
    category: "Development",
    icon: "code_blocks",
    href: "/base64",
    status: "live",
  },
  {
    id: "url-encoder",
    title: "URL Encoder",
    description: "Encode and decode URL components",
    category: "Development",
    icon: "link",
    href: "/url",
    status: "live",
  },
  {
    id: "jwt-tool",
    title: "JWT Parser",
    description: "Parse JWTs and sign HS256 tokens locally",
    category: "Development",
    icon: "key",
    href: "/jwt",
    status: "live",
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Compute SHA hashes of text in your browser",
    category: "Development",
    icon: "hash",
    href: "/hash",
    status: "live",
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate random UUID v4 identifiers",
    category: "Development",
    icon: "fingerprint",
    href: "/uuid",
    status: "live",
  },
  {
    id: "format-converter",
    title: "Data Format Converter",
    description: "Convert JSON, YAML, XML, CSV, and TSV to each other",
    category: "Development",
    icon: "swap_horiz",
    href: "/convert",
    status: "live",
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Currency, temperature, weight, length, and volume",
    category: "Productivity",
    icon: "scale",
    href: "/units",
    status: "live",
  },
];

const byHref = new Map(TOOLS.map((t) => [t.href, t]));

export function getToolByHref(href: string): ToolDefinition | undefined {
  return byHref.get(href);
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.href === `/tools/${slug}`);
}

export const SOON_SLUGS = TOOLS.filter((t) => t.status === "soon" && t.href.startsWith("/tools/")).map(
  (t) => t.id,
);
