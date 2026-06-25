"use client";

import { Undo2, Redo2 } from "lucide-react";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function HistoryPanel({ compact = false }: { compact?: boolean }) {
  const { editorHistory, undo, redo } = useVisionaryEditor();

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button type="button" onClick={undo} className="visionary-timeline-btn" title="Undo">
          <Undo2 size={12} />
        </button>
        <button type="button" onClick={redo} className="visionary-timeline-btn" title="Redo">
          <Redo2 size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <p className="shrink-0 border-b border-white/[0.06] px-2 py-2 text-[9px] uppercase text-slate-500">
        Edit History
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-[9px] text-slate-500">
        {editorHistory.map((e) => (
          <li key={e.id} className="border-b border-white/[0.03] py-1">
            {e.timestamp.slice(11, 19)} · {e.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
