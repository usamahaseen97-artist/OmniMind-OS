"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function FXRack() {
  const { selectedMixChannelId, mixChannels, toggleFxBypass } = useOmniMusicStudio();
  const channel = mixChannels.find((c) => c.id === selectedMixChannelId);

  if (!channel) return <p className="text-[8px] text-slate-600">Select a channel to view FX inserts</p>;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">FX Rack · {channel.name}</p>
      <ul className="space-y-1">
        {channel.inserts.length === 0 ? <li className="text-[8px] text-slate-600">No inserts — add from Plugin Host</li> : null}
        {channel.inserts.map((ins) => (
          <li key={ins.id} className="flex items-center justify-between rounded border border-white/[0.04] px-2 py-1 text-[8px]">
            <span className={ins.bypassed ? "text-slate-600 line-through" : "text-slate-400"}>{ins.name}</span>
            <button type="button" onClick={() => toggleFxBypass(channel.id, ins.id)} className="text-[7px] text-amber-400">
              {ins.bypassed ? "Enable" : "Bypass"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
