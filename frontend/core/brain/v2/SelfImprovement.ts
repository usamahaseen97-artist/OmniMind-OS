import type { Brain2PerformanceMetrics } from "./types";

const METRICS_KEY = "omnimind_brain2_metrics_v1";

const DEFAULT: Brain2PerformanceMetrics = {
  accuracy: 82,
  latencyMs: 0,
  toolUsage: 0,
  failures: 0,
  recovery: 100,
  learningScore: 75,
  memoryQuality: 80,
  reasoningQuality: 78,
  updatedAt: new Date().toISOString(),
};

/** Self-improvement metrics — accuracy, latency, learning score. */
export class SelfImprovementEngine {
  private metrics: Brain2PerformanceMetrics = { ...DEFAULT };

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(METRICS_KEY);
      if (raw) this.metrics = { ...DEFAULT, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    localStorage.setItem(METRICS_KEY, JSON.stringify(this.metrics));
  }

  getMetrics(): Brain2PerformanceMetrics {
    return { ...this.metrics };
  }

  recordSuccess(latencyMs: number, toolId: string) {
    this.metrics.latencyMs = Math.round(this.metrics.latencyMs * 0.7 + latencyMs * 0.3);
    this.metrics.toolUsage += 1;
    this.metrics.accuracy = Math.min(99, this.metrics.accuracy + 0.5);
    this.metrics.reasoningQuality = Math.min(99, this.metrics.reasoningQuality + 0.3);
    this.metrics.learningScore = Math.min(99, this.metrics.learningScore + 0.2);
    this.metrics.updatedAt = new Date().toISOString();
    this.persist();
    void toolId;
  }

  recordFailure(recovered: boolean) {
    this.metrics.failures += 1;
    if (recovered) this.metrics.recovery = Math.min(100, this.metrics.recovery + 1);
    else this.metrics.recovery = Math.max(0, this.metrics.recovery - 5);
    this.metrics.accuracy = Math.max(50, this.metrics.accuracy - 1);
    this.metrics.updatedAt = new Date().toISOString();
    this.persist();
  }

  recordMemoryUse(quality: number) {
    this.metrics.memoryQuality = Math.round(this.metrics.memoryQuality * 0.8 + quality * 0.2);
    this.persist();
  }
}

let engine: SelfImprovementEngine | null = null;

export function getSelfImprovementEngine(): SelfImprovementEngine {
  if (!engine) engine = new SelfImprovementEngine();
  return engine;
}
