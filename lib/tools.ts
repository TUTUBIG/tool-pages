export type ToolCategory =
  | "Development"
  | "Web3"
  | "Design"
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

/** Default “Most used” order before any local visit counts exist (see `lib/tool-usage.ts`). */
export const MOST_USED_TOOL_IDS: readonly string[] = [
  "json-validator",
  "base64-encoder",
  "hash-generator",
  "jwt-tool",
  "format-converter",
  "password-generator",
  "regex-builder",
  "markdown-editor",
  "abi-codec",
  "wei-human",
  "url-encoder",
  "uuid-generator",
];

export const FILTER_LABELS = [
  "Most used",
  "Development",
  "Web3",
  "Design",
  "Productivity",
  "Communication",
] as const;

export type FilterLabel = (typeof FILTER_LABELS)[number];

export const TOOLS: ToolDefinition[] = [
  {
    id: "color-picker",
    title: "Color Picker",
    description: "Sample hex and RGB from images — most used style eyedropper workflow",
    category: "Design",
    icon: "palette",
    href: "/colors",
    status: "live",
  },
  {
    id: "color-preview",
    title: "Color preview",
    description: "Enter a hex, rgb(), hsl(), or CSS color name and see it on screen",
    category: "Design",
    icon: "square",
    href: "/color-view",
    status: "live",
  },
  {
    id: "markdown-editor",
    title: "Markdown Editor",
    description: "Write Markdown and preview HTML locally — most used for docs and READMEs",
    category: "Productivity",
    icon: "article",
    href: "/markdown",
    status: "live",
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Shrink JPEG or WebP quality in the browser before upload",
    category: "Design",
    icon: "image",
    href: "/image-compress",
    status: "live",
  },
  {
    id: "email-template",
    title: "Email Template",
    description: "Fill a responsive table layout and copy HTML for campaigns",
    category: "Communication",
    icon: "mail",
    href: "/email",
    status: "live",
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Strong random passwords with most used charset options",
    category: "Productivity",
    icon: "lock",
    href: "/password",
    status: "live",
  },
  {
    id: "api-tester",
    title: "API Tester",
    description: "Send HTTP requests from the browser (CORS permitting)",
    category: "Development",
    icon: "cloud",
    href: "/api",
    status: "live",
  },
  {
    id: "regex-builder",
    title: "Regex Builder",
    description: "Build and test regular expressions against sample text",
    category: "Development",
    icon: "terminal",
    href: "/regex",
    status: "live",
  },
  {
    id: "gradient-generator",
    title: "Gradient Generator",
    description: "Create CSS linear-gradient strings with live preview",
    category: "Design",
    icon: "palette",
    href: "/gradient",
    status: "live",
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
  {
    id: "uniswap-sqrt",
    title: "Uniswap sqrtPriceX96",
    description: "Decode and encode V3 pool sqrt price (Q64.96)",
    category: "Web3",
    icon: "droplets",
    href: "/uniswap-sqrt",
    status: "live",
  },
  {
    id: "wei-human",
    title: "Wei ↔ Human",
    description: "Convert base units to human decimals and back",
    category: "Web3",
    icon: "coins",
    href: "/wei",
    status: "live",
  },
  {
    id: "eth-address",
    title: "Ethereum address",
    description: "Validate addresses and apply EIP-55 checksum locally",
    category: "Web3",
    icon: "wallet",
    href: "/eth-address",
    status: "live",
  },
  {
    id: "function-selector",
    title: "Function selector",
    description: "Compute the 4-byte selector from a function signature",
    category: "Web3",
    icon: "binary",
    href: "/selector",
    status: "live",
  },
  {
    id: "keccak256",
    title: "Keccak-256",
    description: "Hash UTF-8 text or hex bytes with Keccak-256",
    category: "Web3",
    icon: "hash",
    href: "/keccak",
    status: "live",
  },
  {
    id: "hex-bytes",
    title: "Hex ↔ UTF-8",
    description: "Convert hex strings to UTF-8 text and back",
    category: "Web3",
    icon: "file-code",
    href: "/hex",
    status: "live",
  },
  {
    id: "abi-codec",
    title: "ABI encode / decode",
    description: "Encode and decode ABI values with a local AbiCoder",
    category: "Web3",
    icon: "braces",
    href: "/abi",
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
