"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function SpectrumAnalyzer() {
  const { spectrumFrame } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Spectrum Analyzer</p>
      <div className="flex h-24 items-end gap-px">
        {spectrumFrame.bins.slice(0, 64).map((bin, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-amber-600/40 to-amber-300/60" style={{ height: `${Math.max(2, bin * 100)}%` }} />
        ))}
      </div>
      <p className="mt-1 text-[7px] text-slate-700">Real-time FFT architecture · frequency heatmap ready</p>
    </div>
  );
}
