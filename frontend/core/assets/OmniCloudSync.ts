import type { CloudSyncState, SyncItem } from "./types";

/** Cloud sync architecture — offline mode, conflict detection, sync queue. */
export class OmniCloudSync {
  state: CloudSyncState = {
    enabled: false,
    offline: false,
    quotaBytes: 10 * 1024 * 1024 * 1024,
    usedBytes: 0,
    lastSyncAt: null,
    queue: [],
  };

  enable(on = true) {
    this.state.enabled = on;
    return this.state;
  }

  setOffline(offline: boolean) {
    this.state.offline = offline;
    return this.state;
  }

  enqueue(path: string, direction: SyncItem["direction"]) {
    const item: SyncItem = {
      id: `sync-${Date.now()}`,
      path,
      direction,
      status: "queued",
      progress: 0,
      conflictWith: null,
    };
    this.state.queue.unshift(item);
    return item;
  }

  processNext() {
    const item = this.state.queue.find((i) => i.status === "queued");
    if (!item || this.state.offline) return null;
    item.status = "running";
    item.progress = 100;
    item.status = "completed";
    this.state.lastSyncAt = new Date().toISOString();
    return item;
  }

  detectConflict(path: string, remoteVersion: string, localVersion: string): SyncItem | null {
    if (remoteVersion !== localVersion) {
      const item = this.enqueue(path, "upload");
      item.status = "conflict";
      item.conflictWith = remoteVersion;
      return item;
    }
    return null;
  }
}

export const omniCloudSync = new OmniCloudSync();
