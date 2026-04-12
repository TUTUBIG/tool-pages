export type UnitCategory = "currency" | "temperature" | "weight" | "length" | "volume";

export const CATEGORY_LABELS: Record<UnitCategory, string> = {
  currency: "Currency",
  temperature: "Temperature",
  weight: "Weight",
  length: "Length",
  volume: "Volume",
};

export const CATEGORY_ORDER: UnitCategory[] = [
  "currency",
  "temperature",
  "weight",
  "length",
  "volume",
];

const WEIGHT_LABELS: Record<string, string> = {
  kg: "Kilogram (kg)",
  g: "Gram (g)",
  mg: "Milligram (mg)",
  lb: "Pound (lb)",
  oz: "Ounce (oz)",
  st: "Stone (st)",
};

const LENGTH_LABELS: Record<string, string> = {
  m: "Meter (m)",
  cm: "Centimeter (cm)",
  mm: "Millimeter (mm)",
  km: "Kilometer (km)",
  in: "Inch (in)",
  ft: "Foot (ft)",
  yd: "Yard (yd)",
  mi: "Mile (mi)",
};

const VOLUME_LABELS: Record<string, string> = {
  l: "Liter (L)",
  ml: "Milliliter (mL)",
  m3: "Cubic meter (m³)",
  us_gal: "US gallon",
  uk_gal: "UK gallon",
  us_fl_oz: "US fluid ounce",
  us_cup: "US cup",
};

export const TEMP_LABELS: Record<"c" | "f" | "k", string> = {
  c: "Celsius (°C)",
  f: "Fahrenheit (°F)",
  k: "Kelvin (K)",
};

export function labelWeight(id: string): string {
  return WEIGHT_LABELS[id] ?? id;
}

export function labelLength(id: string): string {
  return LENGTH_LABELS[id] ?? id;
}

export function labelVolume(id: string): string {
  return VOLUME_LABELS[id] ?? id;
}
