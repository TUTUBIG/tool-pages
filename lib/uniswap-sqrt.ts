/** Uniswap V3 pool price: sqrtPriceX96 = sqrt(token1/token0) · 2^96 (raw amounts). */

const Q192 = 1n << 192n;

/** uint160 max (all bits set). */
export const MAX_U160 = (1n << 160n) - 1n;

/** TickMath MIN_SQRT_RATIO / MAX_SQRT_RATIO (Uniswap V3). */
export const MIN_SQRT_RATIO_V3 = 4295128739n;
export const MAX_SQRT_RATIO_V3 = 1461446703485210103287273052203988822378723970342n;

export function isqrt(n: bigint): bigint {
  if (n < 0n) {
    throw new Error("Square root of negative bigint.");
  }
  if (n < 2n) {
    return n;
  }
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (n / x + x) / 2n;
  }
  return x;
}

/** Parse a non-negative decimal string into num/den with den = 10^fractionDigits. */
export function parsePositiveDecimal(s: string): { num: bigint; den: bigint } {
  const t = s.trim().replace(/^\+/, "");
  if (t.length === 0) {
    throw new Error("Empty number.");
  }
  if (!/^\d*\.?\d*$/.test(t)) {
    throw new Error("Invalid decimal characters.");
  }
  const [intPart = "0", frac = ""] = t.split(".");
  const combined = (intPart.replace(/^0+(?=\d)/, "") || "0") + frac;
  const den = 10n ** BigInt(frac.length);
  const num = BigInt(combined || "0");
  return { num, den };
}

function pow10(n: number): bigint {
  if (n < 0 || n > 1000 || !Number.isInteger(n)) {
    throw new Error("Exponent out of range.");
  }
  return 10n ** BigInt(n);
}

/**
 * token1 per token0 (human units): raw_ratio * 10^(dec0 - dec1), raw_ratio = token1/token0 in wei.
 */
export function sqrtPriceX96ToPriceParts(
  sqrtPriceX96: bigint,
  dec0: number,
  dec1: number,
): { rawRatioNum: bigint; rawRatioDen: bigint; humanNum: bigint; humanDen: bigint } {
  if (sqrtPriceX96 <= 0n || sqrtPriceX96 >= 1n << 160n) {
    throw new Error("sqrtPriceX96 must be a positive uint160 value.");
  }
  if (dec0 < 0 || dec0 > 255 || dec1 < 0 || dec1 > 255) {
    throw new Error("Decimals must be between 0 and 255.");
  }
  const sq = sqrtPriceX96 * sqrtPriceX96;
  const rawRatioNum = sq;
  const rawRatioDen = Q192;

  const d = dec0 - dec1;
  let humanNum: bigint;
  let humanDen: bigint;
  if (d >= 0) {
    humanNum = rawRatioNum * pow10(d);
    humanDen = rawRatioDen;
  } else {
    humanNum = rawRatioNum;
    humanDen = rawRatioDen * pow10(-d);
  }
  return { rawRatioNum, rawRatioDen, humanNum, humanDen };
}

/**
 * Human price (token1 per token0) decimal string, up to `maxDecimals` fractional digits.
 */
export function formatRational(humanNum: bigint, humanDen: bigint, maxDecimals: number): string {
  if (humanDen === 0n) {
    throw new Error("Division by zero.");
  }
  const intPart = humanNum / humanDen;
  let rem = humanNum % humanDen;
  if (rem === 0n) {
    return intPart.toString();
  }
  let frac = "";
  for (let i = 0; i < maxDecimals; i++) {
    rem *= 10n;
    const q = rem / humanDen;
    rem %= humanDen;
    frac += q.toString();
    if (rem === 0n) {
      break;
    }
  }
  frac = frac.replace(/0+$/, "");
  if (frac.length === 0) {
    return intPart.toString();
  }
  return `${intPart}.${frac}`;
}

export function priceToSqrtPriceX96(
  humanPriceStr: string,
  dec0: number,
  dec1: number,
): bigint {
  const { num: pNum, den: pDen } = parsePositiveDecimal(humanPriceStr);
  if (pNum === 0n) {
    throw new Error("Price must be positive.");
  }
  if (dec0 < 0 || dec0 > 255 || dec1 < 0 || dec1 > 255) {
    throw new Error("Decimals must be between 0 and 255.");
  }

  const d = dec1 - dec0;
  let rNum: bigint;
  let rDen: bigint;
  if (d >= 0) {
    rNum = pNum * pow10(d);
    rDen = pDen;
  } else {
    rNum = pNum;
    rDen = pDen * pow10(-d);
  }

  const inner = (rNum * Q192) / rDen;
  return isqrt(inner);
}

export function formatSqrtPriceX96(sqrtPriceX96: bigint): string {
  return sqrtPriceX96.toString();
}
