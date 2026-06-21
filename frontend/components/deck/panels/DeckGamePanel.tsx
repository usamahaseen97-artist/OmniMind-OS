"use client";

import { Box, Code2, Gamepad2, Layers } from "lucide-react";
import { DeckShell } from "../DeckShell";

export function DeckGamePanel() {
  return (
    <DeckShell title="Game & App Production" subtitle="Full-stack compiler · low-code deploy anchors">
      <div className="space-y-2 font-mono text-[9px] text-emerald-300/85">
        <p className="flex items-center gap-2 rounded border border-gray-800 bg-black/50 px-2 py-1.5">
          <Code2 className="h-3.5 w-3.5 text-cyan-400" />
          omnimind compile --target unity-webgl
        </p>
        <p className="flex items-center gap-2 rounded border border-gray-800 bg-black/50 px-2 py-1.5">
          <Layers className="h-3.5 w-3.5 text-violet-400" />
          pipeline: assets → build → staging
        </p>
        <p className="flex items-center gap-2 rounded border border-gray-800 bg-black/50 px-2 py-1.5">
          <Box className="h-3.5 w-3.5 text-[#10B981]" />
          low-code: visual state machine ✓
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-emerald-500/20 bg-gradient-to-b from-violet-950/30 to-black py-6">
        <Gamepad2 className="h-10 w-10 text-[#10B981]/40" />
      </div>
    </DeckShell>
  );
}
