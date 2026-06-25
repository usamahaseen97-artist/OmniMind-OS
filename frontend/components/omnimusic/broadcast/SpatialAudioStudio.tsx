"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import type { SpatialFormat } from "../../../lib/omnimusic-studio/broadcast-types";
import { AtmosMixer } from "./AtmosMixer";
import { SurroundMixer } from "./SurroundMixer";

const FORMATS: SpatialFormat[] = ["stereo", "5.1", "7.1", "atmos", "binaural"];

export function SpatialAudioStudio() {
  const { spatialMix, setSpatialFormat } = useOmniMusicStudio();

  return (
    <div className="space-y-2">
      <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
        <p className="mb-2 text-[9px] font-medium text-violet-200/90">Spatial Audio · Dolby Atmos architecture</p>
        <div className="flex flex-wrap gap-1">
          {FORMATS.map((f) => (
            <button key={f} type="button" onClick={() => setSpatialFormat(f)} className={`rounded px-2 py-0.5 text-[8px] uppercase ${spatialMix.format === f ? "bg-violet-500/15 text-violet-200" : "text-slate-600"}`}>{f}</button>
          ))}
        </div>
        <p className="mt-2 text-[7px] text-slate-600">Objects: {spatialMix.objects.length} · Height channels: {spatialMix.heightChannels} · Binaural: {spatialMix.binauralMonitor ? "on" : "off"}</p>
      </div>
      {spatialMix.format === "atmos" ? <AtmosMixer /> : <SurroundMixer />}
    </div>
  );
}
