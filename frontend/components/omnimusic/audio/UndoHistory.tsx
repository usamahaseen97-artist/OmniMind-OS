"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function UndoHistory() {
  const { canUndo, canRedo, undo, redo, undoLabels } = useOmniMusicStudio();

  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={!canUndo} onClick={undo} className="text-[8px] text-slate-500 disabled:opacity-40">Undo</button>
      <button type="button" disabled={!canRedo} onClick={redo} className="text-[8px] text-slate-500 disabled:opacity-40">Redo</button>
      {undoLabels[0] ? <span className="truncate text-[8px] text-slate-600">{undoLabels[0]}</span> : null}
    </div>
  );
}
