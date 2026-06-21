import { getBackendUrl } from "./backend-url";
import type { MarketingCampaignPayload } from "./marketing-campaign-store";

export type GenerateCampaignRequest = {
  prompt: string;
  assets?: string[];
  brand_name?: string;
};

export async function generateMarketingCampaign(
  body: GenerateCampaignRequest,
): Promise<MarketingCampaignPayload> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/marketing/generate-campaign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: body.prompt,
      assets: body.assets ?? [],
      brand_name: body.brand_name ?? "Delhi Mutton Co.",
    }),
  });
  if (!res.ok) {
    throw new Error(`Campaign generate failed (${res.status})`);
  }
  return res.json() as Promise<MarketingCampaignPayload>;
}

import { buildPollinationsUrl } from "./live-render-pipeline";
import { DEMO_VIDEO_MP4 } from "./demo-media";

const GENERATED_IMAGE_FALLBACK =
  "Ultra-realistic Dehli Mutton Pack product advertisement neon cinematic lighting";

/** Resolve asset URL — backend paths map to public or absolute URLs */
export function resolveMarketingAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.includes("/assets/generated/")) {
    return buildPollinationsUrl(GENERATED_IMAGE_FALLBACK);
  }
  if (url.includes(".mp4") && !url.startsWith("/")) return url;
  if (url.endsWith(".mp4") && url.startsWith("/")) {
    return DEMO_VIDEO_MP4;
  }
  if (typeof window !== "undefined" && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
}
