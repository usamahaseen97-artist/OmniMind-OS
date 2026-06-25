"use client";

import { Download, FileVideo, Image, Settings2 } from "lucide-react";

const EXPORT_PRESETS = [
  { id: "4k", label: "4K Master", format: "ProRes 422", icon: FileVideo },
  { id: "web", label: "Web Optimized", format: "H.264 MP4", icon: FileVideo },
  { id: "social", label: "Social Vertical", format: "H.265 9:16", icon: Image },
  { id: "stills", label: "Frame Stills", format: "PNG Sequence", icon: Image },
];

export function VisionaryExportCenter({ compact = false }: { compact?: boolean }) {
  return (
    <div className="visionary-export-center flex h-full flex-col">
      <div className="shrink-0 border-b border-white/[0.06] px-2 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Export Center</p>
      </div>

      <div className={compact ? "flex-1 overflow-y-auto p-2" : "grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto p-3"}>
        {EXPORT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5"
          >
            <preset.icon size={16} className="shrink-0 text-cyan-400/80" />
            <div>
              <p className="text-[11px] font-medium text-slate-200">{preset.label}</p>
              <p className="text-[9px] text-slate-500">{preset.format}</p>
            </div>
          </button>
        ))}
      </div>

      {!compact ? (
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/20 py-2 text-[11px] font-medium text-cyan-100 hover:bg-cyan-500/30"
          >
            <Download size={14} />
            Queue Export
          </button>
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-white/[0.08] py-1.5 text-[10px] text-slate-400 hover:text-slate-200"
          >
            <Settings2 size={12} />
            Advanced settings
          </button>
        </div>
      ) : null}
    </div>
  );
}
