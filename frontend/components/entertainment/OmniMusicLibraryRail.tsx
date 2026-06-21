"use client";

import { Heart, Library, Plus } from "lucide-react";
import type { MusicTrack } from "../../lib/entertainment-catalog";
import { cn } from "../../lib/utils";

type Props = {
  playlists: string[];
  activePlaylist: string | "all";
  onSelectPlaylist: (pl: string | "all") => void;
  recentTracks: MusicTrack[];
  onSelectTrack: (t: MusicTrack) => void;
  activeTrackId?: string;
};

export function OmniMusicLibraryRail({
  playlists,
  activePlaylist,
  onSelectPlaylist,
  recentTracks,
  onSelectTrack,
  activeTrackId,
}: Props) {
  const thumbs = recentTracks.slice(0, 8);

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-2 border-r border-white/10 bg-black py-3 md:flex lg:w-[80px]">
      <button
        type="button"
        title="Your Library"
        className="flex h-12 w-12 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
      >
        <Library className="h-6 w-6" />
      </button>
      <button
        type="button"
        title="Create playlist"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white hover:scale-105"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        title="Liked Songs"
        onClick={() => onSelectPlaylist("all")}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-[#450af5] to-[#8e8ee8] text-white shadow-lg transition hover:scale-105",
          activePlaylist === "all" && "ring-2 ring-white",
        )}
      >
        <Heart className="h-5 w-5 fill-white" />
      </button>
      <div className="mt-1 flex w-full flex-col items-center gap-2 overflow-y-auto px-2 history-scroll-hover">
        {playlists.slice(0, 6).map((pl) => {
          const thumb = thumbs.find((t) =>
            t.playlist.toLowerCase().includes(pl.toLowerCase().slice(0, 8)),
          );
          return (
            <button
              key={pl}
              type="button"
              title={pl}
              onClick={() => onSelectPlaylist(pl)}
              className={cn(
                "h-12 w-12 shrink-0 overflow-hidden rounded-md shadow-md transition hover:scale-105",
                activePlaylist === pl && "ring-2 ring-[#1ed760]",
              )}
            >
              {thumb?.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-[8px] font-bold text-zinc-500">
                  {pl.slice(0, 2)}
                </div>
              )}
            </button>
          );
        })}
        {thumbs.slice(0, 4).map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.title}
            onClick={() => onSelectTrack(t)}
            className={cn(
              "h-12 w-12 shrink-0 overflow-hidden rounded-md transition hover:scale-105",
              activeTrackId === t.id && "ring-2 ring-[#1ed760]",
            )}
          >
            {t.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-zinc-800" />
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
