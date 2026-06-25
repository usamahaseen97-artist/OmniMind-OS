"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

const SURROUND_LABELS = ["L", "R", "C", "LFE", "Ls", "Rs", "Ltm", "Rtm"];

export function SurroundMixer() {
  const { spatialMix } = useOmniMusicStudio();
  const channelCount = spatialMix.format === "7.1" ? 8 : spatialMix.format === "5.1" ? 6 : 2;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Surround Mixer · {spatialMix.format}</p>
      <div className="flex flex-wrap gap-2">
        {SURROUND_LABELS.slice(0, channelCount).map((ch) => (
          <div key={ch} className="flex w-10 flex-col items-center">
            <span className="text-[7px] text-slate-600">{ch}</span>
            <input type="range" min={0} max={1} step={0.01} defaultValue={0.8} className="h-12 [writing-mode:vertical-lr]" />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[7px] text-slate-700">Room simulation · binaural monitoring architecture</p>
    </div>
  );
}
