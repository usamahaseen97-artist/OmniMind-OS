"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MusicTemplates() {
  const { musicTemplates, applyTemplate } = useOmniMusicStudio();

  return (
    <div className="space-y-1">
      <p className="text-[9px] uppercase text-slate-600">Templates</p>
      {musicTemplates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => applyTemplate(t)}
          className="block w-full rounded border border-white/[0.06] px-2 py-2 text-left text-[8px] text-slate-500 hover:border-violet-500/30"
        >
          <span className="text-violet-200">{t.name}</span> · {t.genre}
        </button>
      ))}
    </div>
  );
}
