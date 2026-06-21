import type { SpotifyYoutubeTrack } from "./music-tool-api";

/** Props for MusicPlayer — maps from /api/music/search or chatbot `track` payload. */
export type MusicPlayerTrack = {
  title: string;
  artist: string;
  album?: string;
  albumImageUrl: string;
  audioUrl: string;
  durationSec?: number;
};

export function musicPlayerTrackFromApi(
  raw: SpotifyYoutubeTrack | Record<string, unknown>,
): MusicPlayerTrack | null {
  const title = String(raw.title ?? "").trim();
  const artist = String(raw.artist ?? "").trim();
  const audioUrl = String(
    (raw as SpotifyYoutubeTrack).audio_stream_url ??
      (raw as { audioUrl?: string }).audioUrl ??
      "",
  ).trim();
  if (!title || !audioUrl) return null;

  return {
    title,
    artist: artist || "Unknown Artist",
    album: String((raw as SpotifyYoutubeTrack).album ?? "").trim() || undefined,
    albumImageUrl: String(
      (raw as SpotifyYoutubeTrack).album_image_url ??
        (raw as { albumImageUrl?: string }).albumImageUrl ??
        "",
    ).trim(),
    audioUrl,
    durationSec:
      typeof (raw as SpotifyYoutubeTrack).duration_sec === "number"
        ? (raw as SpotifyYoutubeTrack).duration_sec
        : undefined,
  };
}
