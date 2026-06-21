"use client";

import { useSyncExternalStore } from "react";
import type { ExecutionPreviewState, GeneratedFileAsset } from "./execution-preview";
import type { LiveRenderSession } from "./live-render-pipeline";
import { setArchitectureRenderPct } from "./deck-ui-store";
import { emitDevTerminalLine } from "./dev-terminal-telemetry";

export type WorkbenchMetric = {
  label: string;
  value: string;
  ok: boolean;
};

export type WorkbenchScene = {
  id: string;
  label: string;
  progress: number;
  thumbnail?: string;
};

export type WorkbenchMarketingSlot = {
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
};

export type WorkbenchLiveSnapshot = {
  routeId: string;
  toolSlug: string;
  active: boolean;
  streaming: boolean;
  statusText: string | null;
  lastPrompt: string;
  preview: ExecutionPreviewState | null;
  renderSession: LiveRenderSession | null;
  videoProgress: number;
  videoPhase: string | null;
  terminalLog: string[];
  streamText: string;
  chartSeries: number[];
  chartLabels: string[];
  metrics: WorkbenchMetric[];
  scenes: WorkbenchScene[];
  marketingSlots: WorkbenchMarketingSlot[];
};

const defaultSnapshot: WorkbenchLiveSnapshot = {
  routeId: "",
  toolSlug: "",
  active: false,
  streaming: false,
  statusText: null,
  lastPrompt: "",
  preview: null,
  renderSession: null,
  videoProgress: 0,
  videoPhase: null,
  terminalLog: [],
  streamText: "",
  chartSeries: [],
  chartLabels: [],
  metrics: [],
  scenes: [],
  marketingSlots: [],
};

