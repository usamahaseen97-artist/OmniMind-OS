import type { AssetSearchFilter, SearchIndexEntry } from "./types";
import { omniAssetIndexer } from "./OmniAssetIndexer";

/** Indexed search — global, project, asset, metadata, AI hooks. */
export class OmniSearchIndex {
  search(query: string, filter?: AssetSearchFilter): SearchIndexEntry[] {
    const q = query.trim().toLowerCase();
    let results = omniAssetIndexer.getIndex();

    if (filter?.kind) {
      const assetIds = new Set(
        results.filter((r) => r.targetType === "asset").map((r) => r.targetId),
      );
      results = results.filter((r) => {
        if (r.targetType !== "asset") return true;
        return assetIds.has(r.targetId);
      });
    }
    if (filter?.toolSlug) results = results.filter((r) => r.toolSlug === filter.toolSlug);
    if (filter?.projectId) {
      results = results.filter(
        (r) => r.targetType === "project" && r.targetId === filter.projectId,
      );
    }
    if (filter?.tags?.length) {
      results = results.filter((r) => filter.tags!.some((t) => r.tags.includes(t)));
    }
    if (!q) return results.slice(0, 50);

    return results
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q)),
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }

  /** AI search hook — architecture stub */
  aiSearch(query: string) {
    return this.search(query).map((r) => ({ ...r, score: r.score * 1.1, aiEnhanced: true }));
  }
}

export const omniSearchIndex = new OmniSearchIndex();
