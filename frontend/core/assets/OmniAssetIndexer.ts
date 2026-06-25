import type { SearchIndexEntry } from "./types";
import { omniAssetManager } from "./OmniAssetManager";
import { omniProjectEngine } from "./OmniProjectEngine";

/** Asset metadata indexer. */
export class OmniAssetIndexer {
  index: SearchIndexEntry[] = [];

  rebuild() {
    this.index = [];
    omniProjectEngine.projects.forEach((p) => {
      this.index.push({
        id: `idx-proj-${p.id}`,
        targetType: "project",
        targetId: p.id,
        title: p.name,
        body: p.description,
        tags: Object.values(p.metadata),
        toolSlug: p.toolSlugs[0] ?? null,
        score: 1,
      });
    });
    omniAssetManager.assets.forEach((a) => {
      this.index.push({
        id: `idx-asset-${a.id}`,
        targetType: "asset",
        targetId: a.id,
        title: a.name,
        body: `${a.kind} ${a.mimeType}`,
        tags: a.tags,
        toolSlug: a.toolSlug,
        score: 1,
      });
      Object.entries(a.metadata).forEach(([k, v]) => {
        this.index.push({
          id: `idx-meta-${a.id}-${k}`,
          targetType: "metadata",
          targetId: a.id,
          title: k,
          body: v,
          tags: a.tags,
          toolSlug: a.toolSlug,
          score: 0.8,
        });
      });
    });
    return this.index;
  }

  getIndex() {
    if (this.index.length === 0) this.rebuild();
    return this.index;
  }
}

export const omniAssetIndexer = new OmniAssetIndexer();
