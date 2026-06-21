import { getBackendUrl } from "./backend-url";

export type AnalyticsComputeResult = {
  ok: boolean;
  chart_type?: "line" | "bar";
  compute: {
    module: string;
    input_points: number;
    moving_average: number;
    growth_rate_pct: number;
    revenue_prediction_next_quarter: number;
    forecast_series: number[];
    chart_series: number[];
    bar_series: number[];
  };
};

export type DevopsVerifyResult = {
  ok: boolean;
  status: string;
  message: string;
  pipeline_id?: string;
  latency_ms?: number;
};

export type MedicalDiagnosticResult = {
  ok: boolean;
  scan_mode: string;
  analyzed_indicators: string[];
  predicted_ailment: string;
  severity: "low" | "moderate" | "high";
  recommended_solutions: string[];
  recommended_medicines: string[];
  disclaimer: string;
};

export type TranslatorBridgeResult = {
  ok: boolean;
  mode: "manual" | "auto";
  source_lang: string;
  target_lang: string;
  buffer_received: boolean;
  ready_for_chunks: boolean;
  mapping: string;
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBackendUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(err || `Pipeline request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function computeAnalytics(
  data: number[],
  chartType: "line" | "bar" = "line",
): Promise<AnalyticsComputeResult> {
  return postJson("/api/agents/analytics/compute", { data, chart_type: chartType });
}

export function verifyDevopsDatabase(payload: {
  uri: string;
  username: string;
  password: string;
  port: string;
}): Promise<DevopsVerifyResult> {
  return postJson("/api/agents/devops/verify-database", payload);
}

export function runMedicalDiagnostic(payload: {
  symptom_text: string;
  file_names: string[];
  scan_mode: "report" | "xray" | "facial";
}): Promise<MedicalDiagnosticResult> {
  return postJson("/api/agents/medical/diagnose", payload);
}

export function postTranslatorBridge(payload: {
  mode: "manual" | "auto";
  source_lang: string;
  target_lang: string;
  audio_chunk_b64?: string;
}): Promise<TranslatorBridgeResult> {
  return postJson("/api/agents/translator/bridge", payload);
}

/** Pull numeric series from user text for analytics route. */
export function extractNumericSeries(text: string): number[] {
  const matches = text.match(/-?\d+(?:\.\d+)?/g);
  if (!matches) return [];
  return matches.map(Number).filter((n) => Number.isFinite(n)).slice(0, 60);
}
