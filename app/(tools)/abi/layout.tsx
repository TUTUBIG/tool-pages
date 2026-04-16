import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ABI encode / decode | Tools Library",
  description:
    "Encode and decode ABI tuples with ethers AbiCoder. Calldata runs only in your browser.",
};

export default function AbiLayout({ children }: { children: ReactNode }) {
  return children;
}
