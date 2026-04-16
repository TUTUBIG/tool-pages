import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Image Compressor | Tools Library",
  description: "Re-encode images in the browser with adjustable JPEG or WebP quality.",
};

export default function ImageCompressLayout({ children }: { children: ReactNode }) {
  return children;
}
