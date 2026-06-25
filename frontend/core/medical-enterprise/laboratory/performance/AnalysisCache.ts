import type { LabAIObservation } from "../types";

/** Analysis result cache — parallel analysis support */
export class AnalysisCache {
  private cache = new Map<string, { result: LabAIObservation; expiresAt: number }>();
  private ttlMs = 5 * 60 * 1000;

  key(reportId: string, modelVersion = "v1") {
    return `lab-ai:${reportId}:${modelVersion}`;
  }

  get(reportId: string) {
    const entry = this.cache.get(this.key(reportId));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(this.key(reportId));
      return null;
    }
    return entry.result;
  }

  set(reportId: string, result: LabAIObservation) {
    this.cache.set(this.key(reportId), { result, expiresAt: Date.now() + this.ttlMs });
  }

  invalidate(reportId: string) {
    for (const k of this.cache.keys()) {
      if (k.includes(reportId)) this.cache.delete(k);
    }
  }

  /** GPU-ready hook for future accelerated analysis */
  registerGPUWorker(_workerId: string, _handler: (reportId: string) => Promise<LabAIObservation>) {
    /* plug-in point */
  }
}

let cache: AnalysisCache | null = null;

export function getAnalysisCache() {
  if (!cache) cache = new AnalysisCache();
  return cache;
}
