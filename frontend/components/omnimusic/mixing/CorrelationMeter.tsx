"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function CorrelationMeter() {
  const { meterState } = useOmniMusicStudio();
  const corr = meterState.correlation;
  const pct = ((corr + 1) / 2) * 100;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Stereo Correlation</p>
      <div className="relative h-3 rounded bg-gradient-to-r from-rose-500/40 via-emerald-500/40 to-rose-500/40">
        <div className="absolute top-0 h-full w-0.5 bg-white/80" style={{ left: `${pct}%` }} />
      </div>
      <p className="mt-1 text-center font-mono text-[9px] text-amber-200">{corr.toFixed(2)}</p>
    </div>
  );
}
