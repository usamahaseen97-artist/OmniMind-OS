"use client";

import { cn } from "../../../lib/utils";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function AutoSaveManager() {
  const { autoSave } = useVisionaryEditor();

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide",
        autoSave.status === "saved" && "bg-emerald-500/15 text-emerald-400",
        autoSave.status === "saving" && "bg-amber-500/15 text-amber-400",
        autoSave.status === "dirty" && "bg-slate-500/15 text-slate-400",
      )}
      title={autoSave.lastSavedAt ? `Last saved ${autoSave.lastSavedAt}` : "Auto-save"}
    >
      {autoSave.status}
    </span>
  );
}
