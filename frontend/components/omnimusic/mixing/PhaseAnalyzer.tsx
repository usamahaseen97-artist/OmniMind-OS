"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PhaseAnalyzer() {
  const { meterState } = useOmniMusicStudio();
  const angle = meterState.phase * 180;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Phase Analyzer</p>
      <div className="flex items-center justify-center">
        <div className="relative h-16 w-16 rounded-full border border-white/10 bg-black/40">
          <div className="absolute left-1/2 top-1/2 h-7 w-0.5 origin-bottom -translate-x-1/2 bg-amber-400/80" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
        </div>
      </div>
      <p className="mt-2 text-center text-[8px] text-slate-500">Phase {angle.toFixed(0)}°</p>
    </div>
  );
}
