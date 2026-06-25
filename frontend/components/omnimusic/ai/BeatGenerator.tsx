"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function BeatGenerator() {
  const { beatTemplates, generateFromBeat, prompt, updatePrompt } = useOmniMusicStudio();

  return (
    <div className="space-y-2">
      <p className="text-[9px] uppercase text-slate-600">Beat Maker</p>
      <div className="grid grid-cols-2 gap-1">
        {beatTemplates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              updatePrompt({ genre: t.genre, bpm: t.bpm, key: t.key, workflow: "prompt-to-beat" });
              generateFromBeat(t);
            }}
            className="rounded border border-white/[0.06] px-2 py-2 text-left text-[8px] text-slate-500 hover:border-violet-500/30"
          >
            <span className="text-violet-200">{t.genre}</span>
            <br />
            {t.bpm} BPM · {t.key}
          </button>
        ))}
      </div>
      <p className="text-[8px] text-slate-600">Selected: {prompt.genre} · {prompt.bpm} BPM</p>
    </div>
  );
}
