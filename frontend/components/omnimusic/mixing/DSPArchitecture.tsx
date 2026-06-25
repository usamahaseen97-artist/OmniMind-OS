"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function DSPArchitecture() {
  const { dspGraph } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">DSP Graph · {dspGraph.length} nodes</p>
      <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto">
        {dspGraph.map((node) => (
          <div key={node.id} className="rounded border border-white/[0.04] px-2 py-1 text-[7px]">
            <span className="text-amber-400/80">{node.type}</span>
            <span className="ml-1 text-slate-400">{node.label}</span>
            {node.connections.length > 0 ? <p className="text-slate-700">→ {node.connections.length} conn</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
