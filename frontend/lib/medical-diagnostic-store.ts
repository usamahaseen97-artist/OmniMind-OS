"use client";

import { useSyncExternalStore } from "react";

export type MedicalFileType = "dicom" | "video" | "image";
export type MedicalStreamSource = "camera" | "upload";
export type MedicalRenderMode = "scan2d" | "volumetric3d";

export type MedicalScanAsset = {
  id: string;
  name: string;
  fileType: MedicalFileType;
  source: MedicalStreamSource;
  objectUrl: string;
  thumbnailUrl?: string;
};

export type MedicalAnomaly = {
  label: string;
  confidence: number;
  coordinates: [number, number, number, number];
};

export type MedicalManualSettings = {
  sensitivity: number;
  contrast: number;
  vascularIsolation: number;
};

type MedicalStore = {
  sessionId: string;
  renderMode: MedicalRenderMode;
  settings: MedicalManualSettings;
  assets: MedicalScanAsset[];
  activeAssetId: string | null;
  anomalies: MedicalAnomaly[];
  frameIndex: number;
  frameCount: number;
  meshUrl: string;
  clinicalSummary: string;
  filterBrightness: number;
  cameraActive: boolean;
};

const DEFAULT_SETTINGS: MedicalManualSettings = {
  sensitivity: 0.72,
  contrast: 1.0,
  vascularIsolation: 0.35,
};

let state: MedicalStore = {
  sessionId: "",
  renderMode: "scan2d",
  settings: { ...DEFAULT_SETTINGS },
  assets: [],
  activeAssetId: null,
  anomalies: [],
  frameIndex: 0,
  frameCount: 120,
  meshUrl: "",
  clinicalSummary: "",
  filterBrightness: 1,
  cameraActive: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeMedicalDiagnostic(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snap(): MedicalStore {
  return state;
}

export function useMedicalDiagnosticStore(): MedicalStore {
  return useSyncExternalStore(subscribeMedicalDiagnostic, snap, snap);
}

export function useMedicalSettings(): MedicalManualSettings {
  return useSyncExternalStore(subscribeMedicalDiagnostic, () => state.settings, () => state.settings);
}

export function useMedicalRenderMode(): MedicalRenderMode {
  return useSyncExternalStore(subscribeMedicalDiagnostic, () => state.renderMode, () => state.renderMode);
}

export function setMedicalSessionId(id: string) {
  if (state.sessionId === id) return;
  state = { ...state, sessionId: id };
  emit();
}

export function setMedicalRenderMode(mode: MedicalRenderMode) {
  if (state.renderMode === mode) return;
  state = { ...state, renderMode: mode };
  emit();
}

export function setMedicalSettings(patch: Partial<MedicalManualSettings>) {
  state = { ...state, settings: { ...state.settings, ...patch } };
  emit();
}

export function addMedicalAsset(asset: MedicalScanAsset) {
  state = {
    ...state,
    assets: [...state.assets, asset],
    activeAssetId: asset.id,
  };
  emit();
}

export function removeMedicalAsset(id: string) {
  const asset = state.assets.find((a) => a.id === id);
  if (asset?.objectUrl.startsWith("blob:")) URL.revokeObjectURL(asset.objectUrl);
  const assets = state.assets.filter((a) => a.id !== id);
  state = {
    ...state,
    assets,
    activeAssetId: state.activeAssetId === id ? assets[0]?.id ?? null : state.activeAssetId,
  };
  emit();
}

export function setActiveMedicalAsset(id: string | null) {
  state = { ...state, activeAssetId: id };
  emit();
}

export function setMedicalCameraActive(active: boolean) {
  state = { ...state, cameraActive: active };
  emit();
}

export function applyMedicalAnalysis(payload: {
  session_id?: string;
  anomalies_detected?: MedicalAnomaly[];
  volumetric_3d_mesh_url?: string;
  clinical_summary_draft?: string;
  frame_index?: number;
  filter_state?: { brightness?: number };
}) {
  state = {
    ...state,
    sessionId: payload.session_id ?? state.sessionId,
    anomalies: payload.anomalies_detected ?? state.anomalies,
    meshUrl: payload.volumetric_3d_mesh_url ?? state.meshUrl,
    clinicalSummary: payload.clinical_summary_draft ?? state.clinicalSummary,
    frameIndex: payload.frame_index ?? state.frameIndex,
    filterBrightness: payload.filter_state?.brightness ?? state.filterBrightness,
  };
  emit();
}

export function setMedicalFrameIndex(index: number) {
  state = { ...state, frameIndex: index };
  emit();
}

export function resetMedicalWorkspace() {
  state.assets.forEach((a) => {
    if (a.objectUrl.startsWith("blob:")) URL.revokeObjectURL(a.objectUrl);
  });
  state = {
    ...state,
    assets: [],
    activeAssetId: null,
    anomalies: [],
    frameIndex: 0,
    cameraActive: false,
  };
  emit();
}
