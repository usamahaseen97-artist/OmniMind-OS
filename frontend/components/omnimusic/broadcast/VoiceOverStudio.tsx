"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import type { VoiceOverCategory } from "../../../lib/omnimusic-studio/broadcast-types";

const CATEGORIES: VoiceOverCategory[] = ["commercial", "narration", "audiobook", "documentary", "youtube", "training", "presentation", "corporate"];

export function VoiceOverStudio() {
  const { voiceOverProjects, createVoiceOver } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Voice Over Studio</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => createVoiceOver(`${c} project`, c, "")} className="rounded border border-white/[0.04] px-2 py-0.5 text-[7px] capitalize text-slate-500">{c}</button>
        ))}
      </div>
      <ul className="space-y-1">
        {voiceOverProjects.map((p) => (
          <li key={p.id} className="rounded border border-white/[0.04] px-2 py-1 text-[8px]">
            <span className="text-slate-400">{p.title}</span>
            <span className="ml-2 capitalize text-slate-700">{p.category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
