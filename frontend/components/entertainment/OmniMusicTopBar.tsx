"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { OmniMusicSearchPanel } from "./OmniMusicSearchPanel";
import type { MusicTrack } from "../../lib/entertainment-catalog";

type Props = {
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSearchQuery: (q: string) => void;
  onSelectTrack: (t: MusicTrack) => void;
  userId?: string;
  onHome?: () => void;
};

export function OmniMusicTopBar({
  searchValue,
  onSearchChange,
  onSearchQuery,
  onSelectTrack,
  userId,
  onHome,
}: Props) {
  return (
    <header className="relative z-30 flex h-14 max-h-14 w-full min-w-0 max-w-full shrink-0 items-center gap-2 overflow-hidden bg-[#121212]/95 px-3 py-2 backdrop-blur-md md:gap-3 md:px-4">
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-zinc-400 transition hover:text-white disabled:opacity-30"
          aria-label="Back"
          disabled
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-zinc-400 transition hover:text-white disabled:opacity-30"
          aria-label="Forward"
          disabled
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:scale-105 hover:bg-zinc-800"
          aria-label="Home"
        >
          <Home className="h-4 w-4 fill-current" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <OmniMusicSearchPanel
          variant="topbar"
          value={searchValue}
          onChange={onSearchChange}
          onSearchQuery={onSearchQuery}
          onSelectTrack={onSelectTrack}
          userId={userId}
        />
      </div>
    </header>
  );
}
