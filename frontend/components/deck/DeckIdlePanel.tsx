"use client";

import { Cpu, Sparkles } from "lucide-react";
import { deckChip } from "../../lib/deck-interactive";
import { cn } from "../../lib/utils";

export function DeckIdlePanel() {
  return (
    <div className="pointer-events-auto relative z-40 flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-[#0B0C10] shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <Cpu className="h-8 w-8 text-[#10B981]/60" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide text-zinc-300">
          System Idle
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Waiting for Architecture Instructions
        </p>
      </div>
      <p className="max-w-[240px] text-[10px] text-zinc-600">
        Select a core tool from the left rail or stream a build command in chat.
        Live compilations appear here automatically.
      </p>
      <button
        type="button"
        className={cn(deckChip, "flex items-center gap-2 px-3 py-2 text-[10px] text-[#10B981]")}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Awaiting architecture stream
      </button>
    </div>
  );
}
