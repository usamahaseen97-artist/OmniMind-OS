"use client";

import { Plus } from "lucide-react";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function SubtitleEditor() {
  const { subtitles, addSubtitle, timecode } = useVisionaryEditor();

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Captions</p>
        <button type="button" onClick={addSubtitle} className="visionary-timeline-btn text-cyan-400">
          <Plus size={12} />
        </button>
      </div>
      <ul className="mt-2 space-y-2">
        {subtitles.map((s) => (
          <li key={s.id} className="rounded border border-white/[0.06] p-2">
            <p className="text-[8px] text-slate-600">
              {timecode(s.startFrame)} → {timecode(s.endFrame)}
            </p>
            <p className="text-[10px] text-slate-300">{s.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
