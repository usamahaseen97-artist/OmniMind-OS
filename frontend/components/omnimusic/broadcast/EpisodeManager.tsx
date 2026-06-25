"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function EpisodeManager() {
  const { podcastEpisodes, podcastSeries, activeEpisodeId, setActiveEpisodeId, createEpisode, activeEpisode } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-emerald-200/90">Episode Manager</p>
        <button type="button" onClick={() => podcastSeries[0] && createEpisode(podcastSeries[0].id, `Episode ${podcastEpisodes.length + 1}`)} className="text-[8px] text-emerald-400">+ Episode</button>
      </div>
      <ul className="space-y-1">
        {podcastEpisodes.map((ep) => (
          <li key={ep.id}>
            <button type="button" onClick={() => setActiveEpisodeId(ep.id)} className={`w-full rounded border px-2 py-1 text-left text-[8px] ${activeEpisodeId === ep.id ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200" : "border-white/[0.04] text-slate-500"}`}>
              {ep.title} · <span className="text-slate-700">{ep.status}</span>
            </button>
          </li>
        ))}
      </ul>
      {activeEpisode ? <p className="mt-2 text-[7px] text-slate-600">{activeEpisode.tracks.length} tracks · {activeEpisode.chapters.length} chapters</p> : null}
    </div>
  );
}
