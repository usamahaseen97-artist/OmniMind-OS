"use client";

import { Grid3X3, Maximize2, Monitor } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function PreviewMonitor() {
  const { project, playback, setPlayback, timelineView, selectedClip, timecode } = useVisionaryEditor();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-black">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-2 py-1">
        <span className="text-[9px] text-slate-500">Program Monitor</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPlayback((p) => ({ ...p, showGrid: !p.showGrid }))}
            className={cn("rounded p-1", playback.showGrid ? "text-cyan-400" : "text-slate-600")}
          >
            <Grid3X3 size={12} />
          </button>
          <button
            type="button"
            onClick={() => setPlayback((p) => ({ ...p, showSafeMargins: !p.showSafeMargins }))}
            className={cn("rounded p-1", playback.showSafeMargins ? "text-cyan-400" : "text-slate-600")}
          >
            <Monitor size={12} />
          </button>
          <select
            value={playback.quality}
            onChange={(e) =>
              setPlayback((p) => ({
                ...p,
                quality: e.target.value as typeof p.quality,
              }))
            }
            className="rounded border border-white/10 bg-black/50 px-1 text-[9px] text-slate-400"
          >
            <option value="quarter">¼</option>
            <option value="half">½</option>
            <option value="full">Full</option>
            <option value="proxy">Proxy</option>
          </select>
          <button
            type="button"
            onClick={() => setPlayback((p) => ({ ...p, fullscreen: !p.fullscreen }))}
            className="rounded p-1 text-slate-600 hover:text-slate-300"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {playback.showGrid ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        ) : null}
        {playback.showSafeMargins ? (
          <div className="pointer-events-none absolute inset-[10%] border border-dashed border-cyan-400/30" />
        ) : null}

        <div
          className="relative overflow-hidden rounded-sm border border-white/10 shadow-2xl"
          style={{
            width: "min(100%, 640px)",
            aspectRatio: `${project.resolution.width}/${project.resolution.height}`,
            maxHeight: "100%",
            background: "linear-gradient(145deg, #1e293b, #0f172a)",
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-cyan-400/60">Frame Preview</p>
            <p className="mt-2 text-sm text-slate-200">{timecode(timelineView.playheadFrame)}</p>
            {selectedClip ? (
              <p className="mt-1 text-[10px] text-slate-500">{selectedClip.label}</p>
            ) : (
              <p className="mt-1 text-[10px] text-slate-600">No clip at playhead</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
