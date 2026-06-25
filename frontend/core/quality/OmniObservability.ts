import type { ServiceHealth, SystemMetrics } from "./types";

/** OmniObservability — application, API, DB, AI, plugin, SDK metrics. */
export class OmniObservability {
  private counters = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  increment(metric: string, value = 1) {
    this.counters.set(metric, (this.counters.get(metric) ?? 0) + value);
  }

  recordLatency(metric: string, ms: number) {
    const arr = this.histograms.get(metric) ?? [];
    arr.push(ms);
    if (arr.length > 200) arr.shift();
    this.histograms.set(metric, arr);
  }

  p95(metric: string) {
    const arr = [...(this.histograms.get(metric) ?? [])].sort((a, b) => a - b);
    if (!arr.length) return null;
    return arr[Math.floor(arr.length * 0.95)] ?? null;
  }

  snapshot() {
    return {
      counters: Object.fromEntries(this.counters),
      latencies: Object.fromEntries(
        Array.from(this.histograms.keys()).map((k) => [k, { p95: this.p95(k), count: this.histograms.get(k)?.length ?? 0 }]),
      ),
    };
  }

  metrics(): SystemMetrics {
    let memoryMb: number | null = null;
    if (typeof performance !== "undefined" && "memory" in performance) {
      const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (mem) memoryMb = Math.round(mem.usedJSHeapSize / 1_048_576);
    }
    return {
      memoryMb,
      cpuPercent: null,
      requestQueueDepth: this.counters.get("api.inflight") ?? 0,
      backgroundJobs: this.counters.get("jobs.queued") ?? 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const omniObservability = new OmniObservability();
