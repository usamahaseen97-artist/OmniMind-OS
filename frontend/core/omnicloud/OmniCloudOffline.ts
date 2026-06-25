import { omniCloudApiClient } from "./OmniCloudApiClient";
import { omniCloudSyncEngine } from "./OmniCloudSyncEngine";
import type { ConflictResolution, OfflineQueueItem, SyncDomain } from "./types";

/** Offline Mode — offline editing, AI queue, auto-sync, conflict resolution. */
export class OmniCloudOffline {
  offline = false;
  queue: OfflineQueueItem[] = [];

  setOffline(value: boolean) {
    this.offline = value;
    omniCloudSyncEngine.status = value ? "offline" : "idle";
    return this.offline;
  }

  enqueue(domain: SyncDomain, operation: OfflineQueueItem["operation"], payloadRef: string) {
    const item: OfflineQueueItem = {
      id: `off-${Date.now()}`,
      domain,
      operation,
      payloadRef,
      queuedAt: new Date().toISOString(),
    };
    this.queue.unshift(item);
    void omniCloudApiClient.pushOfflineQueue({ domain, operation, payloadRef });
    return item;
  }

  async flush() {
    if (this.offline) return { ok: false, flushed: 0 };
    const pending = [...this.queue];
    this.queue = [];
    for (const item of pending) {
      await omniCloudSyncEngine.syncDomain(item.domain);
    }
    return { ok: true, flushed: pending.length };
  }

  async resolveConflict(domain: SyncDomain, resolution: ConflictResolution) {
    await omniCloudApiClient.resolveConflict(domain, resolution);
    return omniCloudSyncEngine.syncDomain(domain);
  }

  snapshot() {
    return { offline: this.offline, queueLength: this.queue.length };
  }
}

export const omniCloudOffline = new OmniCloudOffline();
