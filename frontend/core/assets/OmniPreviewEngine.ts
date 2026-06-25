import type { AssetKind, PreviewResult } from "./types";
import { omniAssetManager } from "./OmniAssetManager";

/** Asset preview generation architecture. */
export class OmniPreviewEngine {
  preview(assetId: string): PreviewResult | null {
    const asset = omniAssetManager.get(assetId);
    if (!asset) return null;
    return {
      assetId,
      kind: asset.kind,
      thumbnailUrl: asset.previewUrl ?? `/api/v1/omnicore/assets/preview/${assetId}`,
      metadata: {
        name: asset.name,
        size: String(asset.sizeBytes),
        mime: asset.mimeType,
      },
    };
  }

  canPreview(kind: AssetKind) {
    return ["image", "video", "audio", "document", "design"].includes(kind);
  }
}

export const omniPreviewEngine = new OmniPreviewEngine();
