import type { DataSourceKind, DatasetSnapshot } from "./types";
import { ingestTextContent } from "./ingestion-engine";

type AnalyticsMetricRow = {
  metric?: string;
  value?: number;
  delta_pct?: number;
};

/** Map live `/api/v1/analytics/process` response to a dataset snapshot. */
export function datasetFromAnalyticsApi(
  metricArrays: AnalyticsMetricRow[],
  name: string,
  sourceKind: DataSourceKind,
): DatasetSnapshot {
  const headers = ["metric", "value", "delta_pct"];
  const lines = [
    headers.join(","),
    ...metricArrays.map((r) =>
      [r.metric ?? "metric", r.value ?? 0, r.delta_pct ?? 0].join(","),
    ),
  ];
  const snapshot = ingestTextContent(lines.join("\n"), sourceKind, name);
  return { ...snapshot, name, sourceKind };
}

export async function connectAnalyticsSource(
  kind: DataSourceKind,
  connectionString: string,
): Promise<DatasetSnapshot> {
  const res = await fetch("/api/v1/analytics/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "omnimind-user",
      query: `Connect ${kind} data source: ${connectionString}`,
      dataset_name: kind,
    }),
  });
  if (!res.ok) {
    throw new Error(`Analytics API failed (${res.status})`);
  }
  const data = (await res.json()) as { ok?: boolean; metric_arrays?: AnalyticsMetricRow[] };
  if (!data.ok || !Array.isArray(data.metric_arrays) || !data.metric_arrays.length) {
    throw new Error("Analytics API returned no metrics");
  }
  const label = `${kind}://${connectionString.slice(0, 48)}`;
  return datasetFromAnalyticsApi(data.metric_arrays, label, kind);
}
