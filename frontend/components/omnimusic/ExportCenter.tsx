"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function ExportCenter() {
  const { exportJobs, queueExport } = useOmniMusicStudio();

  return (
    <div className="border-b border-white/[0.04] p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Export</p>
      <div className="flex flex-wrap gap-1">
        {(["wav", "mp3", "flac", "stems"] as const).map((f) => (
          <button key={f} type="button" onClick={() => queueExport(f)} className="rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500 uppercase">{f}</button>
        ))}
      </div>
      {exportJobs[0] ? <p className="mt-1 text-[8px] text-slate-600">{exportJobs[0].format} · {exportJobs[0].status}</p> : null}
    </div>
  );
}
