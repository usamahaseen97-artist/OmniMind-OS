import { getBackendUrl } from "./backend-url";
import { normalizeBackendResourceUrl } from "./api-config";
import type { MusicTrack } from "./entertainment-catalog";
import { filterMusicCatalog, MUSIC_PLAYLISTS } from "./entertainment-catalog";

export type MusicSearchResult = {
  tracks: MusicTrack[];
  playlists: string[];
  categories: string[];
  source: "api" | "local";
  total?: number;
  offset?: number;
  hasMore?: boolean;
};

type ApiTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  playlist: string;
  category?: string;
  year?: number;
  era?: string;
  tags: string[];
  thumbnailUrl?: string;
  audioUrl: string;
  dynamic?: boolean;
  source?: string;
};

export function apiTrackToMusicTrack(t: ApiTrack): MusicTrack {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration: t.duration,
    durationSec: t.durationSec,
    playlist: t.playlist,
    category: t.category,
    thumbnailUrl: t.thumbnailUrl,
    tags: [...t.tags, t.era ?? "latest"],
    audioUrl: normalizeBackendResourceUrl(t.audioUrl),
    source: t.source,
  };
}

async function fetchJson<T>(
  path: string,
  signal?: AbortSignal,
  options?: { timeoutMs?: number },
): Promise<T | null> {
  try {
    const base = getBackendUrl();
    let effectiveSignal = signal;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutMs = options?.timeoutMs ?? 0;
    if (timeoutMs > 0) {
      const ctrl = new AbortController();
      timeoutId = setTimeout(() => ctrl.abort(), timeoutMs);
      if (signal) {
        signal.addEventListener("abort", () => ctrl.abort(), { once: true });
      }
      effectiveSignal = ctrl.signal;
    }
    const res = await fetch(`${base}${path}`, { signal: effectiveSignal, cache: "no-store" });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Fast trending row — cached Audius (dashboard home). */
export async function fetchMusicTrending(
  limit = 40,
  signal?: AbortSignal,
): Promise<MusicTrack[]> {
  const data = await fetchJson<{ tracks?: ApiTrack[] }>(
    `/api/v1/music/trending?limit=${limit}`,
    signal,
  );
  if (data?.tracks?.length) return data.tracks.map(apiTrackToMusicTrack);
  return filterMusicCatalog("", undefined).slice(0, limit);
}

export async function fetchMusicCatalog(
  query = "",
  playlist?: string,
  signal?: AbortSignal,
  options?: { offset?: number; limit?: number },
): Promise<MusicSearchResult> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (playlist && playlist !== "all") params.set("playlist", playlist);
  params.set("limit", String(options?.limit ?? 80));
  if (options?.offset) params.set("offset", String(options.offset));

  const data = await fetchJson<{
    tracks?: ApiTrack[];
    playlists?: string[];
    categories?: string[];
    total?: number;
    has_more?: boolean;
    offset?: number;
  }>(`/api/v1/music/catalog?${params.toString()}`, signal);

  if (data?.tracks) {
    return {
      tracks: data.tracks.map(apiTrackToMusicTrack),
      playlists: data.playlists?.length ? data.playlists : [...MUSIC_PLAYLISTS],
      categories: data.categories ?? ["Trending", "Latest", "Classics", "Pop"],
      source: "api",
      total: data.total,
      offset: data.offset,
      hasMore: data.has_more,
    };
  }

  const local = filterMusicCatalog(
    query,
    playlist && playlist !== "all" ? playlist : undefined,
  );
  return {
    tracks: local,
    playlists: [...MUSIC_PLAYLISTS],
    categories: ["Latest", "Classics", "Coke Studio", "Pop"],
    source: "local",
  };
}

/** Instant search — Audius live results only. */
export async function searchMusic(query: string, signal?: AbortSignal): Promise<MusicTrack[]> {
  const q = encodeURIComponent(query.trim());
  const data = await fetchJson<{ tracks?: ApiTrack[] }>(
    `/api/v1/music/search?q=${q}&limit=80`,
    signal,
    { timeoutMs: 90_000 },
  );
  if (data?.tracks?.length) return data.tracks.map(apiTrackToMusicTrack);
  return filterMusicCatalog(query);
}

export type MusicSuggestion = {
  type: "suggestion" | "track";
  label: string;
  sub?: string;
  search_query?: string;
  source?: string;
  track?: ApiTrack;
};

export async function fetchMusicSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<MusicSuggestion[]> {
  const q = encodeURIComponent(query.trim());
  const data = await fetchJson<{ suggestions?: MusicSuggestion[] }>(
    `/api/v1/music/suggest?q=${q}&limit=12`,
    signal,
  );
  return data?.suggestions ?? [];
}

export async function fetchMusicPredictQueries(
  partial: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const q = encodeURIComponent(partial.trim());
  const data = await fetchJson<{ queries?: string[] }>(
    `/api/v1/music/predict?q=${q}`,
    signal,
  );
  return data?.queries ?? [];
}

export async function identifyMusicSnippet(
  snippet: string,
  userId?: string,
): Promise<{
  success: boolean;
  title?: string;
  artist?: string;
  search_query?: string;
  track?: ApiTrack;
  error?: string;
  ai_guess?: boolean;
}> {
  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/v1/music/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snippet, user_id: userId ?? "" }),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, error: res.statusText };
    return (await res.json()) as {
      success: boolean;
      title?: string;
      artist?: string;
      search_query?: string;
      track?: ApiTrack;
      error?: string;
      ai_guess?: boolean;
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Identify failed" };
  }
}

export async function fetchMusicRecommendations(
  playHistory: { title: string; artist: string; tags?: string[]; playlist?: string; category?: string }[],
  userId = "",
  signal?: AbortSignal,
): Promise<MusicTrack[]> {
  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/v1/music/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ play_history: playHistory, user_id: userId }),
      signal,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { tracks?: ApiTrack[] };
    return data.tracks?.map(apiTrackToMusicTrack) ?? [];
  } catch {
    return [];
  }
}

export async function seedMusicCatalog(replace = true): Promise<boolean> {
  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/v1/music/seed?replace=${replace}`, {
      method: "POST",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
