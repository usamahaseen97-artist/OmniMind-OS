"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PluginHost() {
  const { fxCatalog, selectedMixChannelId, addFxInsert } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Plugin Host · {fxCatalog.length} plugins</p>
      <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto">
        {fxCatalog.map((plugin) => (
          <button
            key={plugin.id}
            type="button"
            disabled={!selectedMixChannelId}
            onClick={() => selectedMixChannelId && addFxInsert(selectedMixChannelId, plugin.id)}
            className="rounded border border-white/[0.04] px-2 py-1 text-left text-[7px] text-slate-500 hover:border-amber-500/30 disabled:opacity-40"
          >
            <span className="block text-slate-400">{plugin.name}</span>
            <span className="text-slate-700">{plugin.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
