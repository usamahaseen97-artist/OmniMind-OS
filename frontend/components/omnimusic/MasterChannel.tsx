"use client";

import type { MixerChannel } from "../../lib/omnimusic-studio/types";

export function MasterChannel({ channel, onUpdate }: { channel: MixerChannel; onUpdate: (p: Partial<MixerChannel>) => void }) {
  return (
    <div className="mx-1 flex w-20 shrink-0 flex-col items-center rounded border border-pink-500/30 bg-pink-500/5 p-1">
      <span className="mb-1 text-[8px] font-semibold text-pink-300">MASTER</span>
      <div className="mb-1 flex h-14 w-3 flex-col justify-end gap-px bg-black/40">
        <div className="w-full bg-pink-400" style={{ height: `${channel.peakL * 100}%` }} />
        <div className="w-full bg-pink-400" style={{ height: `${channel.peakR * 100}%` }} />
      </div>
      <input type="range" min={0} max={1} step={0.01} value={channel.gain} onChange={(e) => onUpdate({ gain: Number(e.target.value) })} className="h-20 w-full [writing-mode:vertical-lr]" />
      <p className="mt-1 text-[7px] text-slate-600">Output</p>
    </div>
  );
}
