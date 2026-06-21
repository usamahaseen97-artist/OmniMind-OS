/** Resolve structured image URLs for chat messages (never use raw prompt text as src). */

import type { ChatMessage } from "./chat-api";
import type { GeneratedImageAsset } from "./execution-preview";
import { buildPollinationsUrl, isLikelyImageUrl, proxiedImageUrl } from "./live-render-pipeline";

const MD_IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+(?:\([^)]*\)[^)\s]*)*)\)/g;

function pickUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function assetFromUrl(raw: string, alt = "Generated image"): GeneratedImageAsset | null {
  const url = pickUrl(raw);
  if (!url) return null;
  const resolved = isLikelyImageUrl(url) ? proxiedImageUrl(url) : buildPollinationsUrl(url);
  return { url: resolved, alt };
}

function normalizeAsset(asset: GeneratedImageAsset): GeneratedImageAsset | null {
  const raw = pickUrl(asset.url);
  if (!raw) return null;
  const resolved = isLikelyImageUrl(raw) ? proxiedImageUrl(raw) : buildPollinationsUrl(raw);
  return { ...asset, url: resolved };
}

export function parseMarkdownImageUrls(content: string): string[] {
  const urls: string[] = [];
  if (!content) return urls;
  for (const match of content.matchAll(MD_IMAGE_RE)) {
    const href = pickUrl(match[1]);
    if (href) urls.push(href);
  }
  return urls;
}

/** Collect gallery assets from message payload fields (imageUrl, file_url, images[], markdown). */
export function resolveChatMessageImages(message: ChatMessage): GeneratedImageAsset[] {
  const structured = [
    message.imageUrl,
    message.image_url,
    message.file_url,
    message.images?.[0]?.url,
  ]
    .map(pickUrl)
    .filter(Boolean) as string[];

  const fromImages =
    message.images
      ?.map((img) => normalizeAsset(img))
      .filter((img): img is GeneratedImageAsset => Boolean(img)) ?? [];

  if (fromImages.length) return fromImages;

  for (const raw of structured) {
    const asset = assetFromUrl(raw);
    if (asset) return [asset];
  }

  for (const raw of parseMarkdownImageUrls(message.content)) {
    const asset = assetFromUrl(raw);
    if (asset) return [asset];
  }

  return [];
}

export function primaryChatImageUrl(message: ChatMessage): string | undefined {
  return resolveChatMessageImages(message)[0]?.url;
}
