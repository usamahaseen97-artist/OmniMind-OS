"use client";

import { Pause, Play, Repeat, SkipBack, SkipForward, Square } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function PlaybackControls() {
  const {
    playback,
    setPlayback,
    play,
    pause,
    stop,
    stepFrame,
    timelineView,
    setTimelineView,
    timecode,
    timelineView: tv,
  } = useVisionaryEditor();

  const isPlaying = playback.state === "playing";

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#0a0e16] px-3">
      <div className="flex items-center gap-1">
        <button type="button" onClick={stop} className="visionary-timeline-btn" title="Stop">
          <Square size={12} />
        </button>
        <button type="button" onClick={() => stepFrame(-1)} className="visionary-timeline-btn" title="Prev frame">
          <SkipBack size={12} />
        </button>
        <button
          type="button"
          onClick={isPlaying ? pause : play}
          className="visionary-timeline-btn rounded-full bg-cyan-500/20 px-2 text-cyan-300"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button type="button" onClick={() => stepFrame(1)} className="visionary-timeline-btn" title="Next frame">
          <SkipForward size={12} />
        </button>
        <button
          type="button"
          onClick={() => setTimelineView((v) => ({ ...v, loopEnabled: !v.loopEnabled }))}
          className={cn("visionary-timeline-btn", tv.loopEnabled && "text-cyan-400")}
          title="Loop"
        >
          <Repeat size={12} />
        </button>
      </div>

      <span className="font-mono text-[11px] text-cyan-300">{timecode(tv.playheadFrame)}</span>

      <div className="flex items-center gap-2">
        <span className="text-[9px] text-slate-600">Speed</span>
        <select
          value={playback.speed}
          onChange={(e) => setPlayback((p) => ({ ...p, speed: Number(e.target.value) }))}
          className="rounded border border-white/10 bg-black/40 px-1 py-0.5 text-[9px] text-slate-300"
        >
          <option value={0.25}>0.25×</option>
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={1.5}>1.5×</option>
          <option value={2}>2×</option>
        </select>
      </div>
    </div>
  );
}
