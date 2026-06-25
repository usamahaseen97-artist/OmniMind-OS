"use client";

import { EFFECT_PRESETS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function EffectsBrowser() {
  const { applyEffect, selectedClip } = useVisionaryEditor();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Video Effects</p>
      <div className="grid grid-cols-2 gap-1">
        {EFFECT_PRESETS.map((fx) => (
          <button
            key={fx.id}
            type="button"
            disabled={!selectedClip}
            onClick={() => applyEffect(fx.id)}
            className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-2 text-left text-[10px] text-slate-300 hover:border-cyan-500/30 disabled:opacity-40"
          >
            {fx.name}
          </button>
        ))}
      </div>
    </div>
  );
}
