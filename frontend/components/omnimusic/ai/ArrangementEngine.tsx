"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function ArrangementEngine() {
  const { prompt } = useOmniMusicStudio();
  const sections = prompt.songStructure.split("-");

  return (
    <div>
      <p className="text-[9px] uppercase text-slate-600">Arrangement Engine</p>
      <div className="flex flex-wrap gap-1">
        {sections.map((s) => (
          <span key={s} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-slate-500">{s}</span>
        ))}
      </div>
    </div>
  );
}
