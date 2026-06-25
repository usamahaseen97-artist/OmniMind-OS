"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PresetManager() {
  const { mixPresets, applyMixPreset } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Mix Presets</p>
      <ul className="space-y-1">
        {mixPresets.map((preset) => (
          <li key={preset.id} className="flex items-center justify-between text-[8px]">
            <span className="text-slate-400">{preset.name}</span>
            <span className="text-slate-700">{preset.category}</span>
            <button type="button" onClick={() => applyMixPreset(preset)} className="text-amber-400">Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
