import { getBackendUrl } from "./backend-url";

export type ProviderChainEntry = {
  id: string;
  label: string;
  active: boolean;
};

export type ActiveProvider = {
  tool: string;
  provider_id: string;
  provider_label: string;
  configured: boolean;
  using_free_tier: boolean;
  keys: Record<string, boolean>;
  chain: ProviderChainEntry[];
};

export type GatewayProvidersResponse = {
  secure: boolean;
  providers: ActiveProvider[];
  setup_hint?: string;
};

export async function fetchGatewayProviders(
  signal?: AbortSignal,
): Promise<GatewayProvidersResponse | null> {
  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/v1/gateway/providers`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as GatewayProvidersResponse;
  } catch {
    return null;
  }
}

/** Human label for header / ops — e.g. "Image: Replicate Flux" */
export function summarizeProviders(data: GatewayProvidersResponse | null): string {
  if (!data?.providers?.length) return "Live Engine Secure";
  const image = data.providers.find((p) => p.tool === "create_image");
  const video = data.providers.find((p) => p.tool === "video");
  const parts: string[] = [];
  if (image) parts.push(`Img: ${image.provider_label}`);
  if (video) parts.push(`Vid: ${video.provider_label}`);
  return parts.length ? parts.join(" · ") : "Live Engine Secure";
}
