"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PerformanceMonitor() {
  const { performanceMonitor } = useOmniMusicStudio();
  const m = performanceMonitor;

  return (
    <div className="mt-2 flex gap-3 text-[8px] text-slate-600">
      <span>In: {(m.inputLevel * 100).toFixed(0)}%</span>
      <span>Peak: {(m.peakLevel * 100).toFixed(0)}%</span>
      {m.clipping ? <span className="text-rose-400">CLIP</span> : null}
      <span>{m.latencyMs}ms</span>
      <span>CPU {m.cpuPercent.toFixed(0)}%</span>
    </div>
  );
}
