import { resolveBackendUrl } from "./backend-url";

export type LiveStreamMode = "proxy" | "transcode";

export type LiveChannel = {
  id: string;
  name: string;
  category: string;
  mode: LiveStreamMode;
  isLive: boolean;
  poster: string;
  playlistUrl: string;
  statsUrl: string;
};

export type LiveStats = {
  channelId: string;
  viewers: number;
  isLive: boolean;
  mode: string;
};

export type LiveChannelsResult = {
  channels: LiveChannel[];
  ffmpeg: boolean;
};

export async function fetchLiveChannels(signal?: AbortSignal): Promise<LiveChannelsResult> {
  const base = await resolveBackendUrl(signal);
  const res = await fetch(`${base}/api/live/channels`, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Live channels request failed (${res.status})`);
  const data = (await res.json()) as { channels?: LiveChannel[]; ffmpeg?: boolean };
  return { channels: data.channels ?? [], ffmpeg: Boolean(data.ffmpeg) };
}

export async function fetchLiveStats(
  statsUrl: string,
  token: string,
  signal?: AbortSignal,
): Promise<LiveStats> {
  const sep = statsUrl.includes("?") ? "&" : "?";
  const res = await fetch(`${statsUrl}${sep}token=${encodeURIComponent(token)}`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Live stats request failed (${res.status})`);
  return (await res.json()) as LiveStats;
}

/** Stable per-tab viewer token so the backend can count concurrent viewers. */
export function makeViewerToken(): string {
  return `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