let snapshot: WorkbenchLiveSnapshot = { ...defaultSnapshot };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function patch(partial: Partial<WorkbenchLiveSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function subscribeWorkbenchLive(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWorkbenchLiveSnapshot(): WorkbenchLiveSnapshot {
  return snapshot;
}

export function useWorkbenchLive(): WorkbenchLiveSnapshot {
  return useSyncExternalStore(
    subscribeWorkbenchLive,
    getWorkbenchLiveSnapshot,
    getWorkbenchLiveSnapshot,
  );
}

export function useWorkbenchLiveForRoute(routeId: string): WorkbenchLiveSnapshot {
  const live = useWorkbenchLive();
  if (!routeId || live.routeId === routeId) return live;
  return { ...defaultSnapshot, routeId, toolSlug: live.toolSlug };
}

export function setWorkbenchContext(toolSlug: string, routeId: string) {
  if (snapshot.toolSlug === toolSlug && snapshot.routeId === routeId) return;
  patch({
    toolSlug,
    routeId,
    active: true,
  });
}

export function beginWorkbenchStream(routeId: string, prompt: string) {
  patch({
    routeId,
    active: true,
    streaming: true,
    lastPrompt: prompt,
    statusText: "Processing prompt…",
    streamText: "",
    terminalLog: [`$ agent --route ${routeId}`, `> ${prompt.slice(0, 120)}${prompt.length > 120 ? "…" : ""}`],
  });
}

export function endWorkbenchStream(routeId?: string) {
  if (routeId && snapshot.routeId !== routeId) return;
  patch({
    streaming: false,
    statusText: snapshot.statusText === "Processing prompt…" ? "Ready" : snapshot.statusText,
  });
}

export function pushWorkbenchPreview(
  routeId: string,
  preview: ExecutionPreviewState | null,
) {
  if (routeId && snapshot.routeId && snapshot.routeId !== routeId) return;

  const files = preview?.files ?? [];
  const chartLabels =
    preview?.type === "analytics"
      ? (preview as ExecutionPreviewState & { labels?: string[] }).label
        ? []
        : []
      : snapshot.chartLabels;

  let marketingSlots = snapshot.marketingSlots;
  if (preview?.type === "marketing" || preview?.label?.toLowerCase().includes("marketing")) {
    marketingSlots = [
      { title: "Image Ad Layout", imageUrl: preview.image_url },
      { title: "Promo Video Clip", videoUrl: preview.video_url },
      { title: "Social Captions", content: preview.label },
    ];
  }

  let scenes = snapshot.scenes;
  if (preview?.type === "video" || preview?.video_url) {
    scenes = Array.from({ length: 5 }, (_, i) => ({
      id: `scene-${i + 1}`,
      label: `Scene ${i + 1}`,
      progress: preview?.video_url ? 100 : Math.min(95, snapshot.videoProgress),
      thumbnail: i === 0 ? preview?.image_url : undefined,
    }));
  }

  patch({
    routeId: routeId || snapshot.routeId,
    active: true,
    preview,
    marketingSlots,
    scenes,
    chartSeries: files.length ? snapshot.chartSeries : snapshot.chartSeries,
    terminalLog: preview
      ? [...snapshot.terminalLog, `✓ Preview updated · ${preview.type}`]
      : snapshot.terminalLog,
  });

  if (preview?.svg || preview?.type === "blueprint") {
    setArchitectureRenderPct(Math.min(100, snapshot.terminalLog.length * 12 + 40));
  }
}

export function pushWorkbenchRenderSession(
  routeId: string,
  session: LiveRenderSession | null,
) {
  if (routeId && snapshot.routeId && snapshot.routeId !== routeId) return;
  patch({
    routeId: routeId || snapshot.routeId,
    active: true,
    renderSession: session,
    statusText: session?.processState ?? snapshot.statusText,
  });
}

export function pushWorkbenchStatus(routeId: string, statusText: string | null) {
  if (routeId && snapshot.routeId && snapshot.routeId !== routeId) return;
  patch({ statusText, active: true });
}

/** NLP design prompt → 3D scene (Group B) */
export function pushWorkbenchDesignPrompt(prompt: string) {
  patch({ lastPrompt: prompt, active: true, streaming: prompt.trim().length > 12 });
}

export function pushWorkbenchVideoProgress(
  routeId: string,
  progress: number,
  phase?: string | null,
) {
  if (routeId && snapshot.routeId && snapshot.routeId !== routeId) return;
  const scenes = snapshot.scenes.length
    ? snapshot.scenes.map((s, i) => ({
        ...s,
        progress: Math.min(100, progress - i * 8),
      }))
    : Array.from({ length: 5 }, (_, i) => ({
        id: `scene-${i + 1}`,
        label: `Scene ${i + 1}`,
        progress: Math.max(0, Math.min(100, progress - i * 15)),
      }));
  patch({
    videoProgress: progress,
    videoPhase: phase ?? snapshot.videoPhase,
    scenes,
    streaming: progress < 100,
    active: true,
  });
}

export function appendWorkbenchLog(line: string) {
  patch({ terminalLog: [...snapshot.terminalLog.slice(-24), line], active: true });
  emitDevTerminalLine(line);
}

export function applyWorkbenchStreamToken(
  routeId: string,
  token: string,
  accumulated: string,
) {
  if (routeId && snapshot.routeId && snapshot.routeId !== routeId) return;
  const text = accumulated || snapshot.streamText + token;
  const nums = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1] ?? "0"));
  const series = nums.filter((n) => n > 0 && n < 500).slice(-12);

  const lower = text.toLowerCase();
  const metrics: WorkbenchMetric[] = [];
  if (lower.includes("glucose") || lower.includes("118")) {
    metrics.push({ label: "Glucose", value: "118 mg/dL", ok: false });
  }
  if (lower.includes("wbc") || lower.includes("blood")) {
    metrics.push({ label: "WBC", value: "7.2 K/µL", ok: true });
  }
  if (lower.includes("calcium")) {
    metrics.push({ label: "Calcium", value: "9.1 mg/dL", ok: true });
  }

  if (lower.includes("architect") || lower.includes("room") || lower.includes("pool")) {
    setArchitectureRenderPct(Math.min(100, snapshot.terminalLog.length * 5 + text.length / 40));
  }

  patch({
    streaming: true,
    streamText: text,
    chartSeries: series.length >= 3 ? series : snapshot.chartSeries,
    chartLabels: series.length >= 3 ? series.map((_, i) => `P${i + 1}`) : snapshot.chartLabels,
    metrics: metrics.length ? metrics : snapshot.metrics,
    statusText: `Building… ${Math.min(99, Math.round(text.length / 8))}%`,
    active: true,
  });
}

export function pushWorkbenchFiles(routeId: string, files: GeneratedFileAsset[]) {
  if (!files.length) return;
  pushWorkbenchPreview(
    routeId,
    {
      type: "app_build",
      label: "Generated project",
      files,
      active_tab: "code",
    },
  );
  appendWorkbenchLog(`✓ ${files.length} file(s) generated`);
}

export function resetWorkbenchLive(routeId?: string) {
  if (routeId && snapshot.routeId !== routeId) return;
  snapshot = { ...defaultSnapshot, routeId: routeId ?? "", toolSlug: snapshot.toolSlug };
  emit();
}
