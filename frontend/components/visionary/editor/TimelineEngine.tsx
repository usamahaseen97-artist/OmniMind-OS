"use client";

import {
  ChevronDown,
  ChevronUp,
  Flag,
  Magnet,
  Map,
  Minus,
  Plus,
  SkipBack,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { cn } from "../../../lib/utils";
import { EDITOR_TRACK_COLORS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";
import { TrackManager } from "./TrackManager";

/** Professional multi-track timeline with ruler, minimap, markers, regions. */
export function TimelineEngine() {
  const {
    project,
    timelineView,
    setTimelineView,
    selectedClipId,
    setSelectedClipId,
    movePlayhead,
    timecode,
    addMarker,
    addTrack,
  } = useVisionaryEditor();

  const pxPerFrame = 0.9 * (timelineView.zoom / 100);
  const totalFrames = Math.max(project.durationFrames, timelineEngineDuration(project));
  const totalWidth = totalFrames * pxPerFrame;
  const scrollRef = useRef<HTMLDivElement>(null);

  const onRulerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineView.scrollX;
      movePlayhead(Math.floor(x / pxPerFrame));
    },
    [movePlayhead, pxPerFrame, timelineView.scrollX],
  );

  return (
    <div className="timeline-engine flex h-full min-h-0 flex-col bg-[#060a10]">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/[0.04] px-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => addTrack("video")} className="visionary-timeline-btn text-[9px] px-1.5">
            + Video
          </button>
          <button type="button" onClick={() => addTrack("audio")} className="visionary-timeline-btn text-[9px] px-1.5">
            + Audio
          </button>
          <button type="button" onClick={() => addTrack("subtitle")} className="visionary-timeline-btn text-[9px] px-1.5">
            + Sub
          </button>
          <button type="button" onClick={() => addTrack("overlay")} className="visionary-timeline-btn text-[9px] px-1.5">
            + Overlay
          </button>
          <button type="button" onClick={() => addMarker()} className="visionary-timeline-btn" title="Add marker">
            <Flag size={11} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTimelineView((v) => ({ ...v, snapEnabled: !v.snapEnabled }))}
            className={cn("visionary-timeline-btn", timelineView.snapEnabled && "text-cyan-400")}
            title="Snap"
          >
            <Magnet size={11} />
          </button>
          <button
            type="button"
            onClick={() => setTimelineView((v) => ({ ...v, magneticEnabled: !v.magneticEnabled }))}
            className={cn("visionary-timeline-btn", timelineView.magneticEnabled && "text-cyan-400")}
            title="Magnetic"
          >
            M
          </button>
          <button type="button" onClick={() => setTimelineView((v) => ({ ...v, zoom: Math.max(25, v.zoom - 25) }))} className="visionary-timeline-btn">
            <Minus size={11} />
          </button>
          <span className="text-[9px] text-slate-500">{timelineView.zoom}%</span>
          <button type="button" onClick={() => setTimelineView((v) => ({ ...v, zoom: Math.min(400, v.zoom + 25) }))} className="visionary-timeline-btn">
            <Plus size={11} />
          </button>
          <span className="font-mono text-[10px] text-cyan-300">{timecode(timelineView.playheadFrame)}</span>
        </div>
      </div>

      {/* Mini map */}
      <div className="relative h-4 shrink-0 border-b border-white/[0.04] bg-black/40">
        <div className="absolute inset-y-0 left-0 flex items-center px-1 text-[8px] text-slate-600">
          <Map size={9} className="mr-1" /> Mini map
        </div>
        {project.tracks.map((track) =>
          track.clips.map((clip) => (
            <div
              key={clip.id}
              className="absolute top-1 h-2 rounded-sm opacity-60"
              style={{
                left: `${(clip.startFrame / totalFrames) * 100}%`,
                width: `${(clip.durationFrames / totalFrames) * 100}%`,
                background: clip.color,
                minWidth: 2,
              }}
            />
          )),
        )}
        <div
          className="absolute top-0 h-full w-0.5 bg-cyan-400"
          style={{ left: `${(timelineView.playheadFrame / totalFrames) * 100}%` }}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <TrackManager />
        <div
          ref={scrollRef}
          className="relative min-w-0 flex-1 overflow-x-auto overflow-y-auto"
          onScroll={(e) => setTimelineView((v) => ({ ...v, scrollX: e.currentTarget.scrollLeft }))}
        >
          {/* Time ruler */}
          <div
            className="sticky top-0 z-20 h-6 cursor-pointer border-b border-white/[0.06] bg-[#0a0e14]"
            style={{ width: totalWidth, minWidth: "100%" }}
            onClick={onRulerClick}
          >
            {Array.from({ length: Math.ceil(totalFrames / project.fps) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute top-0 h-full border-l border-white/[0.08] text-[8px] text-slate-600"
                style={{ left: sec * project.fps * pxPerFrame }}
              >
                <span className="ml-0.5">{sec}s</span>
              </div>
            ))}
          </div>

          <div className="relative" style={{ width: totalWidth, minWidth: "100%" }}>
            {project.regions.map((r) => (
              <div
                key={r.id}
                className="pointer-events-none absolute top-0 z-10 opacity-30"
                style={{
                  left: r.startFrame * pxPerFrame,
                  width: (r.endFrame - r.startFrame) * pxPerFrame,
                  height: project.tracks.length * 52,
                  background: r.color,
                }}
                title={r.label}
              />
            ))}
            {project.markers.map((m) => (
              <div
                key={m.id}
                className="absolute top-0 z-30 h-full w-px"
                style={{ left: m.frame * pxPerFrame, background: m.color }}
                title={m.label}
              />
            ))}
            <div
              className="pointer-events-none absolute top-0 z-40 h-full w-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ left: timelineView.playheadFrame * pxPerFrame }}
            />

            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="relative border-b border-white/[0.03]"
                style={{ height: track.height }}
              >
                {track.clips.map((clip) => (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => {
                      setSelectedClipId(clip.id);
                      movePlayhead(clip.startFrame);
                    }}
                    className={cn(
                      "absolute top-1 flex h-[calc(100%-8px)] items-center overflow-hidden rounded px-1.5 text-left text-[8px] font-medium text-white/90 transition ring-1",
                      selectedClipId === clip.id ? "ring-cyan-400 z-20" : "ring-transparent",
                    )}
                    style={{
                      left: clip.startFrame * pxPerFrame,
                      width: Math.max(clip.durationFrames * pxPerFrame, 24),
                      background: `linear-gradient(90deg, ${clip.color}cc, ${clip.color}88)`,
                      borderLeft: `2px solid ${clip.color}`,
                    }}
                  >
                    <span className="truncate">{clip.label}</span>
                    {clip.effectIds.length > 0 ? (
                      <span className="ml-1 rounded bg-black/30 px-0.5 text-[7px]">FX</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function timelineEngineDuration(project: { tracks: { clips: { startFrame: number; durationFrames: number }[] }[] }) {
  let max = 0;
  for (const t of project.tracks) {
    for (const c of t.clips) max = Math.max(max, c.startFrame + c.durationFrames);
  }
  return max;
}
