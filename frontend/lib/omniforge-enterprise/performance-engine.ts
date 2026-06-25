export type PerformanceConfig = {
  streamingGeneration: boolean;
  incrementalIndexing: boolean;
  cacheEnabled: boolean;
  lazyLoadPanels: boolean;
  parallelAgents: number;
  backgroundWorkers: number;
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  streamingGeneration: true,
  incrementalIndexing: true,
  cacheEnabled: true,
  lazyLoadPanels: true,
  parallelAgents: 4,
  backgroundWorkers: 2,
};

/** Performance tuning for enterprise OmniForge workloads. */
export class PerformanceEngine {
  private config: PerformanceConfig = { ...DEFAULT_PERFORMANCE_CONFIG };
  private cache = new Map<string, unknown>();

  getConfig() {
    return { ...this.config };
  }

  configure(patch: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...patch };
  }

  cacheGet<T>(key: string): T | undefined {
    if (!this.config.cacheEnabled) return undefined;
    return this.cache.get(key) as T | undefined;
  }

  cacheSet(key: string, value: unknown) {
    if (!this.config.cacheEnabled) return;
    this.cache.set(key, value);
  }

  shouldStream() {
    return this.config.streamingGeneration;
  }

  agentPoolSize() {
    return this.config.parallelAgents;
  }
}

let engine: PerformanceEngine | null = null;

export function getPerformanceEngine(): PerformanceEngine {
  if (!engine) engine = new PerformanceEngine();
  return engine;
}
