"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function TrackEnginePanel() {
  const { tracks, selectedTrackId, armTrack, setTrackMonitor, setTrackRecordEnabled } = useOmniMusicStudio();
  const audioTracks = tracks.filter((t) => t.kind === "audio");

  return (
    <div className="space-y-1">
      {audioTracks.map((t) => (
        <div key={t.id} className={`flex items-center gap-2 rounded px-1 py-0.5 text-[8px] ${selectedTrackId === t.id ? "bg-pink-500/10" : ""}`}>
          <span className="w-16 truncate text-slate-500">{t.name}</span>
          <button type="button" onClick={() => armTrack(t.id)} className={t.armed ? "text-rose-400" : "text-slate-600"}>R</button>
          <button type="button" onClick={() => setTrackMonitor(t.id, !t.monitorInput)} className={t.monitorInput ? "text-cyan-400" : "text-slate-600"}>M</button>
          <button type="button" onClick={() => setTrackRecordEnabled(t.id, !t.recordEnabled)} className={t.recordEnabled ? "text-pink-300" : "text-slate-600"}>●</button>
        </div>
      ))}
    </div>
  );
}
