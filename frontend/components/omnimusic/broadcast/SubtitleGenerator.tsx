"use client";

import { useState } from "react";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function SubtitleGenerator() {
  const { transcript, exportSubtitles } = useOmniMusicStudio();
  const [format, setFormat] = useState<"srt" | "vtt">("srt");
  const output = transcript ? exportSubtitles(format) : "";

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Subtitle Export</p>
      <div className="mb-2 flex gap-1">
        {(["srt", "vtt"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded px-2 py-0.5 text-[8px] uppercase ${format === f ? "bg-emerald-500/15 text-emerald-200" : "text-slate-600"}`}>{f}</button>
        ))}
      </div>
      <pre className="max-h-24 overflow-auto rounded bg-black/30 p-2 text-[7px] text-slate-500">{output || "Generate transcript first"}</pre>
    </div>
  );
}
