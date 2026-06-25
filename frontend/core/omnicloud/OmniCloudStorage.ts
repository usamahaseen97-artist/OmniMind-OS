import { omniAssets } from "../assets/OmniAssets";
import { omniCloudApiClient } from "./OmniCloudApiClient";
import type { StorageBucket } from "./types";

/** Storage Engine — cloud files, assets, object storage, CDN, encrypted backup. */
export class OmniCloudStorage {
  buckets: StorageBucket[] = [];

  async load() {
    const remote = await omniCloudApiClient.getStorage();
    if (remote?.ok) {
      this.buckets = remote.buckets;
      return this.buckets;
    }
    const assetBytes = omniAssets.assets.assets.reduce((sum, a) => sum + (a.sizeBytes ?? 0), 0);
    this.buckets = [
      { id: "files", kind: "files", usedBytes: assetBytes, quotaBytes: 50 * 1024 ** 3, cdnEnabled: true },
      { id: "assets", kind: "assets", usedBytes: assetBytes, quotaBytes: 100 * 1024 ** 3, cdnEnabled: true },
      { id: "media", kind: "media", usedBytes: Math.floor(assetBytes * 0.6), quotaBytes: 200 * 1024 ** 3, cdnEnabled: true },
      { id: "backup", kind: "backup", usedBytes: Math.floor(assetBytes * 0.3), quotaBytes: 50 * 1024 ** 3, cdnEnabled: false },
      { id: "encrypted", kind: "encrypted", usedBytes: Math.floor(assetBytes * 0.2), quotaBytes: 50 * 1024 ** 3, cdnEnabled: false },
    ];
    return this.buckets;
  }

  totalUsed() {
    return this.buckets.reduce((sum, b) => sum + b.usedBytes, 0);
  }

  totalQuota() {
    return this.buckets.reduce((sum, b) => sum + b.quotaBytes, 0);
  }

  snapshot() {
    return { buckets: this.buckets, usedBytes: this.totalUsed(), quotaBytes: this.totalQuota() };
  }
}

export const omniCloudStorage = new OmniCloudStorage();
