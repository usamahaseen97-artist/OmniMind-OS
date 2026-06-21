"use client";

import { useSyncExternalStore } from "react";
import type {
  AnalyticsComputeResult,
  DevopsVerifyResult,
  MedicalDiagnosticResult,
} from "./agent-pipeline-api";

export type AnalyticsPipelineState = {
  loading: boolean;
  error: string | null;
  result: AnalyticsComputeResult | null;
  chartType: "line" | "bar";
};

export type DevopsPipelineState = {
  verifying: boolean;
  githubLinked: boolean;
  handshake: DevopsVerifyResult | null;
  logLines: string[];
};

export type MedicalPipelineState = {
  loading: boolean;
  error: string | null;
  result: MedicalDiagnosticResult | null;
  scanMode: "report" | "xray" | "facial";
};

type Snapshot = {
  analytics: AnalyticsPipelineState;
  devops: DevopsPipelineState;
  medical: MedicalPipelineState;
};

const defaultAnalytics: AnalyticsPipelineState = {
  loading: false,
  error: null,
  result: null,
  chartType: "line",
};

const defaultDevops: DevopsPipelineState = {
  verifying: false,
  githubLinked: false,
  handshake: null,
  logLines: [],
};

const defaultMedical: MedicalPipelineState = {
  loading: false,
  error: null,
  result: null,
  scanMode: "report",
};

let snapshot: Snapshot = {
  analytics: { ...defaultAnalytics },
  devops: { ...defaultDevops },
  medical: { ...defaultMedical },
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function patch<K extends keyof Snapshot>(key: K, partial: Partial<Snapshot[K]>) {
  snapshot = {
    ...snapshot,
    [key]: { ...snapshot[key], ...partial },
  };
  emit();
}

export function getAgentPipelineSnapshot(): Snapshot {
  return snapshot;
}

export function subscribeAgentPipeline(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAnalyticsChartType(chartType: "line" | "bar") {
  patch("analytics", { chartType });
}

export function setDevopsGithubLinked(githubLinked: boolean) {
  patch("devops", { githubLinked });
}

export function appendDevopsLog(line: string) {
  patch("devops", { logLines: [...snapshot.devops.logLines, line].slice(-12) });
}

export function setMedicalScanMode(scanMode: "report" | "xray" | "facial") {
  patch("medical", { scanMode });
}

export function useAgentPipeline<K extends keyof Snapshot>(key: K): Snapshot[K] {
  return useSyncExternalStore(
    subscribeAgentPipeline,
    () => snapshot[key],
    () => snapshot[key],
  );
}

export async function runAnalyticsPipeline(
  data: number[],
  chartType: "line" | "bar" = "line",
) {
  const { computeAnalytics } = await import("./agent-pipeline-api");
  patch("analytics", { loading: true, error: null, chartType });
  try {
    const result = await computeAnalytics(data, chartType);
    patch("analytics", { loading: false, result });
  } catch (e) {
    patch("analytics", {
      loading: false,
      error: e instanceof Error ? e.message : "Analytics compute failed",
    });
  }
}

export async function runDevopsVerify(payload: {
  uri: string;
  username: string;
  password: string;
  port: string;
}) {
  const { verifyDevopsDatabase } = await import("./agent-pipeline-api");
  patch("devops", { verifying: true, handshake: null });
  appendDevopsLog("Verifying Database Connection…");
  try {
    const handshake = await verifyDevopsDatabase(payload);
    patch("devops", { verifying: false, handshake });
    appendDevopsLog(handshake.message);
    if (handshake.ok) {
      appendDevopsLog(`✓ Handshake ${handshake.pipeline_id} · ${handshake.latency_ms}ms`);
    }
  } catch (e) {
    patch("devops", { verifying: false });
    appendDevopsLog(e instanceof Error ? e.message : "Verification failed");
  }
}

export async function runMedicalPipeline(payload: {
  symptom_text: string;
  file_names: string[];
  scan_mode?: "report" | "xray" | "facial";
}) {
  const { runMedicalDiagnostic } = await import("./agent-pipeline-api");
  const scanMode = payload.scan_mode ?? snapshot.medical.scanMode;
  patch("medical", { loading: true, error: null, scanMode });
  try {
    const result = await runMedicalDiagnostic({
      symptom_text: payload.symptom_text,
      file_names: payload.file_names,
      scan_mode: scanMode,
    });
    patch("medical", { loading: false, result });
  } catch (e) {
    patch("medical", {
      loading: false,
      error: e instanceof Error ? e.message : "Diagnostic failed",
    });
  }
}
