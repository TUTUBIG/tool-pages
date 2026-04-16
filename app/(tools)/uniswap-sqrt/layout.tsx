import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Uniswap sqrtPriceX96 | Tools Library",
  description:
    "Decode and encode Uniswap V3 sqrtPriceX96 (Q64.96) to human price with token decimals. Runs locally in your browser.",
};

export default function UniswapSqrtLayout({ children }: { children: ReactNode }) {
  return children;
}
