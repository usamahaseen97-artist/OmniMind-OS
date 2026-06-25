"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function ClipLauncher() {
  const { clips, addClip, selectedTrackId } = useOmniMusicStudio();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Clip Launcher</p>
      <div className="grid grid-cols-4 gap-1">
        {clips.map((c) => (
          <button key={c.id} type="button" className="rounded border border-white/[0.06] py-3 text-[8px] text-slate-500" style={{ borderColor: c.color }}>
            {c.name}
          </button>
        ))}
        <button type="button" onClick={() => selectedTrackId && addClip(selectedTrackId, "Scene")} className="rounded border border-dashed border-pink-500/30 py-3 text-[8px] text-pink-400">+</button>
      </div>
    </div>
  );
}
