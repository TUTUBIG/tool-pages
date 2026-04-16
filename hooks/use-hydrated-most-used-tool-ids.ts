"use client";

import { useEffect, useState } from "react";
import { MOST_USED_TOOL_IDS } from "@/lib/tools";
import { TOOLS_USAGE_CHANGED_EVENT, getMostUsedToolIdsFromStorage, hasToolUsageRecords } from "@/lib/tool-usage";

export type HydratedMostUsedToolIds = {
  ids: string[];
  /** After first client read of `localStorage` (and on later updates). */
  usageHydrated: boolean;
  hasUsageRecords: boolean;
};

/**
 * `ids` is empty on the server and first client paint, then filled from
 * `localStorage` after mount so SSR HTML matches hydration.
 */
export function useHydratedMostUsedToolIds(
  limit = MOST_USED_TOOL_IDS.length,
): HydratedMostUsedToolIds {
  const [state, setState] = useState<HydratedMostUsedToolIds>(() => ({
    ids: [],
    usageHydrated: false,
    hasUsageRecords: false,
  }));

  useEffect(() => {
    const sync = () =>
      setState({
        ids: getMostUsedToolIdsFromStorage(limit),
        usageHydrated: true,
        hasUsageRecords: hasToolUsageRecords(),
      });
    sync();
    window.addEventListener(TOOLS_USAGE_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TOOLS_USAGE_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [limit]);

  return state;
}
