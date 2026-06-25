/** Performance optimization layer — caching, lazy load, GPU hooks */
export class PerformanceLayer {
  private renderCache = new Map<string, { data: unknown; expiresAt: number }>();
  private gpuHooks = new Map<string, (task: string) => Promise<unknown>>();

  readonly config = {
    renderDebounceMs: 16,
    imageTileCacheTtlMs: 300_000,
    aiCacheTtlMs: 180_000,
    maxPatientDatasetPageSize: 100,
    backgroundWorkerConcurrency: 4,
  };

  memoize<T>(key: string, factory: () => T, ttlMs = 60_000): T {
    const hit = this.renderCache.get(key);
    if (hit && Date.now() < hit.expiresAt) return hit.data as T;
    const data = factory();
    this.renderCache.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
  }

  invalidate(prefix: string) {
    for (const k of this.renderCache.keys()) {
      if (k.startsWith(prefix)) this.renderCache.delete(k);
    }
  }

  registerGPUWorker(id: string, handler: (task: string) => Promise<unknown>) {
    this.gpuHooks.set(id, handler);
  }

  async runGPUTask(workerId: string, task: string) {
    const hook = this.gpuHooks.get(workerId);
    if (!hook) return null;
    return hook(task);
  }

  paginate<T>(items: T[], page: number, pageSize = this.config.maxPatientDatasetPageSize) {
    const start = page * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
  }

  getMetrics() {
    return {
      cacheEntries: this.renderCache.size,
      gpuWorkers: this.gpuHooks.size,
      config: this.config,
    };
  }
}

let layer: PerformanceLayer | null = null;

export function getPerformanceLayer() {
  if (!layer) layer = new PerformanceLayer();
  return layer;
}
