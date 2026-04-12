/** Multiplicative units: `value * toBase[unit]` yields SI base (kg, m, L). */

export const WEIGHT_TO_KG: Record<string, number> = {
  kg: 1,
  g: 0.001,
  mg: 1e-6,
  lb: 0.45359237,
  oz: 0.028349523125,
  st: 6.35029318, // 14 lb
};

export const LENGTH_TO_M: Record<string, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

/** Liter as base */
export const VOLUME_TO_L: Record<string, number> = {
  l: 1,
  ml: 0.001,
  "m3": 1000,
  us_gal: 3.785411784,
  uk_gal: 4.54609,
  us_fl_oz: 0.0295735295625,
  us_cup: 0.2365882365,
};

export type TempUnit = "c" | "f" | "k";

export function convertTemperature(value: number, from: TempUnit, to: TempUnit): number {
  const k =
    from === "k"
      ? value
      : from === "c"
        ? value + 273.15
        : ((value - 32) * 5) / 9 + 273.15;
  if (to === "k") return k;
  if (to === "c") return k - 273.15;
  return ((k - 273.15) * 9) / 5 + 32;
}

export function convertMultiplicative(
  value: number,
  from: string,
  to: string,
  table: Record<string, number>,
): number {
  const a = table[from];
  const b = table[to];
  if (a === undefined || b === undefined) {
    throw new Error("Unknown unit.");
  }
  return (value * a) / b;
}
