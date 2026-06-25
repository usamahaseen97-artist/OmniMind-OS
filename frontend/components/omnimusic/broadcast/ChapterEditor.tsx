"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function ChapterEditor() {
  const { activeEpisode, addChapter, updateEpisode } = useOmniMusicStudio();
  if (!activeEpisode) return <p className="text-[8px] text-slate-600">Select an episode</p>;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-slate-300">Chapters · Intro · Outro · Sponsors</p>
        <button type="button" onClick={() => addChapter(activeEpisode.id, "New Chapter", 0)} className="text-[8px] text-emerald-400">+ Chapter</button>
      </div>
      <ul className="space-y-1">
        {activeEpisode.chapters.map((ch) => (
          <li key={ch.id} className="flex items-center gap-2 text-[8px]">
            <input value={ch.title} onChange={(e) => updateEpisode(activeEpisode.id, { chapters: activeEpisode.chapters.map((c) => c.id === ch.id ? { ...c, title: e.target.value } : c) })} className="flex-1 rounded border border-white/[0.06] bg-black/20 px-1 py-0.5 text-slate-400" />
            <span className="font-mono text-slate-600">{ch.startSec}s</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 space-y-1">
        {activeEpisode.segments.map((seg) => (
          <p key={seg.id} className="text-[7px] text-slate-600">{seg.kind}: {seg.title} ({seg.durationSec}s)</p>
        ))}
      </div>
    </div>
  );
}
