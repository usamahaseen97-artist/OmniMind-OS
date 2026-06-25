"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function BusManager() {
  const { mixBuses, updateMixBus, addMixBus } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-slate-300">Bus Manager</p>
        <button type="button" onClick={() => addMixBus(`Bus ${mixBuses.length + 1}`, "aux")} className="text-[8px] text-amber-400">+ Bus</button>
      </div>
      <ul className="space-y-1">
        {mixBuses.map((bus) => (
          <li key={bus.id} className="flex items-center gap-2 rounded border border-white/[0.04] px-2 py-1 text-[8px]">
            <span className="w-16 truncate text-slate-400">{bus.name}</span>
            <span className="text-slate-600">{bus.kind}</span>
            <input type="range" min={0} max={1} step={0.01} value={bus.gain} onChange={(e) => updateMixBus(bus.id, { gain: Number(e.target.value) })} className="flex-1" />
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[7px] text-slate-600">Subgroups · folders · returns · cue mix architecture</p>
    </div>
  );
}
