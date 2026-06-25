"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PodcastStudio() {
  const { activeEpisode, updateEpisode, addPodcastTrack } = useOmniMusicStudio();
  if (!activeEpisode) return <p className="text-[8px] text-slate-600">No active episode</p>;

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-emerald-200/90">Podcast Timeline</p>
      <input value={activeEpisode.title} onChange={(e) => updateEpisode(activeEpisode.id, { title: e.target.value })} className="mb-2 w-full rounded border border-white/[0.06] bg-black/20 px-2 py-1 text-[9px] text-slate-300" />
      <textarea value={activeEpisode.notes} onChange={(e) => updateEpisode(activeEpisode.id, { notes: e.target.value })} placeholder="Episode notes…" className="mb-2 h-16 w-full rounded border border-white/[0.06] bg-black/20 p-2 text-[8px] text-slate-500" />
      <div className="mb-2 flex gap-1">
        <button type="button" onClick={() => addPodcastTrack(activeEpisode.id, "Host", "host")} className="text-[7px] text-slate-500">+ Host</button>
        <button type="button" onClick={() => addPodcastTrack(activeEpisode.id, "Guest", "guest")} className="text-[7px] text-slate-500">+ Guest</button>
      </div>
      <ul className="space-y-1">
        {activeEpisode.tracks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-[8px]">
            <span className="w-20 truncate text-slate-400">{t.name}</span>
            <span className="text-slate-700">{t.role}</span>
            <input type="range" min={0} max={1} step={0.01} value={t.gain} onChange={(e) => updateEpisode(activeEpisode.id, { tracks: activeEpisode.tracks.map((tr) => tr.id === t.id ? { ...tr, gain: Number(e.target.value) } : tr) })} className="flex-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
