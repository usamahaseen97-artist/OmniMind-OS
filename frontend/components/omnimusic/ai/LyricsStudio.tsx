"use client";

import { useState } from "react";
import type { LyricSectionKind } from "../../../lib/omnimusic-studio/ai-types";
import { LANGUAGES } from "../../../lib/omnimusic-studio/ai/constants";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

const SECTIONS: LyricSectionKind[] = ["verse", "chorus", "bridge", "hook", "outro", "freestyle"];

export function LyricsStudio() {
  const { lyrics, updateLyricsTitle, addLyricSection, rhymeSuggestions } = useOmniMusicStudio();
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<LyricSectionKind>("verse");
  const [rhymeWord, setRhymeWord] = useState("");

  return (
    <div className="space-y-2">
      <p className="text-[9px] uppercase text-slate-600">Lyrics Studio</p>
      <input className="w-full rounded bg-black/40 px-2 py-1 text-[10px] text-violet-200" value={lyrics.title} onChange={(e) => updateLyricsTitle(e.target.value)} />
      <select className="rounded bg-black/40 px-1 text-[8px]" value={lyrics.language} onChange={(e) => updateLyricsTitle(lyrics.title)}>
        {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
      </select>
      <div className="flex flex-wrap gap-1">
        {SECTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setKind(s)} className={`rounded px-1.5 py-0.5 text-[8px] capitalize ${kind === s ? "bg-violet-500/15 text-violet-200" : "text-slate-600"}`}>{s}</button>
        ))}
      </div>
      <textarea className="h-20 w-full rounded bg-black/40 p-2 text-[9px]" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write lyrics…" />
      <button type="button" onClick={() => { addLyricSection(kind, draft.split("\n").filter(Boolean)); setDraft(""); }} className="text-[8px] text-violet-400">Add section</button>
      <div className="flex gap-1">
        <input className="flex-1 rounded bg-black/40 px-1 text-[8px]" value={rhymeWord} onChange={(e) => setRhymeWord(e.target.value)} placeholder="Rhyme word" />
        <span className="text-[8px] text-slate-600">{rhymeSuggestions(rhymeWord).join(" · ")}</span>
      </div>
      {lyrics.sections.map((s) => (
        <div key={s.id} className="rounded border border-white/[0.04] p-2 text-[8px] text-slate-500">
          <p className="text-violet-300 capitalize">{s.kind} · {s.syllableCount} syllables</p>
          {s.lines.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      ))}
    </div>
  );
}
