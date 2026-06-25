import type { AssetCollection } from "./types";

/** Asset collections — manual and smart. */
export class OmniCollections {
  collections: AssetCollection[] = [
    { id: "col-brand", name: "Brand Assets", description: "Logos and brand kit", assetIds: ["asset-1"], smart: false },
    { id: "col-launch", name: "Launch Media", description: "Campaign media", assetIds: ["asset-1", "asset-2"], smart: false },
  ];

  list() {
    return [...this.collections];
  }

  get(id: string) {
    return this.collections.find((c) => c.id === id) ?? null;
  }

  create(name: string, description: string) {
    const col: AssetCollection = {
      id: `col-${Date.now()}`,
      name,
      description,
      assetIds: [],
      smart: false,
    };
    this.collections.push(col);
    return col;
  }

  addAsset(collectionId: string, assetId: string) {
    const col = this.get(collectionId);
    if (col && !col.assetIds.includes(assetId)) col.assetIds.push(assetId);
    return col;
  }
}

export const omniCollections = new OmniCollections();
