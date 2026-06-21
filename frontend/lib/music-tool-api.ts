import { resolveBackendUrl } from "./backend-url";

export type SpotifyYoutubeTrack = {
  success: boolean;
  song_name: string;
  title: string;
  artist: string;
  album: string;
  album_image_url: string;
  audio_stream_url: string;
  duration_sec?: number;
  spotify_id?: string;
  spotify_url?: string;
  youtube_id?: string;
  youtube_title?: string;
  youtube_url?: string;
  sources?: { metadata: string; audio: string };
};

/** Chatbot Music Tool — GET /api/music/search?song_name=... */
export async function searchSongSpotifyYoutube(
  songName: string,
  signal?: AbortSignal,
): Promise<SpotifyYoutubeTrack> {
  const base = await resolveBackendUrl(signal);
  const params = new URLSearchParams({ song_name: songName.trim() });
  const res = await fetch(`${base}/api/music/search?${params.toString()}`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: unknown };
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : JSON.stringify(err.detail ?? res.statusText),
    );
  }
  return (await res.json()) as SpotifyYoutubeTrack;
}
