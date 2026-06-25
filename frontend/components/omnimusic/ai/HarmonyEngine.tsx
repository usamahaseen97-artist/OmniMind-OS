"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function HarmonyEngine() {
  const { chordProgressions } = useOmniMusicStudio();
  const latest = chordProgressions[0];

  return (
    <div>
      <p className="text-[9px] uppercase text-slate-600">Harmony Engine</p>
      <p className="text-[8px] text-slate-500">
        {latest ? `Voicing: ${latest.chords.join(" / ")}` : "Generate chords first"}
      </p>
    </div>
  );
}
