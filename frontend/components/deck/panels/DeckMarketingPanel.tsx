"use client";

import { ImageMinus, Smartphone, Tv } from "lucide-react";
import { useState } from "react";
import { deckChip, deckChipActive, deckPrimaryBtn } from "../../../lib/deck-interactive";
import { cn } from "../../../lib/utils";
import { DeckShell } from "../DeckShell";

export function DeckMarketingPanel() {
  const [aspect, setAspect] = useState<"vertical" | "horizontal">("vertical");
  const [bgRemove, setBgRemove] = useState(true);

  return (
    <DeckShell title="Ad Creative Studio" subtitle="Aspect ratio · background removal mock">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAspect("vertical")}
          className={cn(
            deckChip,
            "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
            aspect === "vertical" && deckChipActive,
            aspect === "vertical" && "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300",
          )}
        >
          <Smartphone className="h-4 w-4" />
          Vertical · TikTok / Reels
        </button>
        <button
          type="button"
          onClick={() => setAspect("horizontal")}
          className={cn(
            deckChip,
            "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
            aspect === "horizontal" && deckChipActive,
            aspect === "horizontal" && "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300",
          )}
        >
          <Tv className="h-4 w-4" />
          Horizontal · Feed
        </button>
      </div>

      <button
        type="button"
        onClick={() => setBgRemove((v) => !v)}
        className={cn(
          deckPrimaryBtn,
          "justify-between px-3",
          bgRemove && "border-[#10B981]/60 bg-[#10B981]/15",
        )}
      >
        <span className="flex items-center gap-2">
          <ImageMinus className="h-4 w-4" />
          Product BG removal
        </span>
        <span className="text-[10px] uppercase">{bgRemove ? "On" : "Off"}</span>
      </button>

      <div
        className={cn(
          "mx-auto rounded-lg border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 to-black",
          aspect === "vertical" ? "aspect-[9/16] w-[45%]" : "aspect-video w-full",
        )}
      />
    </DeckShell>
  );
}
