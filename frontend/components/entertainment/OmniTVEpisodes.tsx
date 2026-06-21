"use client";

import { ListVideo, Loader2, PlayCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ChannelEpisode } from "../../lib/live-tv-api";

function timeAgo(published: string): string {
  const ts = Date.parse(published);
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  const day = 86_400_000;
  if (diff < day) return "today";
  if (diff < 2 * day) return "yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} wk ago`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} mo ago`;
  return `${Math.floor(diff / (365 * day))} yr ago`;
}

export function OmniTVEpisodes({
  episodes,
  activeVideoId,
  loading,
  onSelect,
  title = "Episodes & recent uploads",
}: {
  episodes: ChannelEpisode[];
  activeVideoId?: string;
  loading?: boolean;
  onSelect: (videoId: string) => void;
  title?: string;
}) {
  if (!loading && episodes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <ListVideo className="h-4 w-4 text-[#00FF87]" />
        <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" /> : null}
        {!loading ? <span className="text-xs text-zinc-600">{episodes.length}</span> : null}
      </div>

      <div className="history-scroll-hover flex max-h-[230px] gap-3 overflow-x-auto overflow-y-hidden pb-2 lg:max-h-none lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
        {loading && episodes.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[92px] w-40 shrink-0 animate-pulse rounded-xl bg-zinc-900 lg:w-full"
              />
            ))
          : episodes.map((episode) => {
              const active = episode.videoId === activeVideoId;
              return (
                <button
                  key={episode.videoId}
                  type="button"
                  onClick={() => onSelect(episode.videoId)}
                  title={episode.title}
                  className={cn(
                    "group flex w-40 shrink-0 flex-col gap-1.5 rounded-xl border p-1.5 text-left transition lg:w-full lg:flex-row lg:items-start lg:gap-2",
                    active
                      ? "border-[#00FF87]/60 bg-[#00FF87]/10"
                      : "border-transparent hover:border-zinc-700 hover:bg-zinc-900",
                  )}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black lg:w-32 lg:shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                      <PlayCircle
                        className={cn(
                          "h-7 w-7 text-white opacity-0 transition group-hover:opacity-100",
                          active && "opacity-100 text-[#00FF87]",
                        )}
                      />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "line-clamp-2 text-xs font-semibold leading-snug",
                        active ? "text-[#00FF87]" : "text-zinc-200",
                      )}
                    >
                      {episode.title}
                    </p>
                    {episode.published ? (
                      <p className="mt-0.5 text-[10px] text-zinc-500">{timeAgo(episode.published)}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
      </div>
    </div>
  );
}
