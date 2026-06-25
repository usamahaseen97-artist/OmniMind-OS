"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MelodyEngine() {
  const { melodySketch, generateMelody } = useOmniMusicStudio();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Melody Engine</p>
        <button type="button" onClick={generateMelody} className="text-[8px] text-violet-400">Sketch</button>
      </div>
      {melodySketch ? (
        <p className="text-[8px] text-slate-500">{melodySketch.name} · {melodySketch.notes.length} notes</p>
      ) : null}
    </div>
  );
}
