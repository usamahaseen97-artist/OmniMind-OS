"use client";

import { useState } from "react";

/** Lightweight workspace terminal — OmniForge uses full CollapsibleBottomTerminal. */
export function OmniWorkspaceTerminal() {
  const [lines] = useState<string[]>([
    "OmniMind Workspace Terminal v2",
    "Type commands or open OmniForge for full IDE terminal.",
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0e14] font-mono text-[10px] text-emerald-400/90">
      <div className="flex-1 overflow-y-auto p-2">
        {lines.map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line}
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] px-2 py-1 text-zinc-600">
        <span className="text-cyan-500/80">$</span> _
      </div>
    </div>
  );
}
