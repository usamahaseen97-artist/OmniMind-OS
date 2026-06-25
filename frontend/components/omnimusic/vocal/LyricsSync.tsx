"use client";

import { useState } from "react";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function LyricsSync() {
  const { lyricsSync, toggleKaraoke, addLyricLine, transport } = useOmniMusicStudio();
  const [line, setLine] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Lyrics Panel</p>
        <button type="button" onClick={toggleKaraoke} className={`text-[8px] ${lyricsSync.karaokeMode ? "text-cyan-300" : "text-slate-600"}`}>Karaoke</button>
      </div>
      <textarea className="h-12 w-full rounded bg-black/40 p-2 text-[9px]" value={line} onChange={(e) => setLine(e.target.value)} placeholder="Lyric line" />
      <button type="button" onClick={() => { addLyricLine(line, transport.playheadBeat, 4); setLine(""); }} className="text-[8px] text-cyan-400">Add timed line</button>
      {lyricsSync.karaokeMode ? (
        <div className="rounded bg-black/30 p-2">
          {lyricsSync.lines.map((l) => (
            <p key={l.id} className="text-[10px] text-cyan-200">{l.text}</p>
          ))}
        </div>
      ) : (
        lyricsSync.lines.map((l) => (
          <p key={l.id} className="text-[8px] text-slate-500">{l.startBeat.toFixed(1)} · {l.text} · {l.words.length} words</p>
        ))
      )}
    </div>
  );
}
