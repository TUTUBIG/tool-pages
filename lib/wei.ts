import { parsePositiveDecimal } from "@/lib/uniswap-sqrt";

function pow10(n: number): bigint {
  if (n < 0 || n > 255 || !Number.isInteger(n)) {
    throw new Error("Decimals must be an integer from 0 to 255.");
  }
  return 10n ** BigInt(n);
}

/** Integer digit groups with commas (no fractional part). */
export function formatIntWithCommas(intStr: string): string {
  const sign = intStr.startsWith("-") ? "-" : "";
  const digits = sign ? intStr.slice(1) : intStr;
  if (digits.length <= 3) {
    return intStr;
  }
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Convert base units (wei) to a human decimal string.
 * `decimals` is ERC-20 style (e.g. 18 for ETH).
 */
export function weiToHuman(weiStr: string, decimals: number, commaGroups: boolean): string {
  const t = weiStr.trim().replace(/\s+/g, "");
  if (t.length === 0) {
    throw new Error("Enter a wei amount.");
  }
  if (!/^\d+$/.test(t)) {
    throw new Error("Wei must be a non-negative integer (digits only).");
  }
  const wei = BigInt(t);
  const base = pow10(decimals);
  const intPart = wei / base;
  const frac = wei % base;
  const intStr = intPart.toString();
  const intDisplay = commaGroups ? formatIntWithCommas(intStr) : intStr;
  if (frac === 0n) {
    return intDisplay;
  }
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${intDisplay}.${fracStr}`;
}

/** Human decimal string → base units (floor toward zero). */
export function humanToWei(human: string, decimals: number): bigint {
  const { num, den } = parsePositiveDecimal(human);
  const scale = pow10(decimals);
  return (num * scale) / den;
}
