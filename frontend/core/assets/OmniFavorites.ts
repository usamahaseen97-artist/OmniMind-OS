import { omniAssetManager } from "./OmniAssetManager";

/** Favorites across assets and projects. */
export class OmniFavorites {
  toggleAsset(assetId: string) {
    const a = omniAssetManager.get(assetId);
    if (a) a.favorite = !a.favorite;
    return a;
  }

  listAssets() {
    return omniAssetManager.assets.filter((a) => a.favorite);
  }

  pinAsset(assetId: string) {
    const a = omniAssetManager.get(assetId);
    if (a) a.pinned = !a.pinned;
    return a;
  }

  pinnedAssets() {
    return omniAssetManager.assets.filter((a) => a.pinned);
  }
}

export const omniFavorites = new OmniFavorites();
