import type { ContentFormat, ContentItem } from "./types";

export class ContentFactoryEngine {
  queue(formats: ContentFormat[], title: string, prompt: string, campaignId: string | null): ContentItem {
    return {
      id: `content-${Date.now()}`,
      format: formats[0] ?? "image",
      title,
      prompt,
      status: "generating",
      assetId: null,
      campaignId,
    };
  }

  markReady(item: ContentItem, assetId: string): ContentItem {
    return { ...item, status: "ready", assetId };
  }
}

export const contentFactoryEngine = new ContentFactoryEngine();
