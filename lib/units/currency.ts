/** Frankfurter v2 public API — browser-friendly CORS, no API key. @see https://www.frankfurter.app/docs/ */
const FRANKFURTER_API = "https://api.frankfurter.dev" as const;

export type CurrencyList = Record<string, string>;

type V2CurrencyRow = {
  iso_code: string;
  name: string;
};

type V2RateResponse = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

type V2ErrorBody = {
  message?: string;
};

async function readJsonError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as V2ErrorBody;
    if (body.message) return body.message;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status}).`;
}

export async function fetchCurrencyNames(): Promise<CurrencyList> {
  const res = await fetch(`${FRANKFURTER_API}/v2/currencies`);
  if (!res.ok) {
    throw new Error(await readJsonError(res));
  }
  const rows = (await res.json()) as V2CurrencyRow[];
  if (!Array.isArray(rows)) {
    throw new Error("Unexpected currencies response.");
  }
  const out: CurrencyList = {};
  for (const row of rows) {
    if (row.iso_code && row.name) {
      out[row.iso_code] = row.name;
    }
  }
  return out;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<{ value: number; date: string }> {
  if (from === to) {
    return { value: amount, date: new Date().toISOString().slice(0, 10) };
  }
  const path = `${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
  const res = await fetch(`${FRANKFURTER_API}/v2/rate/${path}`);
  if (!res.ok) {
    throw new Error(await readJsonError(res));
  }
  const data = (await res.json()) as V2RateResponse;
  if (typeof data.rate !== "number" || !Number.isFinite(data.rate)) {
    throw new Error("Could not read exchange rate.");
  }
  return { value: amount * data.rate, date: data.date };
}
