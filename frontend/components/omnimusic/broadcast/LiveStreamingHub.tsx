"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function LiveStreamingHub() {
  const { streamingSession, streamingPlatforms, setStreamingPlatform, goLive, stopStream, switchStreamScene } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-rose-200/90">Live Streaming · RTMP · OBS-style</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {streamingPlatforms.map((p) => (
          <button key={p.id} type="button" onClick={() => setStreamingPlatform(p.id)} className={`rounded px-2 py-0.5 text-[8px] ${streamingSession.platform === p.id ? "bg-rose-500/15 text-rose-200" : "text-slate-600"}`}>{p.label}</button>
        ))}
      </div>
      <p className="mb-1 truncate font-mono text-[7px] text-slate-600">{streamingSession.rtmpUrl}</p>
      <div className="mb-2 flex gap-2">
        {streamingSession.status === "live" || streamingSession.status === "recording" ? (
          <button type="button" onClick={stopStream} className="rounded border border-rose-500/40 px-2 py-0.5 text-[8px] text-rose-300">Stop</button>
        ) : (
          <button type="button" onClick={goLive} className="rounded border border-emerald-500/40 px-2 py-0.5 text-[8px] text-emerald-300">Go Live</button>
        )}
        <span className="text-[8px] capitalize text-slate-500">{streamingSession.status}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {streamingSession.scenes.map((sc) => (
          <button key={sc.id} type="button" onClick={() => switchStreamScene(sc.id)} className={`rounded border px-2 py-0.5 text-[7px] ${sc.active ? "border-rose-500/40 text-rose-200" : "border-white/[0.04] text-slate-600"}`}>{sc.name}</button>
        ))}
      </div>
    </div>
  );
}
