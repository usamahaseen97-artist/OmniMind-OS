"use client";

import { EFFECT_PRESETS } from "../../../lib/visionary/editor/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function EffectStack() {
  const { effectStack, addEffect, toggleEffect } = useVisionaryVFX();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Effect Stack</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {EFFECT_PRESETS.slice(0, 6).map((fx) => (
          <button
            key={fx.id}
            type="button"
            onClick={() => addEffect(fx.id, fx.name)}
            className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[8px] text-slate-400 hover:text-fuchsia-300"
          >
            + {fx.name}
          </button>
        ))}
      </div>
      <ul className="space-y-1">
        {effectStack.map((fx) => (
          <li key={fx.id} className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1">
            <button type="button" onClick={() => toggleEffect(fx.id)} className="text-[10px] text-slate-300">
              {fx.enabled ? "●" : "○"} {fx.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
