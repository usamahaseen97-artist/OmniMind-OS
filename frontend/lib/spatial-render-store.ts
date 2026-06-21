"use client";

import { useSyncExternalStore } from "react";
import type { SpatialRenderDialogState } from "./spatial-engine-api";

export type SpatialRenderMode = "matrix" | "cinematic";

export type SpatialTimelineKeyframe = {
  id: string;
  label: string;
  duration: number;
  transition: number;
};

type SpatialStore = {
  mode: SpatialRenderMode;
  sessionId: string;
  configText: string;
  renderDialog: SpatialRenderDialogState;
  manualPanelOpen: boolean;
  timeline: SpatialTimelineKeyframe[];
};

const DEFAULT_DIALOG: SpatialRenderDialogState = {
  duration: 15,
  transition: 3,
  resolution: "1080p",
  quality_samples: 256,
};

const DEFAULT_TIMELINE: SpatialTimelineKeyframe[] = [
  { id: "kf-intro", label: "Intro orbit", duration: 4, transition: 2 },
  { id: "kf-hero", label: "Hero elevation", duration: 5, transition: 3 },
  { id: "kf-detail", label: "Detail pass", duration: 4, transition: 2 },
  { id: "kf-outro", label: "Finale pull-back", duration: 2, transition: 1 },
];

let state: SpatialStore = {
  mode: "matrix",
  sessionId: "",
  configText: "",
  renderDialog: { ...DEFAULT_DIALOG },
  manualPanelOpen: false,
  timeline: [...DEFAULT_TIMELINE],
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeSpatialRender(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SpatialStore {
  return state;
}

export function useSpatialRenderMode(): SpatialRenderMode {
  return useSyncExternalStore(subscribeSpatialRender, () => state.mode, () => state.mode);
}

export function useSpatialSessionId(): string {
  return useSyncExternalStore(subscribeSpatialRender, () => state.sessionId, () => state.sessionId);
}

export function useSpatialConfigText(): string {
  return useSyncExternalStore(subscribeSpatialRender, () => state.configText, () => state.configText);
}

export function useSpatialRenderDialog(): SpatialRenderDialogState {
  return useSyncExternalStore(subscribeSpatialRender, () => state.renderDialog, () => state.renderDialog);
}

export function useSpatialManualPanelOpen(): boolean {
  return useSyncExternalStore(subscribeSpatialRender, () => state.manualPanelOpen, () => state.manualPanelOpen);
}

export function useSpatialTimeline(): SpatialTimelineKeyframe[] {
  return useSyncExternalStore(subscribeSpatialRender, () => state.timeline, () => state.timeline);
}

export function setSpatialRenderMode(next: SpatialRenderMode) {
  if (state.mode === next) return;
  state = { ...state, mode: next };
  emit();
}

export function setSpatialSessionId(id: string) {
  if (state.sessionId === id) return;
  state = { ...state, sessionId: id };
  emit();
}

export function setSpatialConfigText(text: string) {
  if (state.configText === text) return;
  state = { ...state, configText: text };
  emit();
}

export function setSpatialRenderDialog(patch: Partial<SpatialRenderDialogState>) {
  state = { ...state, renderDialog: { ...state.renderDialog, ...patch } };
  emit();
}

export function setSpatialManualPanelOpen(open: boolean) {
  if (state.manualPanelOpen === open) return;
  state = { ...state, manualPanelOpen: open };
  emit();
}

export function toggleSpatialManualPanel() {
  state = { ...state, manualPanelOpen: !state.manualPanelOpen };
  emit();
}

export function setSpatialTimeline(next: SpatialTimelineKeyframe[]) {
  state = { ...state, timeline: next };
  emit();
}

export function updateSpatialTimelineKeyframe(id: string, patch: Partial<SpatialTimelineKeyframe>) {
  state = {
    ...state,
    timeline: state.timeline.map((kf) => (kf.id === id ? { ...kf, ...patch } : kf)),
  };
  emit();
}

export function applySpatialHybridSync(payload: {
  session_id?: string;
  config_text?: string;
  render_mode?: SpatialRenderMode;
  render_dialog_state?: Partial<SpatialRenderDialogState>;
}) {
  state = {
    ...state,
    sessionId: payload.session_id ?? state.sessionId,
    configText: payload.config_text ?? state.configText,
    mode: payload.render_mode ?? state.mode,
    renderDialog: payload.render_dialog_state
      ? { ...state.renderDialog, ...payload.render_dialog_state }
      : state.renderDialog,
  };
  emit();
}
