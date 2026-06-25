"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import { MasterChannel } from "./MasterChannel";

export function MixerConsole() {
  const { mixer, updateMixer } = useOmniMusicStudio();
  const master = mixer.find((c) => c.name === "Master");
  const channels = mixer.filter((c) => c.name !== "Master");

  return (
    <div className="flex h-full overflow-x-auto bg-[#0a0c10] p-2">
      {channels.map((ch) => (
        <div key={ch.id} className="mx-1 flex w-16 shrink-0 flex-col items-center rounded border border-white/[0.06] bg-white/[0.02] p-1">
          <span className="mb-1 truncate text-[8px] text-slate-500">{ch.name}</span>
          <div className="mb-1 flex h-12 w-2 flex-col justify-end gap-px bg-black/40">
            <div className="w-full bg-green-400" style={{ height: `${ch.peakL * 100}%` }} />
          </div>
          <input type="range" min={0} max={1} step={0.01} value={ch.gain} onChange={(e) => updateMixer(ch.id, { gain: Number(e.target.value) })} className="h-16 w-full [writing-mode:vertical-lr]" />
          <input type="range" min={-1} max={1} step={0.01} value={ch.pan} onChange={(e) => updateMixer(ch.id, { pan: Number(e.target.value) })} className="mt-1 w-full" />
          <div className="mt-1 flex gap-0.5">
            <button type="button" onClick={() => updateMixer(ch.id, { muted: !ch.muted })} className="text-[7px] text-slate-600">M</button>
            <button type="button" onClick={() => updateMixer(ch.id, { solo: !ch.solo })} className="text-[7px] text-slate-600">S</button>
          </div>
          <p className="mt-1 text-[6px] text-slate-700">{ch.fxSlots.length} FX</p>
        </div>
      ))}
      {master ? <MasterChannel channel={master} onUpdate={(p) => updateMixer(master.id, p)} /> : null}
    </div>
  );
}
