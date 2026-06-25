"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function PluginRack() {
  const { plugins, scanPlugins, installPlugin } = useOmniMusicStudio();

  return (
    <div className="border-b border-white/[0.04] p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Plugin Rack</p>
        <button type="button" onClick={scanPlugins} className="text-[8px] text-pink-400">Scan</button>
      </div>
      <ul className="max-h-24 space-y-0.5 overflow-y-auto">
        {plugins.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-[8px] text-slate-500">
            <span>{p.name} <span className="text-slate-700">({p.format})</span></span>
            {!p.installed ? <button type="button" onClick={() => installPlugin(p.id)} className="text-pink-400">+</button> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
