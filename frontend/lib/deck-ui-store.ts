"use client";

import { useSyncExternalStore } from "react";

export type MeatCategoryId = "mutton" | "cow";

export type ArchitectureRoomId = "living" | "kitchen" | "bed" | "bath";

type DeckUiSnapshot = {
  analyticsCategory: MeatCategoryId;
  analyticsFlashTs: number;
  architectureRoom: ArchitectureRoomId;
  architectureRenderPct: number;
  tradingAutopilot: boolean;
};

let snapshot: DeckUiSnapshot = {
  analyticsCategory: "mutton",
  analyticsFlashTs: 0,
  architectureRoom: "living",
  architectureRenderPct: 0,
  tradingAutopilot: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function patch(partial: Partial<DeckUiSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function subscribeDeckUi(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDeckUiSnapshot(): DeckUiSnapshot {
  return snapshot;
}

export function useDeckUi(): DeckUiSnapshot {
  return useSyncExternalStore(subscribeDeckUi, getDeckUiSnapshot, getDeckUiSnapshot);
}

export function setAnalyticsCategory(id: MeatCategoryId) {
  patch({ analyticsCategory: id, analyticsFlashTs: Date.now() });
}

export function setArchitectureRoom(id: ArchitectureRoomId) {
  patch({ architectureRoom: id, architectureRenderPct: 8 });
}

export function setArchitectureRenderPct(pct: number) {
  patch({ architectureRenderPct: Math.min(100, Math.max(0, pct)) });
}

export function setTradingAutopilot(on: boolean) {
  patch({ tradingAutopilot: on });
}

export function toggleTradingAutopilot() {
  patch({ tradingAutopilot: !snapshot.tradingAutopilot });
}
