import type { InferenceSlot, ModelProviderId } from "./types";

/** Tracks inference slots / GPU allocation — stub metrics only. */
export class InferenceManager {
  private slots: InferenceSlot[] = [
    { id: "gpu-0", label: "GPU 0 · Primary", providerId: "local", gpuUtilization: 0, activeJobId: null },
    { id: "gpu-1", label: "GPU 1 · Secondary", providerId: "comfyui", gpuUtilization: 0, activeJobId: null },
    { id: "cloud-0", label: "Cloud Render Pool", providerId: "runway", gpuUtilization: 0, activeJobId: null },
  ];

  listSlots() {
    return [...this.slots];
  }

  assign(jobId: string, providerId: ModelProviderId, cloud: boolean) {
    const slotId = cloud ? "cloud-0" : "gpu-0";
    this.slots = this.slots.map((s) =>
      s.id === slotId
        ? { ...s, providerId, activeJobId: jobId, gpuUtilization: 35 + Math.floor(Math.random() * 40) }
        : s,
    );
    return slotId;
  }

  release(jobId: string) {
    this.slots = this.slots.map((s) =>
      s.activeJobId === jobId ? { ...s, activeJobId: null, gpuUtilization: Math.max(0, s.gpuUtilization - 30) } : s,
    );
  }

  aggregateUtilization() {
    const active = this.slots.filter((s) => s.activeJobId);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((sum, s) => sum + s.gpuUtilization, 0) / active.length);
  }
}

export const inferenceManager = new InferenceManager();
