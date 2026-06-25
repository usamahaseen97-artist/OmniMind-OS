"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MusicCopilot() {
  const { copilotSuggestions, updatePrompt, submitGeneration } = useOmniMusicStudio();

  return (
    <div className="space-y-2">
      <p className="text-[9px] uppercase text-violet-400/80">Music Copilot</p>
      {copilotSuggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => updatePrompt({ prompt: s })}
          className="block w-full rounded border border-white/[0.06] px-2 py-1 text-left text-[8px] text-slate-500 hover:bg-violet-500/5"
        >
          {s}
        </button>
      ))}
      <button type="button" onClick={() => submitGeneration()} className="w-full rounded bg-violet-500/15 py-1 text-[9px] text-violet-200">
        Generate from copilot context
      </button>
    </div>
  );
}
