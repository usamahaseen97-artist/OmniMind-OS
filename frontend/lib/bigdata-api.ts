import { getBackendUrl } from "./backend-url";

export type MoodTheme = {
  user_id: string;
  theme_id: string;
  theme_label: string;
  dominant_genre: string;
  active_domain: string;
  css_variables: Record<string, string>;
  tailwind_class: string;
  updated_at: number;
};

export type BufferHealing = {
  user_id: string;
  healing_required: boolean;
  recommended_variant: string;
  target_bitrate_kbps: number;
  avg_packet_loss_ratio?: number;
  avg_network_bitrate_kbps?: number;
  force_adaptive_switch: boolean;
  hls_variants: { label: string; bitrate_kbps: number }[];
  reason: string;
};

export async function fetchCurrentMood(
  userId: string,
  signal?: AbortSignal,
): Promise<MoodTheme | null> {
  try {
    const base = getBackendUrl();
    const res = await fetch(
      `${base}/api/v1/user/current-mood?user_id=${encodeURIComponent(userId)}`,
      { signal, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { mood?: MoodTheme };
    return data.mood ?? null;
  } catch {
    return null;
  }
}

export async function fetchBufferHealing(
  userId: string,
  signal?: AbortSignal,
): Promise<BufferHealing | null> {
  try {
    const base = getBackendUrl();
    const res = await fetch(
      `${base}/api/v1/user/buffer-healing?user_id=${encodeURIComponent(userId)}`,
      { signal, cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as BufferHealing;
  } catch {
    return null;
  }
}

export async function postTelemetry(
  payload: {
    domain: "movie" | "music" | "tv";
    userId: string;
    contentId: string;
    genre: string;
    playbackStatus: "play" | "pause" | "skip" | "stop" | "click" | "view" | "buffer";
    networkBitrate?: number;
    packetLossRatio?: number;
    title?: string;
  },
  signal?: AbortSignal,
): Promise<void> {
  try {
    const base = getBackendUrl();
    await fetch(`${base}/api/v1/user/telemetry/async`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: payload.domain,
        user_id: payload.userId,
        content_id: payload.contentId,
        genre: payload.genre,
        playback_status: payload.playbackStatus,
        network_bitrate: payload.networkBitrate ?? 0,
        packet_loss_ratio: payload.packetLossRatio ?? 0,
        title: payload.title ?? "",
      }),
      signal,
    });
  } catch {
    /* best-effort */
  }
}

/** Rough network estimate for self-healing pipeline (browser APIs limited). */
export function estimateNetworkTelemetry(): {
  networkBitrate: number;
  packetLossRatio: number;
} {
  const conn = (navigator as Navigator & { connection?: { downlink?: number; effectiveType?: string } })
    .connection;
  const downlinkMbps = conn?.downlink ?? 5;
  const effective = conn?.effectiveType ?? "4g";
  let loss = 0.005;
  if (effective === "3g") loss = 0.02;
  if (effective === "2g" || effective === "slow-2g") loss = 0.06;
  return {
    networkBitrate: Math.round(downlinkMbps * 1000),
    packetLossRatio: loss,
  };
}
