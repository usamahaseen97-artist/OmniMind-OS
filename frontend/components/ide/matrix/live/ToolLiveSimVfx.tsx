"use client";

import { useWorkbenchLive } from "../../../../lib/workbench-live-store";

const TRACKS = [
  { id: "V1", label: "Video 1 · Main", clips: ["intro.mp4", "scene_a.mp4"] },
  { id: "V2", label: "Video 2 · B-Roll", clips: ["broll_01.mp4"] },
  { id: "A1", label: "Audio · Dialogue", clips: ["vo.wav"] },
  { id: "FX", label: "FX · Overlays", clips: ["lightning.cube", "grade.lut"] },
  { id: "Grade", label: "Color · Grade", clips: ["cinematic.cube"] },
];

export function ToolLiveSimVfx() {
  const live = useWorkbenchLive();

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "#0B0F19" }}>
      <div className="flex shrink-0 items-center gap-3 border-b px-3 py-1.5 text-[8px]" style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        <span>00:00:00:00</span>
        <span className="omni-accent-text">▶</span>
        <span>01:24:08:12</span>
        {live.streaming ? <span className="ml-auto animate-pulse omni-accent-text">AI stitching…</span> : null}
      </div>
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-2">
        {TRACKS.map((track) => (
          <div key={track.id} className="mb-2">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="w-12 font-mono text-[9px] omni-accent-text">{track.id}</span>
              <span className="text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
                {track.label}
              </span>
            </div>
            <div
              className="relative flex min-h-[36px] items-stretch gap-1 rounded border px-1 py-1 omni-state-ring"
              style={{ borderColor: "#1E293B", background: "color-mix(in srgb, var(--omni-panel) 90%, black)" }}
            >
              {track.clips.map((clip, i) => (
                <div
                  key={clip}
                  className="flex cursor-grab items-center rounded px-2 text-[8px] omni-accent-text active:cursor-grabbing"
                  style={{
                    width: `${28 + i * 12}%`,
                    background: "color-mix(in srgb, var(--omni-accent) 18%, transparent)",
                    border: "1px solid #1E293B",
                  }}
                >
                  {clip}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
