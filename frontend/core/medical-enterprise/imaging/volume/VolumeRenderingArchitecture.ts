import type { VolumeRenderConfig } from "../types";

export type GPURenderHook = {
  id: string;
  label: string;
  initialize: (canvas: HTMLCanvasElement) => Promise<void>;
  renderVolume: (config: VolumeRenderConfig, volumeData: ArrayBuffer) => void;
  dispose: () => void;
};

/** 3D volume rendering architecture — MPR, slice sync, GPU hooks */
export class VolumeRenderingArchitecture {
  private hooks = new Map<string, GPURenderHook>();
  private configs = new Map<string, VolumeRenderConfig>();

  registerGPUHook(hook: GPURenderHook) {
    this.hooks.set(hook.id, hook);
  }

  getHook(id: string) {
    return this.hooks.get(id);
  }

  createConfig(studyId: string, seriesId: string, sliceCount: number): VolumeRenderConfig {
    const config: VolumeRenderConfig = {
      studyId,
      seriesId,
      mode: "mpr-axial",
      gpuEnabled: typeof WebGLRenderingContext !== "undefined",
      sliceIndex: Math.floor(sliceCount / 2),
      sliceCount,
      synchronizedViewers: [],
    };
    this.configs.set(`${studyId}:${seriesId}`, config);
    return config;
  }

  setMode(studyId: string, seriesId: string, mode: VolumeRenderConfig["mode"]) {
    const c = this.configs.get(`${studyId}:${seriesId}`);
    if (c) c.mode = mode;
    return c;
  }

  syncSlice(studyId: string, seriesId: string, sliceIndex: number) {
    const c = this.configs.get(`${studyId}:${seriesId}`);
    if (!c) return;
    c.sliceIndex = sliceIndex;
    for (const viewerId of c.synchronizedViewers) {
      void viewerId;
    }
    return c;
  }

  linkMPRViewers(studyId: string, seriesId: string, viewerIds: string[]) {
    const c = this.configs.get(`${studyId}:${seriesId}`);
    if (c) c.synchronizedViewers = viewerIds;
    return c;
  }
}

let volume: VolumeRenderingArchitecture | null = null;

export function getVolumeRenderingArchitecture(): VolumeRenderingArchitecture {
  if (!volume) volume = new VolumeRenderingArchitecture();
  return volume;
}
