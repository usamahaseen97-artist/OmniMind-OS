"use client";

import { TRANSITION_PRESETS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function TransitionsBrowser() {
  const { applyTransition, selectedClip } = useVisionaryEditor();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Transitions</p>
      <div className="grid grid-cols-2 gap-1">
        {TRANSITION_PRESETS.map((tr) => (
          <button
            key={tr.id}
            type="button"
            disabled={!selectedClip}
            onClick={() => applyTransition(tr.id, "in")}
            className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-2 text-left text-[10px] text-slate-300 hover:border-cyan-500/30 disabled:opacity-40"
          >
            {tr.name}
            <span className="block text-[8px] text-slate-600">{tr.durationFrames}f</span>
          </button>
        ))}
      </div>
    </div>
  );
}
