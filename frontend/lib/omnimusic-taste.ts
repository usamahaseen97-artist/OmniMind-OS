import type { MusicTrack } from "./entertainment-catalog";

const KEY = "omnimind_music_plays";

export type PlayHistoryEntry = {
  id: string;
  title: string;
  artist: string;
  playlist?: string;
  category?: string;
  tags: string[];
  playedAt: number;
};

export function recordMusicPlay(track: MusicTrack): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: PlayHistoryEntry[] = raw ? (JSON.parse(raw) as PlayHistoryEntry[]) : [];
    const entry: PlayHistoryEntry = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      playlist: track.playlist,
      category: track.category,
      tags: track.tags,
      playedAt: Date.now(),
    };
    const next = [entry, ...list.filter((x) => x.id !== track.id)].slice(0, 40);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getMusicPlayHistory(): PlayHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlayHistoryEntry[]) : [];
  } catch {
    return [];
  }
}
