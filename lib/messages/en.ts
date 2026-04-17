import type { Messages } from "./types";

export const en: Messages = {
  site: {
    tagline: "All processing happens in your browser, nothing is sent to our servers.",
    homeTitle: "ToolFlow",
    homeDescription:
      "ToolFlow — small browser-based utilities for development and design. Everything runs locally in your browser; your input is not uploaded or sent to our servers.",
    searchPlaceholder: "Search tools…",
    toolsNav: "Tools",
    backToHome: "Back to home",
    emptyMostUsedLoading: "Loading…",
    emptyMostUsedNoRecords: "There is no record in Most used.",
    emptyCategory: "No tools found in this category.",
    searchModalPlaceholder: "Search all tools…",
    searchModalStartTyping: "Start typing to search all tools",
    searchModalNoResults: 'No tools found matching "{query}"',
    searchModalFooter: "Press ESC to close",
  },
  filters: {
    "Most used": "Most used",
    Development: "Development",
    Web3: "Web3",
    Design: "Design",
    Productivity: "Productivity",
    Communication: "Communication",
  },
  categories: {
    Development: "Development",
    Web3: "Web3",
    Design: "Design",
    Productivity: "Productivity",
    Communication: "Communication",
  },
  tools: {
    "color-picker": {
      title: "Color Picker",
      description: "Sample hex and RGB from images — most used style eyedropper workflow",
      metaDescription: "Sample hex and RGB colors from an image in your browser.",
    },
    "color-preview": {
      title: "Color preview",
      description: "Enter a hex, rgb(), hsl(), or CSS color name and see it on screen",
      metaDescription:
        "Enter a CSS color (hex, rgb(), hsl(), or name) and preview it in your browser.",
    },
    "markdown-editor": {
      title: "Markdown Editor",
      description: "Write Markdown and preview HTML locally — most used for docs and READMEs",
      metaDescription: "Write Markdown and preview sanitized HTML locally in your browser.",
    },
    "image-compressor": {
      title: "Image Compressor",
      description: "Shrink JPEG or WebP quality in the browser before upload",
      metaDescription: "Re-encode images in the browser with adjustable JPEG or WebP quality.",
    },
    "email-template": {
      title: "Email Template",
      description: "Fill a responsive table layout and copy HTML for campaigns",
      metaDescription: "Fill a simple responsive HTML email and copy the markup locally.",
    },
    "password-generator": {
      title: "Password Generator",
      description: "Strong random passwords with most used charset options",
      metaDescription: "Generate strong random passwords locally with crypto.getRandomValues.",
    },
    "api-tester": {
      title: "API Tester",
      description: "Send HTTP requests from the browser (CORS permitting)",
      metaDescription: "Send HTTP requests from the browser. Targets must allow CORS.",
    },
    "regex-builder": {
      title: "Regex Builder",
      description: "Build and test regular expressions against sample text",
      metaDescription: "Build and test JavaScript regular expressions against sample text.",
    },
    "gradient-generator": {
      title: "Gradient Generator",
      description: "Create CSS linear-gradient strings with live preview",
      metaDescription: "Build CSS linear-gradient() values with a live preview.",
    },
    "json-validator": {
      title: "JSON Validator",
      description: "Validate and format JSON data",
      metaDescription:
        "Validate JSON syntax and pretty-print with consistent indentation in your browser.",
    },
    "base64-encoder": {
      title: "Base64 Encoder",
      description: "Encode and decode Base64",
      metaDescription: "Encode and decode text with Base64 in your browser.",
    },
    "url-encoder": {
      title: "URL Encoder",
      description: "Encode and decode URL components",
      metaDescription: "Encode and decode URL components with percent-encoding in your browser.",
    },
    "jwt-tool": {
      title: "JWT Parser",
      description: "Parse JWTs and sign HS256 tokens locally",
      metaDescription: "Decode JWT header and payload, and sign HS256 tokens locally with Web Crypto.",
    },
    "hash-generator": {
      title: "Hash Generator",
      description: "Compute SHA hashes of text in your browser",
      metaDescription: "Compute SHA-1 and SHA-2 family hashes of text in your browser with Web Crypto.",
    },
    "uuid-generator": {
      title: "UUID Generator",
      description: "Generate random UUID v4 identifiers",
      metaDescription: "Generate cryptographically random UUID version 4 identifiers in your browser.",
    },
    "format-converter": {
      title: "Data Format Converter",
      description: "Convert JSON, YAML, XML, CSV, and TSV to each other",
      metaDescription:
        "Convert between JSON, YAML, XML, CSV, and TSV in your browser. Parsing and serialization run locally.",
    },
    "unit-converter": {
      title: "Unit Converter",
      description: "Currency, temperature, weight, length, and volume",
      metaDescription:
        "Convert currency (live ECB-based rates), temperature, weight, length, and volume in your browser.",
    },
    "uniswap-sqrt": {
      title: "Uniswap sqrtPriceX96",
      description: "Decode and encode V3 pool sqrt price (Q64.96)",
      metaDescription:
        "Decode and encode Uniswap V3 sqrtPriceX96 (Q64.96) to human price with token decimals. Runs locally in your browser.",
    },
    "wei-human": {
      title: "Wei ↔ Human",
      description: "Convert base units to human decimals and back",
      metaDescription:
        "Convert Ethereum-style base units (wei) to human-readable decimals and back using ERC-20 decimals. Runs locally in your browser.",
    },
    "eth-address": {
      title: "Ethereum address",
      description: "Validate addresses and apply EIP-55 checksum locally",
      metaDescription:
        "Validate Ethereum addresses and apply EIP-55 checksum in your browser. Nothing is sent to a server.",
    },
    "function-selector": {
      title: "Function selector",
      description: "Compute the 4-byte selector from a function signature",
      metaDescription:
        "Compute the Solidity 4-byte function selector from a canonical signature. Runs locally in your browser.",
    },
    keccak256: {
      title: "Keccak-256",
      description: "Hash UTF-8 text or hex bytes with Keccak-256",
      metaDescription: "Compute Keccak-256 over UTF-8 text or hex bytes in your browser.",
    },
    "hex-bytes": {
      title: "Hex ↔ UTF-8",
      description: "Convert hex strings to UTF-8 text and back",
      metaDescription:
        "Convert between hexadecimal byte strings and UTF-8 text locally in your browser.",
    },
    "abi-codec": {
      title: "ABI encode / decode",
      description: "Encode and decode ABI values with a local AbiCoder",
      metaDescription:
        "Encode and decode ABI tuples with ethers AbiCoder. Calldata runs only in your browser.",
    },
  },
};
