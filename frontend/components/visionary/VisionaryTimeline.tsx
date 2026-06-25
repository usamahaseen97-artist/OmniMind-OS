"use client";

import {
  ChevronDown,
  ChevronUp,
  Flag,
  Pause,
  Play,
  SkipBack,
  Volume2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { TRACK_KIND_COLORS } from "../../lib/visionary/constants";
import { useVisionaryStudio } from "../../lib/visionary";

function frameToTime(frame: number, fps: number) {
  const s = Math.floor(frame / fps);
  const f = frame % fps;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

export function VisionaryTimeline() {
  const {
    project,
    tracks,
    playheadFrame,
    setPlayheadFrame,
    timelineZoom,
    setTimelineZoom,
    isPlaying,
    setIsPlaying,
    markers,
    addMarker,
    dock,
    toggleTimeline,
    undoStack,
    versions,
    autoSaveStatus,
  } = useVisionaryStudio();

  const pxPerFrame = 0.8 * (timelineZoom / 100);
  const totalWidth = project.durationFrames * pxPerFrame;

  if (dock.timelineCollapsed) {
    return (
      <div className="flex h-7 shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#060a10] px-2">
        <span className="text-[9px] text-slate-500">Timeline collapsed</span>
        <button
          type="button"
          onClick={toggleTimeline}
          className="rounded p-0.5 text-slate-500 hover:text-slate-300"
          aria-label="Expand timeline"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="visionary-timeline flex min-h-0 flex-col border-t border-white/[0.06] bg-[#060a10]">
      <div className="flex h-8 shrink-0 items-center justify-between gap-2 border-b border-white/[0.04] px-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPlayheadFrame(0)} className="visionary-timeline-btn">
            <SkipBack size={12} />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="visionary-timeline-btn text-cyan-300"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <span className="ml-2 font-mono text-[10px] text-slate-300">
            {frameToTime(playheadFrame, project.fps)}
          </span>
          <span className="text-[9px] text-slate-600">/ {frameToTime(project.durationFrames, project.fps)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addMarker("Marker")}
            className="visionary-timeline-btn"
            title="Add marker"
          >
            <Flag size={11} />
          </button>
          <button type="button" onClick={() => setTimelineZoom((z) => Math.max(25, z - 25))} className="visionary-timeline-btn">
            <ZoomOut size={11} />
          </button>
          <span className="text-[9px] text-slate-500">{timelineZoom}%</span>
          <button type="button" onClick={() => setTimelineZoom((z) => Math.min(400, z + 25))} className="visionary-timeline-btn">
            <ZoomIn size={11} />
          </button>
          <span className="hidden text-[8px] text-slate-600 sm:inline">
            Undo {undoStack.length} · Versions {versions.length} · {autoSaveStatus}
          </span>
          <button type="button" onClick={toggleTimeline} className="visionary-timeline-btn" aria-label="Collapse timeline">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-36 shrink-0 overflow-y-auto border-r border-white/[0.04]">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex h-7 items-center gap-1 border-b border-white/[0.03] px-2 text-[9px]"
            >
              <Volume2 size={9} className={cn(track.muted ? "text-slate-600" : "text-slate-400")} />
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: TRACK_KIND_COLORS[track.kind] }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-400">{track.label}</span>
            </div>
          ))}
        </div>

        <div className="relative min-w-0 flex-1 overflow-x-auto overflow-y-auto">
          <div className="relative" style={{ width: totalWidth, minWidth: "100%" }}>
            {markers.map((m) => (
              <div
                key={m.id}
                className="pointer-events-none absolute top-0 z-20 h-full w-px"
                style={{ left: m.frame * pxPerFrame, background: m.color }}
                title={m.label}
              />
            ))}

            <div
              className="pointer-events-none absolute top-0 z-30 h-full w-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ left: playheadFrame * pxPerFrame }}
            />

            {tracks.map((track) => (
              <div
                key={track.id}
                className="relative h-7 border-b border-white/[0.03] bg-black/20"
              >
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="absolute top-0.5 flex h-6 items-center overflow-hidden rounded px-1.5 text-[8px] font-medium text-white/90"
                    style={{
                      left: clip.startFrame * pxPerFrame,
                      width: clip.durationFrames * pxPerFrame,
                      background: `linear-gradient(90deg, ${clip.color}cc, ${clip.color}88)`,
                      borderLeft: `2px solid ${clip.color}`,
                    }}
                  >
                    <span className="truncate">{clip.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
