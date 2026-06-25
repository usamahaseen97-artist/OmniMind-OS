"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function NoiseProfiler() {
  const { noiseProfiles, captureNoiseProfile } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-slate-300">Noise Profiler</p>
        <button type="button" onClick={() => captureNoiseProfile(`Profile ${noiseProfiles.length + 1}`, 3)} className="text-[8px] text-emerald-400">Capture sample</button>
      </div>
      <ul className="space-y-1">
        {noiseProfiles.map((p) => (
          <li key={p.id} className="text-[8px] text-slate-500">{p.name} · {p.sampleSec}s · {p.fingerprint.length} bins</li>
        ))}
      </ul>
      {noiseProfiles.length === 0 ? <p className="text-[7px] text-slate-700">Capture room tone for noise reduction</p> : null}
    </div>
  );
}
