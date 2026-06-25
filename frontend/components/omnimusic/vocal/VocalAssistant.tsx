"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function VocalAssistant() {
  const { vocalSuggestions } = useOmniMusicStudio();

  return (
    <div className="space-y-2">
      <p className="text-[9px] uppercase text-cyan-400/80">AI Vocal Assistant</p>
      <p className="text-[8px] text-slate-600">Architecture only — suggestions based on session analysis.</p>
      {vocalSuggestions.map((s) => (
        <div key={s.id} className="rounded border border-white/[0.06] p-2 text-[8px]">
          <p className="text-cyan-200">{s.title} <span className="text-slate-600 capitalize">({s.category})</span></p>
          <p className="text-slate-500">{s.detail}</p>
        </div>
      ))}
    </div>
  );
}
