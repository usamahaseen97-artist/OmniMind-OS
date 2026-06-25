"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import { AudioCachePanel } from "./audio/AudioCache";

export function StatusBar() {
  const { transport, recording, project, audioReady, audioSettings, studioViewMode } = useOmniMusicStudio();

  return (
    <div className="flex h-6 shrink-0 items-center justify-between gap-2 border-t border-white/[0.06] bg-[#080a0e] px-3 text-[8px] text-slate-600">
      <span className="capitalize">{transport.status}</span>
      <span>{project.tracks.length} tracks · {project.clips.length} clips</span>
      <span>{recording.input} · {recording.latencyMs}ms</span>
      <span>{audioSettings.sampleRate / 1000}k · {audioSettings.bufferSize} buf</span>
      <AudioCachePanel />
      <span className={audioReady ? "text-emerald-500/80" : "text-amber-400/80"}>
        {audioReady ? "Audio engine ready" : "Audio engine…"}
      </span>
      {studioViewMode === "ai" ? <span className="text-violet-400/80">AI Studio</span> : null}
      {studioViewMode === "vocal" ? <span className="text-cyan-400/80">Vocal Studio</span> : null}
      {studioViewMode === "mix" ? <span className="text-amber-400/80">Mix Studio</span> : null}
    </div>
  );
}
