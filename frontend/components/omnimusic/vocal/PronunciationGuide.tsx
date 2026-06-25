"use client";

import { useState } from "react";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PronunciationGuide() {
  const [word, setWord] = useState("");
  const { pronunciationGuide } = useOmniMusicStudio();
  const guide = word ? pronunciationGuide(word) : null;

  return (
    <div className="mt-3 border-t border-white/[0.04] pt-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Pronunciation</p>
      <input className="w-full rounded bg-black/40 px-2 py-1 text-[8px]" value={word} onChange={(e) => setWord(e.target.value)} placeholder="Word" />
      {guide ? <p className="mt-1 text-[8px] text-slate-500">{guide.phonetic} · {guide.syllables.join("-")}</p> : null}
    </div>
  );
}
