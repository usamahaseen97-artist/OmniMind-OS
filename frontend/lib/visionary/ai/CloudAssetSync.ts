import type { CloudSyncState, VisionaryAsset } from "./types";

/** Cloud asset sync orchestration — stub sync state, no real cloud I/O. */
export class CloudAssetSync {
  private state: CloudSyncState = {
    status: "synced",
    lastSyncAt: new Date().toISOString(),
    pendingUploads: 0,
    pendingDownloads: 0,
  };

  getState() {
    return { ...this.state };
  }

  async syncAssets(assets: VisionaryAsset[]): Promise<CloudSyncState> {
    const pending = assets.filter((a) => !a.cloudSynced).length;
    this.state = {
      status: "syncing",
      lastSyncAt: this.state.lastSyncAt,
      pendingUploads: pending,
      pendingDownloads: 0,
    };

    await new Promise((r) => setTimeout(r, 1200));

    this.state = {
      status: "synced",
      lastSyncAt: new Date().toISOString(),
      pendingUploads: 0,
      pendingDownloads: 0,
    };
    return this.getState();
  }

  markPendingUpload(count: number) {
    this.state = {
      ...this.state,
      status: count > 0 ? "syncing" : this.state.status,
      pendingUploads: count,
    };
  }
}

export const cloudAssetSync = new CloudAssetSync();
