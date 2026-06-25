"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function ChordEngine() {
  const { chordProgressions, generateChords } = useOmniMusicStudio();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Chord Engine</p>
        <button type="button" onClick={generateChords} className="text-[8px] text-violet-400">Generate</button>
      </div>
      {chordProgressions.map((c) => (
        <p key={c.id} className="text-[8px] text-slate-500">{c.name}: {c.chords.join(" → ")}</p>
      ))}
    </div>
  );
}
