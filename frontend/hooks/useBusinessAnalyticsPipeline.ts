"use client";

import { useEffect, useRef } from "react";
import { runAnalyticsPipeline } from "../lib/agent-pipeline-store";

const DEFAULT_SERIES = [22, 38, 31, 55, 48, 62, 58, 71, 65, 78];

/**
 * Background analytics hook — runs Python-compute pipeline when `data` changes.
 * Listens for enterprise analytics dataset events from Phase 5 BI layer.
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

  useEffect(() => {
    if (!active) return;
    const onDataset = (e: Event) => {
      const ds = (e as CustomEvent<{ dataset?: { rows?: Record<string, unknown>[]; headers?: string[] } }>).detail?.dataset;
      if (!ds?.headers?.length) return;
      const col = ds.headers.find((h) => /revenue|sales|value/i.test(h)) ?? ds.headers[1];
      if (!col) return;
      const series = ds.rows?.map((r) => Number(r[col]) || 0).filter((n) => n > 0) ?? [];
      if (series.length) void runAnalyticsPipeline(series);
    };
    window.addEventListener("omnimind:enterprise-analytics-dataset", onDataset);
    return () => window.removeEventListener("omnimind:enterprise-analytics-dataset", onDataset);
  }, [active]);
}
