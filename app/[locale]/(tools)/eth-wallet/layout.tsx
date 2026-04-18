import type { ReactNode } from "react";
import { createToolMetadata } from "@/lib/tool-metadata";

export const generateMetadata = createToolMetadata("eth-wallet");

export default function EthWalletLayout({ children }: { children: ReactNode }) {
  return children;
}
