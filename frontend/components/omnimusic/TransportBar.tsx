"use client";

import { Circle, Pause, Play, Square, SkipBack, SkipForward } from "lucide-react";
import { cn } from "../../lib/utils";
import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import { TempoManager } from "./audio/TempoManager";
import { UndoHistory } from "./audio/UndoHistory";

export function TransportBar() {
  const {
    transport,
    togglePlayPause,
    toggleRecord,
    stop,
    rewind,
    fastForward,
    formatTime,
    saveProject,
    project,
    setTransport,
    studioViewMode,
    setStudioViewMode,
    generationJobs,
  } = useOmniMusicStudio();

  const activeJobs = generationJobs.filter((j) => ["queued", "running", "paused"].includes(j.status)).length;

  return (
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0a0e16] px-3">
      <div className="flex rounded border border-white/[0.06] p-0.5">
        <button type="button" onClick={() => setStudioViewMode("daw")} className={`rounded px-2 py-0.5 text-[8px] ${studioViewMode === "daw" ? "bg-pink-500/15 text-pink-200" : "text-slate-600"}`}>DAW</button>
        <button type="button" onClick={() => setStudioViewMode("ai")} className={`rounded px-2 py-0.5 text-[8px] ${studioViewMode === "ai" ? "bg-violet-500/15 text-violet-200" : "text-slate-600"}`}>
          AI {activeJobs > 0 ? `(${activeJobs})` : ""}
        </button>
        <button type="button" onClick={() => setStudioViewMode("vocal")} className={`rounded px-2 py-0.5 text-[8px] ${studioViewMode === "vocal" ? "bg-cyan-500/15 text-cyan-200" : "text-slate-600"}`}>Vocal</button>
        <button type="button" onClick={() => setStudioViewMode("mix")} className={`rounded px-2 py-0.5 text-[8px] ${studioViewMode === "mix" ? "bg-amber-500/15 text-amber-200" : "text-slate-600"}`}>Mix</button>
      </div>
      <UndoHistory />
      <button type="button" onClick={() => rewind(1)} className="text-slate-500 hover:text-pink-300"><SkipBack size={14} /></button>
      <button
        type="button"
        onClick={togglePlayPause}
        className={cn("rounded-full p-1.5", transport.playing ? "bg-pink-500/20 text-pink-300" : "bg-white/5 text-slate-400")}
      >
        {transport.paused ? <Pause size={14} /> : transport.playing ? <Square size={14} /> : <Play size={14} />}
      </button>
      <button type="button" onClick={stop} className="text-[8px] text-slate-600">Stop</button>
      <button
        type="button"
        onClick={() => void toggleRecord()}
        className={cn("rounded-full p-1.5", transport.recording ? "bg-rose-500/30 text-rose-400" : "text-slate-500")}
      >
        <Circle size={14} fill={transport.recording ? "currentColor" : "none"} />
      </button>
      <button type="button" onClick={() => fastForward(1)} className="text-slate-500 hover:text-pink-300"><SkipForward size={14} /></button>

      <span className="font-mono text-[11px] text-pink-200">{formatTime()}</span>
      <TempoManager />

      <label className="ml-1 flex items-center gap-1 text-[9px] text-slate-500">
        <input
          type="checkbox"
          checked={transport.loopEnabled}
          onChange={(e) => setTransport((t) => ({ ...t, loopEnabled: e.target.checked }))}
        />
        Loop
      </label>

      <span className="ml-auto truncate text-[10px] text-slate-500">{project.name}</span>
      <button type="button" onClick={saveProject} className="rounded border border-pink-500/30 px-2 py-0.5 text-[9px] text-pink-300">Save</button>
    </div>
  );
}
