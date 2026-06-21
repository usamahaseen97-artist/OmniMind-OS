"use client";

import { useSyncExternalStore } from "react";
import {
  KARACHI_AREAS,
  KARACHI_DEFAULTS,
  computeKarachiMetrics,
  type KarachiAreaRow,
  type KarachiMetricId,
} from "./karachi-analytics-dataset";

export type MedicalIndicatorPill = {
  id: string;
  label: string;
  severity: "low" | "moderate" | "high";
  detail: string;
  solutions: string[];
};

type AnalyticsLive = {
  active: boolean;
  streaming: boolean;
  clientRuntime: boolean;
  engineDegraded: boolean;
  selectedMetric: KarachiMetricId;
  selectedAreaId: string;
  totalSalesLakhs: number;
  muttonSharePct: number;
  cowSharePct: number;
  wastagePct: number;
  growthPct: number;
  rowCounter: number;
  areas: KarachiAreaRow[];
  lastTokenAt: number;
};

type DevopsLive = {
  streamConsoleOpen: boolean;
  lastUserPrompt: string;
};

type MedicalLive = {
  active: boolean;
  streaming: boolean;
  indicators: MedicalIndicatorPill[];
  expandedId: string | null;
};

type Snapshot = {
  analytics: AnalyticsLive;
  devops: DevopsLive;
  medical: MedicalLive;
  anyStreaming: boolean;
};

const defaultAnalytics: AnalyticsLive = {
  active: false,
  streaming: false,
  clientRuntime: false,
  engineDegraded: false,
  selectedMetric: "total_sales",
  selectedAreaId: KARACHI_AREAS[0]?.id ?? "dha2",
  ...KARACHI_DEFAULTS,
  areas: KARACHI_AREAS.map((a) => ({ ...a })),
  lastTokenAt: 0,
};

const defaultMedical: MedicalLive = {
  active: false,
  streaming: false,
  indicators: [],
  expandedId: null,
};

