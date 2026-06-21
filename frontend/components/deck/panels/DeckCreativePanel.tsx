"use client";

import { Palette, Wand2 } from "lucide-react";
import { DeckShell } from "../DeckShell";

export function DeckCreativePanel() {
  return (
    <DeckShell title="Creative Visionary" subtitle="Concept boards · style transfer preview">
      <div className="grid grid-cols-3 gap-1.5">
        {["Neon", "Matte", "Glass"].map((s) => (
          <div
            key={s}
            className="aspect-square rounded-lg border border-gray-800 bg-gradient-to-br from-fuchsia-900/30 to-[#0B0C10] p-2"
          >
            <Palette className="h-4 w-4 text-fuchsia-400/60" />
            <p className="mt-1 text-[8px] text-zinc-500">{s}</p>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1 text-[9px] text-zinc-600">
        <Wand2 className="h-3 w-3" />
        Linked to image render pipeline when chat triggers create_image
      </p>
    </DeckShell>
  );
}
