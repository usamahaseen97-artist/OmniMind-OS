import { getBackendUrl } from "./backend-url";

export type LiveFeed = {
  id: string;
  title: string;
  category: string;
  genre: string;
  description: string;
  master_url: string;
  bitrates: string[];
  is_live: boolean;
  poster: string;
};

export async function fetchTvLiveGrid(
  userId: string,
  signal?: AbortSignal,
  category?: string,
): Promise<LiveFeed[]> {
  try {
    const base = getBackendUrl();
    const params = new URLSearchParams({ user_id: userId });
    if (category) params.set("category", category);
    const res = await fetch(`${base}/api/v1/tv/live-grid?${params}`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { feeds?: LiveFeed[] };
    return data.feeds ?? [];
  } catch {
    return [];
  }
}
