"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function StreamingDashboard() {
  const { streamingSession } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Streaming Dashboard</p>
      <div className="grid grid-cols-2 gap-2 text-[8px]">
        <div className="rounded bg-black/30 p-2"><span className="text-slate-600">Viewers</span><p className="font-mono text-rose-200">{streamingSession.viewerCount}</p></div>
        <div className="rounded bg-black/30 p-2"><span className="text-slate-600">Platform</span><p className="capitalize text-slate-400">{streamingSession.platform}</p></div>
        <div className="rounded bg-black/30 p-2"><span className="text-slate-600">Recording</span><p className="text-slate-400">{streamingSession.recordingEnabled ? "On" : "Off"}</p></div>
        <div className="rounded bg-black/30 p-2"><span className="text-slate-600">Audio route</span><p className="text-slate-400">{streamingSession.scenes.find((s) => s.active)?.audioRouteId ?? "—"}</p></div>
      </div>
      <p className="mt-2 text-[7px] text-slate-700">Live monitoring · audio routing · recording architecture</p>
    </div>
  );
}