let snapshot: Snapshot = {
  analytics: { ...defaultAnalytics },
  devops: { streamConsoleOpen: false, lastUserPrompt: "" },
  medical: { ...defaultMedical },
  anyStreaming: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function patch(partial: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function subscribeAgentLiveDeck(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAgentLiveDeckSnapshot(): Snapshot {
  return snapshot;
}

export function useAgentLiveDeck(): Snapshot {
  return useSyncExternalStore(
    subscribeAgentLiveDeck,
    getAgentLiveDeckSnapshot,
    getAgentLiveDeckSnapshot,
  );
}

export function setAnalyticsMetric(id: KarachiMetricId) {
  const a = snapshot.analytics;
  const computed = computeKarachiMetrics(a.areas, a.selectedAreaId, id);
  patch({
    analytics: {
      ...a,
      selectedMetric: id,
      ...computed,
      streaming: true,
      rowCounter: a.rowCounter + 1,
      lastTokenAt: Date.now(),
    },
    anyStreaming: true,
  });
  window.setTimeout(() => {
    patch({
      analytics: { ...getAgentLiveDeckSnapshot().analytics, streaming: false },
      anyStreaming: false,
    });
  }, 480);
}

export function setAnalyticsArea(areaId: string) {
  const a = snapshot.analytics;
  const computed = computeKarachiMetrics(a.areas, areaId, "area_breakdown");
  patch({
    analytics: {
      ...a,
      selectedAreaId: areaId,
      selectedMetric: "area_breakdown",
      ...computed,
      streaming: true,
      rowCounter: a.rowCounter + 1,
      lastTokenAt: Date.now(),
    },
    anyStreaming: true,
  });
  window.setTimeout(() => {
    patch({
      analytics: { ...getAgentLiveDeckSnapshot().analytics, streaming: false },
      anyStreaming: false,
    });
  }, 520);
}

export function ensureAgentDeckRuntime(routeId: string) {
  if (routeId === "business-analytics") {
    patch({
      analytics: {
        ...defaultAnalytics,
        active: true,
        clientRuntime: true,
        areas: KARACHI_AREAS.map((a) => ({ ...a })),
      },
    });
  }
}

export function activateAnalyticsClientRuntime(userPrompt = "") {
  const lower = userPrompt.toLowerCase();
  const areas = KARACHI_AREAS.map((a) => {
    if (lower.includes(a.name.toLowerCase()) || lower.includes(a.id)) {
      return {
        ...a,
        sharePct: Math.min(99, a.sharePct + 2),
        salesLakhs: Math.round(a.salesLakhs * 1.04 * 10) / 10,
      };
    }
    return { ...a };
  });

  patch({
    analytics: {
      ...snapshot.analytics,
      active: true,
      streaming: true,
      clientRuntime: true,
      engineDegraded: true,
      areas,
      rowCounter: snapshot.analytics.rowCounter + 3,
      lastTokenAt: Date.now(),
    },
    anyStreaming: true,
  });

  window.setTimeout(() => {
    patch({
      analytics: { ...snapshot.analytics, streaming: false },
      anyStreaming: false,
    });
  }, 1400);
}

export function activateMedicalClientRuntime(userPrompt: string) {
  applyMedicalStreamDelta(userPrompt || "clinical assessment runtime", userPrompt);
  patch({
    medical: { ...snapshot.medical, active: true, streaming: false },
  });
}

export function activateDevopsClientRuntime(userPrompt: string) {
  patch({
    devops: { streamConsoleOpen: true, lastUserPrompt: userPrompt },
  });
}

export function handleAgentEngineFailure(routeId: string, userPrompt = "") {
  if (routeId === "business-analytics") {
    activateAnalyticsClientRuntime(userPrompt);
    return;
  }
  if (routeId === "medical-diagnostic") {
    activateMedicalClientRuntime(userPrompt);
    return;
  }
  if (routeId === "app-and-develop" || routeId === "business-software-architect") {
    activateDevopsClientRuntime(userPrompt);
  }
  endAgentStream();
}

export function setMedicalExpanded(id: string | null) {
  patch({ medical: { ...snapshot.medical, expandedId: id } });
}

export function resetAgentLiveDeckForRoute(routeId: string) {
  if (routeId === "business-analytics") {
    patch({
      analytics: {
        ...defaultAnalytics,
        active: true,
        clientRuntime: true,
        engineDegraded: false,
        areas: KARACHI_AREAS.map((a) => ({ ...a })),
      },
    });
  }
  if (routeId === "medical-diagnostic") {
    patch({ medical: { ...defaultMedical, active: true } });
  }
  if (routeId === "app-and-develop" || routeId === "business-software-architect") {
    patch({ devops: { streamConsoleOpen: true, lastUserPrompt: "" } });
  }
}

export function beginAgentStream(routeId: string, userPrompt: string) {
  patch({ anyStreaming: true });
  resetAgentLiveDeckForRoute(routeId);
  if (routeId === "app-and-develop" || routeId === "business-software-architect") {
    patch({ devops: { streamConsoleOpen: true, lastUserPrompt: userPrompt } });
  }
}

export function endAgentStream() {
  patch({
    anyStreaming: false,
    analytics: {
      ...snapshot.analytics,
      streaming: false,
      active: snapshot.analytics.active || snapshot.analytics.clientRuntime,
    },
    medical: {
      ...snapshot.medical,
      streaming: false,
      active: snapshot.medical.active || snapshot.medical.indicators.length > 0,
    },
  });
}

export function applyAnalyticsStreamDelta(accumulated: string, token: string) {
  const lower = accumulated.toLowerCase();
  const nums = [...accumulated.matchAll(/(\d+(?:\.\d+)?)\s*%?/g)].map((m) =>
    parseFloat(m[1] ?? "0"),
  );
  const pct = nums.find((n) => n > 0 && n <= 100);
  const lakhs = nums.find((n) => n > 20 && n < 500);

  let mutton = snapshot.analytics.muttonSharePct;
  let cow = snapshot.analytics.cowSharePct;
  if (lower.includes("mutton")) mutton = pct ?? mutton;
  if (lower.includes("cow")) cow = pct ?? cow;
  if (lower.includes("wastage") && pct) {
    patch({
      analytics: {
        ...snapshot.analytics,
        active: true,
        streaming: true,
        wastagePct: pct,
        rowCounter: snapshot.analytics.rowCounter + 1,
        lastTokenAt: Date.now(),
      },
    });
    return;
  }

  const areas = snapshot.analytics.areas.map((a) => {
    const key = a.name.toLowerCase();
    const hit =
      lower.includes(key) ||
      lower.includes(a.id) ||
      (a.id === "dha2" && lower.includes("dha"));
    if (hit && pct) {
      return { ...a, sharePct: pct, salesLakhs: Math.round(a.salesLakhs * (1 + pct / 200) * 10) / 10 };
    }
    if (hit) {
      return {
        ...a,
        salesLakhs: Math.round(a.salesLakhs * 1.02 * 10) / 10,
      };
    }
    return a;
  });

  patch({
    analytics: {
      ...snapshot.analytics,
      active: true,
      streaming: true,
      muttonSharePct: mutton,
      cowSharePct: cow,
      totalSalesLakhs: lakhs ?? snapshot.analytics.totalSalesLakhs,
      growthPct: pct && pct < 30 ? pct : snapshot.analytics.growthPct,
      rowCounter: snapshot.analytics.rowCounter + (token.trim() ? 1 : 0),
      areas,
      lastTokenAt: Date.now(),
    },
  });
}

export function applyMedicalStreamDelta(accumulated: string, userPrompt: string) {
  const text = `${userPrompt} ${accumulated}`.toLowerCase();
  const pills: MedicalIndicatorPill[] = [];

  if (text.includes("calcium") || text.includes("deficien")) {
    pills.push({
      id: "calcium",
      label: "Calcium deficiency detected",
      severity: "moderate",
      detail: "Serum calcium proxy low on mock panel — correlate vitamin D and dietary intake.",
      solutions: [
        "Calcium + vitamin D supplementation per physician",
        "Repeat labs: calcium, albumin, vitamin D in 14 days",
      ],
    });
  }
  if (text.includes("fever") || text.includes("infection")) {
    pills.push({
      id: "fever",
      label: "Inflammatory markers elevated",
      severity: "moderate",
      detail: "Mock CRP/fever curve suggests localized infection workup.",
      solutions: ["CBC + CRP panel", "Hydration protocol", "Clinical review within 48h"],
    });
  }
  if (text.includes("pain") || text.includes("fracture")) {
    pills.push({
      id: "msk",
      label: "Musculoskeletal strain pattern",
      severity: text.includes("severe") ? "high" : "moderate",
      detail: "Mechanical pain distribution on symptom tokens (mock).",
      solutions: ["Rest + physiotherapy referral", "Imaging if trauma history"],
    });
  }

  if (!pills.length && accumulated.length > 40) {
    pills.push({
      id: "general",
      label: "Clinical review recommended",
      severity: "low",
      detail: "Streaming assessment from chat context (mock).",
      solutions: ["Continue symptom log", "Upload labs or imaging in Medical chat"],
    });
  }

  if (pills.length) {
    patch({
      medical: {
        ...snapshot.medical,
        active: true,
        streaming: true,
        indicators: pills,
      },
    });
  }
}
