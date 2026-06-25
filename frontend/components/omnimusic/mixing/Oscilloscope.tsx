"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function Oscilloscope() {
  const { meterState } = useOmniMusicStudio();
  const points = Array.from({ length: 48 }, (_, i) => {
    const t = i / 48;
    return 50 + Math.sin(t * Math.PI * 4 + meterState.phase) * meterState.peakL * 40;
  });

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Oscilloscope</p>
      <svg viewBox="0 0 200 100" className="h-20 w-full rounded bg-black/40">
        <polyline fill="none" stroke="rgb(251 191 36 / 0.7)" strokeWidth="1" points={points.map((y, i) => `${(i / 47) * 200},${y}`).join(" ")} />
      </svg>
    </div>
  );
}
