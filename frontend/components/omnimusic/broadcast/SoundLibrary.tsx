"use client";

import { useState } from "react";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function SoundLibrary() {
  const { soundLibrary, soundCollections, searchSoundLibrary, toggleSoundFavorite } = useOmniMusicStudio();
  const [query, setQuery] = useState("");
  const items = query ? searchSoundLibrary(query) : soundLibrary;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Sound Library · Music · FX · Ambience · Podcast</p>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tags…" className="mb-2 w-full rounded border border-white/[0.06] bg-black/20 px-2 py-1 text-[8px] text-slate-400" />
      <ul className="max-h-32 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-[8px]">
            <span className="text-slate-400">{item.name}</span>
            <span className="text-slate-700">{item.category}</span>
            <button type="button" onClick={() => toggleSoundFavorite(item.id)} className={item.favorite ? "text-amber-400" : "text-slate-700"}>★</button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[7px] text-slate-600">{soundCollections.length} collections</p>
    </div>
  );
}
