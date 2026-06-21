"use client";

import { useEffect, useRef } from "react";
import { runAnalyticsPipeline } from "../lib/agent-pipeline-store";

const DEFAULT_SERIES = [22, 38, 31, 55, 48, 62, 58, 71, 65, 78];

/**
 * Background analytics hook — runs Python-compute pipeline when `data` changes.
 */
export function useBusinessAnalyticsPipeline(
  active: boolean,
  data: number[] = DEFAULT_SERIES,
) {
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (!active) return;
    const key = data.join(",");
    if (key === lastKey.current) return;
    lastKey.current = key;
    void runAnalyticsPipeline(data.length ? data : DEFAULT_SERIES);
  }, [active, data]);
}
