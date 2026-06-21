/** Karachi wholesale meat analytics — drives Business Analytics live deck. */

export type KarachiMetricId =
  | "total_sales"
  | "area_breakdown"
  | "wastage"
  | "mutton"
  | "cow";

export type KarachiAreaRow = {
  id: string;
  name: string;
  sharePct: number;
  salesLakhs: number;
};

export const KARACHI_AREAS: KarachiAreaRow[] = [
  { id: "dha2", name: "DHA Phase 2", sharePct: 21, salesLakhs: 39.3 },
  { id: "clifton", name: "Clifton", sharePct: 19, salesLakhs: 35.6 },
  { id: "gulshan", name: "Gulshan", sharePct: 18, salesLakhs: 33.7 },
  { id: "saddar", name: "Saddar", sharePct: 17, salesLakhs: 31.8 },
  { id: "korangi", name: "Korangi Industrial", sharePct: 15, salesLakhs: 28.1 },
  { id: "lyari", name: "Lyari Wharf", sharePct: 10, salesLakhs: 18.7 },
];

export const KARACHI_DEFAULTS = {
  totalSalesLakhs: 187.2,
  muttonSharePct: 62,
  cowSharePct: 38,
  wastagePct: 4.8,
  growthPct: 10.8,
  rowCounter: 0,
};

export const METRIC_NODES: { id: KarachiMetricId; label: string }[] = [
  { id: "total_sales", label: "Total Sales" },
  { id: "area_breakdown", label: "Area Breakdown" },
  { id: "wastage", label: "Wastage Tracker" },
  { id: "mutton", label: "Mutton Share" },
  { id: "cow", label: "Cow Share" },
];

/** Recompute aggregate metrics when user selects area or category. */
export function computeKarachiMetrics(
  areas: KarachiAreaRow[],
  selectedAreaId: string,
  selectedMetric: KarachiMetricId,
): {
  totalSalesLakhs: number;
  muttonSharePct: number;
  cowSharePct: number;
  wastagePct: number;
  growthPct: number;
  areas: KarachiAreaRow[];
} {
  const selected = areas.find((a) => a.id === selectedAreaId) ?? areas[0];
  const totalSalesLakhs =
    Math.round(areas.reduce((s, a) => s + a.salesLakhs, 0) * 10) / 10;
  const boost = selected ? selected.sharePct / 100 : 0;
  const muttonSharePct = Math.min(
    72,
    Math.max(48, KARACHI_DEFAULTS.muttonSharePct + boost * 8 - (selectedMetric === "cow" ? 6 : 0)),
  );
  const cowSharePct = Math.round((100 - muttonSharePct) * 10) / 10;
  const wastagePct =
    Math.round(
      (KARACHI_DEFAULTS.wastagePct + (selectedMetric === "wastage" ? 1.2 : 0) - boost * 0.4) * 10,
    ) / 10;
  const growthPct =
    Math.round((KARACHI_DEFAULTS.growthPct + boost * 4 + areas.length * 0.2) * 10) / 10;

  const nextAreas = areas.map((a) => {
    if (a.id !== selectedAreaId) return a;
    return {
      ...a,
      salesLakhs: Math.round(a.salesLakhs * (1 + boost * 0.06) * 10) / 10,
      sharePct: Math.min(28, Math.round(a.sharePct * (1 + boost * 0.04))),
    };
  });

  return {
    totalSalesLakhs,
    muttonSharePct,
    cowSharePct,
    wastagePct,
    growthPct,
    areas: nextAreas,
  };
}
