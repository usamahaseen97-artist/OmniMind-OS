"use client";

import { useSyncExternalStore } from "react";
import type { SceneAsset } from "../components/ide/matrix/live/scene-asset-types";

let assets: SceneAsset[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeSpatialCanvas(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSpatialCanvasAssets(): SceneAsset[] {
  return useSyncExternalStore(subscribeSpatialCanvas, () => assets, () => assets);
}

export function addSpatialCanvasAsset(emoji: string, _label?: string) {
  const id = `${emoji}-${Date.now()}`;
  const x = (Math.random() - 0.5) * 2.2;
  const z = (Math.random() - 0.5) * 1.6;
  assets = [...assets, { id, emoji, x, z }];
  emit();
  return { id, x, z };
}

export function moveSpatialCanvasAsset(id: string, x: number, z: number) {
  assets = assets.map((a) => (a.id === id ? { ...a, x, z } : a));
  emit();
}

export function resetSpatialCanvasAssets() {
  assets = [];
  emit();
}
