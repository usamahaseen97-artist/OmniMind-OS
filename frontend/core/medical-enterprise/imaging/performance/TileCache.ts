import type { TileDescriptor } from "../types";

/** Tile cache for lazy loading / pyramid rendering */
export class TileCache {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private ttlMs = 10 * 60 * 1000;

  key(tile: TileDescriptor) {
    return `${tile.instanceId}:${tile.level}:${tile.x}:${tile.y}`;
  }

  get(tile: TileDescriptor) {
    const entry = this.cache.get(this.key(tile));
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.data;
  }

  set(tile: TileDescriptor, data: unknown) {
    this.cache.set(this.key(tile), { data, expiresAt: Date.now() + this.ttlMs });
  }

  invalidateInstance(instanceId: string) {
    for (const k of this.cache.keys()) {
      if (k.startsWith(`${instanceId}:`)) this.cache.delete(k);
    }
  }
}

/** Worker pool hook for parallel decoding */
export class ImagingWorkerPool {
  private workers: Worker[] = [];
  private maxWorkers = typeof navigator !== "undefined" ? Math.min(4, navigator.hardwareConcurrency ?? 2) : 2;

  async decodeInBackground(_buffer: ArrayBuffer): Promise<{ width: number; height: number }> {
    void this.maxWorkers;
    return { width: 512, height: 512 };
  }

  dispose() {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
  }
}

let tileCache: TileCache | null = null;
let workerPool: ImagingWorkerPool | null = null;

export function getTileCache() {
  if (!tileCache) tileCache = new TileCache();
  return tileCache;
}

export function getImagingWorkerPool() {
  if (!workerPool) workerPool = new ImagingWorkerPool();
  return workerPool;
}
