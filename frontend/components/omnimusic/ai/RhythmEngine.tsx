"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function RhythmEngine() {
  const { prompt } = useOmniMusicStudio();

  return (
    <div>
      <p className="text-[9px] uppercase text-slate-600">Rhythm Engine</p>
      <p className="text-[8px] text-slate-500">{prompt.genre} pattern @ {prompt.bpm} BPM — architecture stub</p>
    </div>
  );
}
