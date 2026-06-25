import type { AssetKind } from "./types";
import { omniAssetManager } from "./OmniAssetManager";

/** Media library — browsable by kind. */
export class OmniMediaLibrary {
  browse(kind?: AssetKind) {
    return kind ? omniAssetManager.byKind(kind) : omniAssetManager.assets;
  }

  categories(): { kind: AssetKind; count: number }[] {
    const counts = new Map<AssetKind, number>();
    omniAssetManager.assets.forEach((a) => counts.set(a.kind, (counts.get(a.kind) ?? 0) + 1));
    return [...counts.entries()].map(([kind, count]) => ({ kind, count }));
  }
}

export const omniMediaLibrary = new OmniMediaLibrary();
