import type { AnalyteTrend, LabReport, TrendDirection, TrendDataPoint } from "../types";

function computeDirection(points: TrendDataPoint[]): TrendDirection {
  const numeric = points.filter((p) => !isNaN(p.value));
  if (numeric.length < 2) return "insufficient-data";
  const first = numeric[0]!.value;
  const last = numeric[numeric.length - 1]!.value;
  const pct = ((last - first) / (Math.abs(first) || 1)) * 100;
  if (Math.abs(pct) < 5) return "stable";
  return pct > 0 ? "declining" : "improving";
}

/** Longitudinal lab trend analysis */
export class TrendAnalysisEngine {
  private history = new Map<string, Map<string, TrendDataPoint[]>>();

  ingestReport(report: LabReport) {
    let patientMap = this.history.get(report.patientId);
    if (!patientMap) {
      patientMap = new Map();
      this.history.set(report.patientId, patientMap);
    }
    for (const v of report.values) {
      const num = typeof v.value === "number" ? v.value : parseFloat(String(v.value));
      if (isNaN(num)) continue;
      const key = v.analyte.toLowerCase();
      const points = patientMap.get(key) ?? [];
      points.push({ timestamp: report.collectedAt, value: num, reportId: report.id, flag: v.flag });
      points.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      patientMap.set(key, points);
    }
  }

  getTrends(patientId: string, analyte?: string): AnalyteTrend[] {
    const patientMap = this.history.get(patientId);
    if (!patientMap) return [];

    const entries = analyte
      ? [[analyte.toLowerCase(), patientMap.get(analyte.toLowerCase()) ?? []] as const]
      : [...patientMap.entries()];

    return entries.map(([key, dataPoints]) => {
      const baseline = dataPoints[0]?.value;
      const latest = dataPoints[dataPoints.length - 1]?.value;
      const percentChange = baseline !== undefined && latest !== undefined
        ? ((latest - baseline) / (Math.abs(baseline) || 1)) * 100
        : undefined;
      return {
        analyte: key,
        direction: computeDirection(dataPoints),
        dataPoints,
        baselineValue: baseline,
        latestValue: latest,
        percentChange,
      };
    });
  }

  compareToBaseline(patientId: string, analyte: string, currentValue: number) {
    const trends = this.getTrends(patientId, analyte);
    const trend = trends[0];
    if (!trend?.baselineValue) return { delta: null, direction: "insufficient-data" as TrendDirection };
    const delta = currentValue - trend.baselineValue;
    return { delta, direction: trend.direction, baseline: trend.baselineValue };
  }
}

let engine: TrendAnalysisEngine | null = null;

export function getTrendAnalysisEngine() {
  if (!engine) engine = new TrendAnalysisEngine();
  return engine;
}
