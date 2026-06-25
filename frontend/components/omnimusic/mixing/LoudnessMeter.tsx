"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function LoudnessMeter() {
  const { meterState } = useOmniMusicStudio();
  const bars = [
    { label: "Integrated", value: meterState.lufsIntegrated },
    { label: "Short", value: meterState.lufsShort },
    { label: "Momentary", value: meterState.lufsMomentary },
  ];

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">LUFS Meter</p>
      {bars.map((b) => (
        <div key={b.label} className="mb-1 flex items-center gap-2 text-[8px]">
          <span className="w-16 text-slate-600">{b.label}</span>
          <div className="h-2 flex-1 rounded bg-black/40">
            <div className="h-full rounded bg-amber-500/60" style={{ width: `${Math.min(100, Math.abs(b.value) * 4)}%` }} />
          </div>
          <span className="w-10 font-mono text-amber-200">{b.value.toFixed(1)}</span>
        </div>
      ))}
      <div className="mt-2 flex gap-3 text-[8px] text-slate-500">
        <span>Peak L {meterState.peakL.toFixed(2)}</span>
        <span>Peak R {meterState.peakR.toFixed(2)}</span>
        <span>RMS {(meterState.rmsL + meterState.rmsR) / 2 | 0}</span>
      </div>
    </div>
  );
}
