import type { AssetKind, OmniAsset } from "./types";
import { ASSET_SEED } from "./constants";

/** Universal asset manager — all media types, searchable metadata. */
export class OmniAssetManager {
  assets: OmniAsset[] = ASSET_SEED.map((a) => ({
    ...a,
    collectionIds: [],
    metadata: {},
    version: 1,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    previewUrl: null,
  }));

  list(filter?: { kind?: AssetKind; projectId?: string; toolSlug?: string }) {
    return this.assets.filter((a) => {
      if (filter?.kind && a.kind !== filter.kind) return false;
      if (filter?.projectId && a.projectId !== filter.projectId) return false;
      if (filter?.toolSlug && a.toolSlug !== filter.toolSlug) return false;
      return true;
    });
  }

  get(id: string) {
    return this.assets.find((a) => a.id === id) ?? null;
  }

  register(asset: Omit<OmniAsset, "id" | "version" | "createdAt" | "modifiedAt">) {
    const entry: OmniAsset = {
      ...asset,
      id: `asset-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    this.assets.unshift(entry);
    return entry;
  }

  update(id: string, patch: Partial<OmniAsset>) {
    const a = this.get(id);
    if (!a) return null;
    Object.assign(a, patch, { version: a.version + 1, modifiedAt: new Date().toISOString() });
    return a;
  }

  byKind(kind: AssetKind) {
    return this.list({ kind });
  }
}

export const omniAssetManager = new OmniAssetManager();
