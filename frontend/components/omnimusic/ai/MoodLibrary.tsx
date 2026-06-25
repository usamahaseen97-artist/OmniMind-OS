"use client";

import { MOODS, EMOTIONS } from "../../../lib/omnimusic-studio/ai/constants";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MoodLibrary() {
  const { prompt, updatePrompt } = useOmniMusicStudio();

  return (
    <div>
      <p className="mb-1 text-[8px] text-slate-600">Mood · Emotion</p>
      <div className="flex flex-wrap gap-1">
        {MOODS.map((m) => (
          <button key={m} type="button" onClick={() => updatePrompt({ mood: m })} className={`rounded px-1.5 py-0.5 text-[8px] ${prompt.mood === m ? "bg-violet-500/15 text-violet-200" : "text-slate-600"}`}>{m}</button>
        ))}
        {EMOTIONS.map((e) => (
          <button key={e} type="button" onClick={() => updatePrompt({ emotion: e })} className={`rounded px-1.5 py-0.5 text-[8px] ${prompt.emotion === e ? "bg-pink-500/15 text-pink-200" : "text-slate-600"}`}>{e}</button>
        ))}
      </div>
    </div>
  );
}
