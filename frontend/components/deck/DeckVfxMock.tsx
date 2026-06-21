"use client";

import { Film, Music2, Volume2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { DeckShell } from "./DeckShell";

const FRAMES = Array.from({ length: 8 }, (_, i) => i + 1);
const AUDIO_LANES = ["Dialogue", "SFX", "Score"];

export function DeckVfxMock() {
  return (
    <DeckShell title="VFX Timeline" subtitle="Frame buffers · audio layering">
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-emerald-500/25 bg-black shadow-[0_0_24px_rgba(16,185,129,0.12)]">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#10B981]/10 to-transparent">
          <Film className="h-10 w-10 text-[#10B981]/40" />
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[9px] text-zinc-400">
          Preview · 00:14:32
        </span>
      </div>

      <div className="shrink-0">
        <div className="mb-2 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Timeline</span>
          <span className="text-[#10B981]">24 fps</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FRAMES.map((f, i) => (
            <div
              key={f}
              className={cn(
                "flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded border text-[9px]",
                i === 2
                  ? "border-[#00FF87] bg-[#10B981]/15 text-[#00FF87] ring-1 ring-[#10B981]/40"
                  : "border-gray-800/80 bg-[#0B0C10] text-zinc-600",
              )}
            >
              {f}
            </div>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={35}
          className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-800 accent-[#10B981]"
          aria-label="Timeline scrubber"
        />
      </div>

      <div className="shrink-0 space-y-1.5">
        <p className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Music2 className="h-3 w-3" /> Audio layers
        </p>
        {AUDIO_LANES.map((lane, i) => (
          <div
            key={lane}
            className="flex items-center gap-2 rounded border border-gray-800/80 bg-[#0B0C10] px-2 py-1"
          >
            <Volume2 className="h-3 w-3 text-[#10B981]/60" />
            <span className="flex-1 text-[9px] text-zinc-400">{lane}</span>
            <input
              type="range"
              defaultValue={i === 2 ? 70 : 45}
              className="h-1 w-16 accent-[#10B981]"
              aria-label={`${lane} level`}
            />
          </div>
        ))}
      </div>
    </div>
    </DeckShell>
  );
}
