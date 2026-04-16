import { MOST_USED_TOOL_IDS, TOOLS } from "./tools";

const STORAGE_KEY = "tools-library-usage-v1";

/** Same-tab updates (localStorage does not fire `storage` in the active tab). */
export const TOOLS_USAGE_CHANGED_EVENT = "tools-usage-changed";

const knownIds = new Set(TOOLS.map((t) => t.id));

function isKnownToolId(id: string): boolean {
  return knownIds.has(id);
}

/** Whether any tool visit counts exist in `localStorage` for this origin. */
export function hasToolUsageRecords(): boolean {
  return Object.keys(readUsageCounts()).length > 0;
}

export function readUsageCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!isKnownToolId(k)) continue;
      if (typeof v === "number" && Number.isFinite(v) && v > 0) {
        out[k] = Math.floor(v);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function incrementToolUse(toolId: string): void {
  if (typeof window === "undefined") return;
  if (!isKnownToolId(toolId)) return;
  const counts = readUsageCounts();
  counts[toolId] = (counts[toolId] ?? 0) + 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(TOOLS_USAGE_CHANGED_EVENT));
}

/**
 * Tool ids sorted by local visit count (highest first). Empty when there is no
 * stored usage yet (no curated fallback).
 */
export function getMostUsedToolIdsFromStorage(limit = MOST_USED_TOOL_IDS.length): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const counts = readUsageCounts();
  const ranked = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
  return ranked.slice(0, limit);
}
