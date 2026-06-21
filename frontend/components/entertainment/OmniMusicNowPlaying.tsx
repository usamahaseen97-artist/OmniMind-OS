"use client";

import { Check, ChevronRight, Mic2, Share2, X } from "lucide-react";
import type { MusicTrack } from "../../lib/entertainment-catalog";
import { cn } from "../../lib/utils";

type Props = {
  track: MusicTrack | null;
  playlistLabel?: string;
  isPlaying?: boolean;
  onClose?: () => void;
  className?: string;
};

export function OmniMusicNowPlaying({
  track,
  playlistLabel = "Now playing",
  isPlaying = false,
  onClose,
  className,
}: Props) {
  if (!track) {
    return (
      <aside
        className={cn(
          "flex w-[min(280px,90vw)] shrink-0 flex-col items-center justify-center border-l border-white/10 bg-[#121212] p-6 text-center",
          className,
        )}
      >
        <p className="text-sm text-zinc-500">Select a song to see details</p>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex w-[min(300px,90vw)] max-w-[300px] shrink-0 flex-col overflow-hidden border-l border-white/10 bg-[#121212] xl:w-[min(300px,28vw)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <p className="truncate text-xs font-bold uppercase tracking-wide text-zinc-400">
          {playlistLabel}
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="history-scroll-hover flex-1 overflow-y-auto px-4 pb-6">
        <div className="relative mx-auto mt-4 aspect-square w-full max-w-[280px] overflow-hidden rounded-md shadow-2xl">
          {track.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1ed760]/30 to-zinc-900" />
          )}
          {isPlaying ? (
            <span className="absolute bottom-2 left-2 flex items-end gap-0.5 rounded bg-black/50 px-2 py-1">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-0.5 animate-pulse rounded-full bg-[#1ed760]"
                  style={{
                    height: `${8 + i * 3}px`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </span>
          ) : null}
        </div>

        <h2 className="mt-5 text-2xl font-bold leading-tight text-white">{track.title}</h2>
        <p className="mt-1 text-sm text-zinc-400 hover:text-white hover:underline">
          {track.artist}
        </p>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            className="text-zinc-400 transition hover:text-white"
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#1ed760]">
            <Check className="h-4 w-4" />
            In library
          </span>
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Credits</h3>
            <button
              type="button"
              aria-label="Show more credits"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md bg-white/5 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{track.artist}</p>
              <p className="text-xs text-zinc-500">Main artist</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full border border-zinc-600 px-4 py-1 text-xs font-bold text-white transition hover:border-white hover:scale-105"
            >
              Follow
            </button>
          </div>
          {track.album ? (
            <p className="mt-3 text-xs text-zinc-500">
              Album · <span className="text-zinc-300">{track.album}</span>
            </p>
          ) : null}
          {track.playlist ? (
            <p className="mt-1 text-xs text-zinc-500">
              Playlist · <span className="text-zinc-300">{track.playlist}</span>
            </p>
          ) : null}
        </section>

        <section className="mt-6 rounded-lg bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-[#1ed760]">
            <Mic2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">OmniMind tone</span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-400">
            Use Tone in the library sidebar to style vocals — Pakistani, Bollywood & global
            catalogs via Audius.
          </p>
        </section>
      </div>
    </aside>
  );
}
