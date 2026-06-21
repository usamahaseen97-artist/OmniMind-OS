import { resolveBackendUrl } from "./backend-url";

export type PlatformReadiness = {
  ok?: boolean;
  api_online?: boolean;
  publish_ready?: boolean;
  version?: string;
  mongodb?: { connected?: boolean; mode?: string; database?: string };
  llm?: {
    provider?: string;
    lm_studio?: { connected?: boolean };
    gemini_configured?: boolean;
  };
  streaming?: {
    lazy_load?: boolean;
    kafka?: { connected?: boolean };
    spark?: { connected?: boolean };
  };
  cors_origins_configured?: boolean;
  hints?: string[];
  engine?: { secure?: boolean; label?: string };
  integrations?: {
    tool: string;
    provider?: string;
    provider_label?: string;
    configured?: boolean;
    keys?: Record<string, boolean>;
  }[];
  providers?: {
    tool: string;
    provider_id: string;
    provider_label: string;
    configured: boolean;
    using_free_tier: boolean;
  }[];
};

export async function fetchPlatformReadiness(
  signal?: AbortSignal,
): Promise<PlatformReadiness | null> {
  try {
    const base = await resolveBackendUrl(signal);
    const r = await fetch(`${base}/api/v1/platform/readiness`, {
      signal,
      cache: "no-store",
    });
    if (!r.ok) return null;
    return (await r.json()) as PlatformReadiness;
  } catch {
    return null;
  }
}
