import type { VisionaryAsset } from "./types";

/** Unified asset registry — generated, imported, stock, brand. */
export class AssetManager {
  private assets: VisionaryAsset[] = [];

  list(filter?: { projectId?: string; kind?: VisionaryAsset["kind"] }) {
    let items = [...this.assets];
    if (filter?.projectId) items = items.filter((a) => a.projectId === filter.projectId);
    if (filter?.kind) items = items.filter((a) => a.kind === filter.kind);
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get(id: string) {
    return this.assets.find((a) => a.id === id);
  }

  register(asset: VisionaryAsset) {
    this.assets = [asset, ...this.assets.filter((a) => a.id !== asset.id)];
    return asset;
  }

  remove(id: string) {
    this.assets = this.assets.filter((a) => a.id !== id);
  }

  seed(assets: VisionaryAsset[]) {
    this.assets = assets;
  }

  fromGeneration(params: {
    id: string;
    projectId: string;
    name: string;
    kind: VisionaryAsset["kind"];
    workflow?: VisionaryAsset["workflow"];
  }): VisionaryAsset {
    return this.register({
      id: params.id,
      projectId: params.projectId,
      name: params.name,
      kind: params.kind,
      mimeType: params.kind === "video" ? "video/mp4" : "image/png",
      sizeBytes: 2_400_000,
      cloudSynced: false,
      source: "generated",
      createdAt: new Date().toISOString(),
      workflow: params.workflow,
    });
  }
}

export const assetManager = new AssetManager();
