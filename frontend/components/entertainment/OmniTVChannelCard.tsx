"use client";

import { Heart } from "lucide-react";
import type { LegalLiveChannel } from "../../lib/live-tv-api";
import { cn } from "../../lib/utils";

export function OmniTVChannelCard({
  channel,
  selected,
  favorite,
  onSelect,
  onToggleFavorite,
}: {
  channel: LegalLiveChannel;
  selected: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-40 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 transition duration-200 hover:-translate-y-1",
        channel.posterGradient,
        "bg-gradient-to-br",
        selected
          ? "border-[#00FF87]/70 shadow-[0_0_30px_rgba(0,255,135,0.18)]"
          : "border-zinc-800 hover:border-zinc-500",
      )}
      onClick={onSelect}
    >
      {channel.thumbnail ? (
        <img
          src={channel.thumbnail}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-200 group-hover:scale-105 group-hover:opacity-55"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/45 transition group-hover:bg-black/25" />
      <div className="relative flex items-start justify-between">
        <span className="rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold uppercase text-zinc-200">
          {channel.sourceType === "youtube"
            ? "YouTube"
            : channel.sourceType === "hls"
              ? "HLS"
              : "Official"}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            "rounded-full bg-black/45 p-1.5 transition hover:bg-black/70",
            favorite ? "text-red-300" : "text-zinc-400",
          )}
          aria-label={favorite ? "Remove favorite" : "Add favorite"}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        </button>
      </div>
      <div className="relative">
        <p className="text-xl font-black text-white">{channel.name}</p>
        <p className="mt-1 text-xs text-zinc-300">
          {channel.country} · {channel.language}
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-zinc-400">
          {channel.description}
        </p>
      </div>
    </article>
  );
}
