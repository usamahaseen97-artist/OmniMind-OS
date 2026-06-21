"use client";

import { useSyncExternalStore } from "react";

export type WorkbenchZoneState = {
  chatOpen: boolean;
  codeOpen: boolean;
  previewOpen: boolean;
  terminalOpen: boolean;
};

let state: WorkbenchZoneState = {
  chatOpen: true,
  codeOpen: true,
  previewOpen: true,
  terminalOpen: true,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function patch(partial: Partial<WorkbenchZoneState>) {
  state = { ...state, ...partial };
  emit();
}

export function subscribeWorkbenchZones(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWorkbenchZoneSnapshot(): WorkbenchZoneState {
  return state;
}

export function useWorkbenchZones(): WorkbenchZoneState {
  return useSyncExternalStore(subscribeWorkbenchZones, getWorkbenchZoneSnapshot, getWorkbenchZoneSnapshot);
}

export function setChatPanelOpen(open: boolean) {
  patch({ chatOpen: open });
}

export function setCodePanelOpen(open: boolean) {
  patch({ codeOpen: open });
}

export function setPreviewPanelOpen(open: boolean) {
  patch({ previewOpen: open });
}

export function togglePreviewPanel() {
  patch({ previewOpen: !state.previewOpen });
}

export function setTerminalPanelOpen(open: boolean) {
  patch({ terminalOpen: open });
}

export function toggleChatPanel() {
  patch({ chatOpen: !state.chatOpen });
}

export function toggleCodePanel() {
  patch({ codeOpen: !state.codeOpen });
}

export function toggleTerminalPanel() {
  patch({ terminalOpen: !state.terminalOpen });
}

export function resetWorkbenchZones() {
  state = { chatOpen: true, codeOpen: true, previewOpen: true, terminalOpen: true };
  emit();
}
