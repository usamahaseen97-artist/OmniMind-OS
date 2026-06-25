import type { MusicAsset, MusicCollection, MusicTemplate } from "../ai-types";
import { MUSIC_TEMPLATES } from "./constants";

export class AssetLibraryEngine {
  private assets: MusicAsset[] = [];
  private _collections: MusicCollection[] = [
    { id: "col-fav", name: "Favorites", assetIds: [] },
    { id: "col-beats", name: "Beats", assetIds: [] },
  ];

  list(kind?: MusicAsset["kind"]): MusicAsset[] {
    return kind ? this.assets.filter((a) => a.kind === kind) : [...this.assets];
  }

  add(asset: MusicAsset) {
    this.assets.unshift(asset);
  }

  toggleFavorite(id: string) {
    const a = this.assets.find((x) => x.id === id);
    if (a) a.favorite = !a.favorite;
  }

  templates(): MusicTemplate[] {
    return MUSIC_TEMPLATES;
  }

  listCollections() {
    return this._collections;
  }

  seedFromJob(jobId: string, name: string, genre: string, workflow: MusicAsset["workflow"]) {
    const asset: MusicAsset = {
      id: `asset-${jobId}`,
      kind: workflow?.includes("beat") ? "beat" : "song",
      name,
      genre,
      mood: "Generated",
      bpm: 120,
      key: "C",
      durationSec: 180,
      workflow,
      favorite: false,
      collectionIds: [],
      createdAt: new Date().toISOString(),
      metadata: { jobId },
    };
    this.add(asset);
    return asset;
  }
}

export const assetLibraryEngine = new AssetLibraryEngine();
