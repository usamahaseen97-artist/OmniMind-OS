"use client";

import { useState } from "react";
import { ChevronUp, Download, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { EXPORT_PRESETS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function ExportQueue({ compact = false }: { compact?: boolean }) {
  const { exportJobs, queueExport, cancelExport } = useVisionaryEditor();
  const [open, setOpen] = useState(!compact);

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-[#060a10]">
      <div className="flex h-7 items-center justify-between px-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-slate-300"
        >
          <Download size={11} />
          Export Queue ({exportJobs.filter((j) => j.status !== "completed").length})
          <ChevronUp size={11} className={cn(!open && "rotate-180")} />
        </button>
        <div className="flex gap-1">
          {EXPORT_PRESETS.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => queueExport(p.id)}
              className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[8px] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-300"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {open ? (
        <ul className="max-h-24 overflow-y-auto px-2 pb-2">
          {exportJobs.length === 0 ? (
            <li className="py-2 text-center text-[9px] text-slate-600">No export jobs</li>
          ) : (
            exportJobs.map((job) => (
              <li key={job.id} className="mb-1 flex items-center gap-2 rounded bg-white/[0.02] px-2 py-1">
                <span className="min-w-0 flex-1 truncate text-[9px] text-slate-400">
                  {job.platform} · {job.resolution} {job.hdr ? "HDR" : ""} · {job.status}
                </span>
                {job.status === "queued" || job.status === "rendering" ? (
                  <button type="button" onClick={() => cancelExport(job.id)} className="text-slate-600 hover:text-rose-400">
                    <X size={10} />
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
