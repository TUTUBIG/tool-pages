import { XMLBuilder, XMLParser } from "fast-xml-parser";
import Papa from "papaparse";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export type DataFormat = "json" | "yaml" | "xml" | "csv" | "tsv";

const XML_PARSE = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  parseTagValue: true,
  textNodeName: "#text",
});

const XML_BUILD = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: false,
});

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Prefer array-of-objects; unwrap `{ key: [ rows ] }` when there is a single array property. */
function extractTabular(value: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.every((v) => isPlainObject(v))) return value;
    return null;
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 1) {
      const [, v] = entries[0];
      if (Array.isArray(v) && v.length > 0 && v.every((x) => isPlainObject(x))) {
        return v as Record<string, unknown>[];
      }
      if (Array.isArray(v) && v.length === 0) return [];
    }
    return [value];
  }
  return null;
}

function wrapValueForXml(value: unknown): Record<string, unknown> {
  const tab = extractTabular(value);
  if (tab !== null) {
    return { root: { row: tab } };
  }
  if (value === null || value === undefined) {
    return { root: {} };
  }
  if (typeof value !== "object") {
    return { root: { value } };
  }
  return value as Record<string, unknown>;
}

function rowsToDelimited(rows: Record<string, unknown>[], delimiter: string): string {
  const flat = rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === null || v === undefined) out[k] = "";
      else if (typeof v === "object") out[k] = JSON.stringify(v);
      else out[k] = String(v);
    }
    return out;
  });
  return Papa.unparse(flat, { delimiter });
}

type ParseResult = { ok: true; value: unknown } | { ok: false; error: string };

function parseFormat(input: string, from: DataFormat): ParseResult {
  const text = input.trim();
  if (text.length === 0) {
    return { ok: false, error: "Input is empty." };
  }

  try {
    switch (from) {
      case "json": {
        return { ok: true, value: JSON.parse(text) as unknown };
      }
      case "yaml": {
        return { ok: true, value: parseYaml(text) as unknown };
      }
      case "xml": {
        return { ok: true, value: XML_PARSE.parse(text) as unknown };
      }
      case "csv":
      case "tsv": {
        const delimiter = from === "tsv" ? "\t" : ",";
        const parsed = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: "greedy",
          delimiter,
          dynamicTyping: true,
        });
        if (parsed.errors.length > 0) {
          return { ok: false, error: parsed.errors[0].message || "Could not parse CSV/TSV." };
        }
        return { ok: true, value: parsed.data };
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid input.";
    return { ok: false, error: msg };
  }
}

type StringifyResult = { ok: true; output: string } | { ok: false; error: string };

function stringifyFormat(value: unknown, to: DataFormat): StringifyResult {
  try {
    switch (to) {
      case "json": {
        return { ok: true, output: JSON.stringify(value, null, 2) + "\n" };
      }
      case "yaml": {
        return { ok: true, output: stringifyYaml(value) };
      }
      case "xml": {
        const wrapped = wrapValueForXml(value);
        const xml = XML_BUILD.build(wrapped) as string;
        const out = typeof xml === "string" ? xml : String(xml);
        return { ok: true, output: out.endsWith("\n") ? out : `${out}\n` };
      }
      case "csv":
      case "tsv": {
        const rows = extractTabular(value);
        if (rows === null) {
          return {
            ok: false,
            error:
              "CSV/TSV need tabular data: an array of objects, a single object, or one object whose single property is an array of objects.",
          };
        }
        const delimiter = to === "tsv" ? "\t" : ",";
        return { ok: true, output: rowsToDelimited(rows, delimiter) + "\n" };
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not serialize.";
    return { ok: false, error: msg };
  }
}

export function convertFormat(
  input: string,
  from: DataFormat,
  to: DataFormat,
): StringifyResult {
  const parsed = parseFormat(input, from);
  if (!parsed.ok) return parsed;
  return stringifyFormat(parsed.value, to);
}

export const FORMAT_LABELS: Record<DataFormat, string> = {
  json: "JSON",
  yaml: "YAML",
  xml: "XML",
  csv: "CSV",
  tsv: "TSV",
};

export const FORMAT_ORDER: DataFormat[] = ["json", "yaml", "xml", "csv", "tsv"];
