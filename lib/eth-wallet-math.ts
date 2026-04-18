/** Probability that one random address matches fixed hex prefix + suffix (non-overlapping regions). */
export function singleAttemptMatchProbability(hexDigitCount: number): number {
  return Math.pow(16, -hexDigitCount);
}

/** Expected attempts until first match (geometric distribution, mean = 1/p). */
export function expectedAttempts(hexDigitCount: number): number {
  return Math.pow(16, hexDigitCount);
}

export function formatProbability(hexDigitCount: number): string {
  const p = singleAttemptMatchProbability(hexDigitCount);
  const log10p = Math.log10(p);
  if (!Number.isFinite(log10p)) return "≈ 0";
  return `≈ ${p.toExponential(4)} (log₁₀ p ≈ ${log10p.toFixed(2)})`;
}

export function formatAttempts(hexDigitCount: number): string {
  const n = expectedAttempts(hexDigitCount);
  if (!Number.isFinite(n)) return "≫ 10³⁰⁰";
  if (n >= 1e15) return `≈ ${n.toExponential(4)}`;
  if (n >= 1e9) return `≈ ${(n / 1e9).toFixed(3)} × 10⁹`;
  if (n >= 1e6) return `≈ ${(n / 1e6).toFixed(3)} × 10⁶`;
  return `≈ ${Math.round(n).toLocaleString()}`;
}

/** Expected wall time from attempt count and assumed attempts per second. */
export function formatExpectedDuration(hexDigitCount: number, attemptsPerSecond: number): string {
  if (!(attemptsPerSecond > 0)) return "—";
  const meanAttempts = expectedAttempts(hexDigitCount);
  const seconds = meanAttempts / attemptsPerSecond;
  return formatSecondsEn(seconds);
}

/** English duration labels for shared math helpers (UI may override per locale). */
export function formatSecondsEn(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 90) return `≈ ${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `≈ ${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `≈ ${(seconds / 3600).toFixed(2)} h`;
  if (seconds < 86400 * 365) return `≈ ${(seconds / 86400).toFixed(2)} days`;
  return `≈ ${(seconds / (86400 * 365)).toFixed(2)} years`;
}
