import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ethereum address | Tools Library",
  description:
    "Validate Ethereum addresses and apply EIP-55 checksum in your browser. Nothing is sent to a server.",
};

export default function EthAddressLayout({ children }: { children: ReactNode }) {
  return children;
}
