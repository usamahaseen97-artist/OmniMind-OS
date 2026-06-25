"use client";

import { Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { BLEND_MODES } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function CompositionManager() {
  const {
    project,
    activeComposition,
    setActiveCompositionId,
    addComposition,
    addLayer,
    updateLayer,
  } = useVisionaryVFX();

  return (
    <div className="flex max-h-[50%] min-h-0 flex-col border-t border-white/[0.06]">
      <div className="flex items-center justify-between px-2 py-1.5">
        <p className="text-[9px] font-semibold uppercase text-slate-500">Compositions</p>
        <button type="button" onClick={() => addComposition("Pre-comp")} className="text-fuchsia-400">
          <Plus size={12} />
        </button>
      </div>
      <ul className="shrink-0 border-b border-white/[0.04] px-1 py-1">
        {project.compositions.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setActiveCompositionId(c.id)}
              className={cn(
                "w-full truncate rounded px-2 py-1 text-left text-[10px]",
                project.activeCompositionId === c.id ? "bg-fuchsia-500/10 text-fuchsia-200" : "text-slate-500",
              )}
            >
              {c.name} {c.nested ? "(nested)" : ""}
            </button>
          </li>
        ))}
      </ul>
      {activeComposition ? (
        <>
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[8px] uppercase text-slate-600">Layers</p>
            <button type="button" onClick={() => addLayer("New Layer")} className="text-[9px] text-fuchsia-400">
              + Layer
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto px-1">
            {[...activeComposition.layers].reverse().map((layer) => (
              <li key={layer.id} className="mb-0.5 rounded border border-white/[0.04] bg-white/[0.02] p-1.5">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[10px] text-slate-300">{layer.name}</span>
                  <button
                    type="button"
                    onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                    className="text-[8px] text-slate-600"
                  >
                    {layer.visible ? "👁" : "—"}
                  </button>
                </div>
                <select
                  value={layer.blendMode}
                  onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value as typeof layer.blendMode })}
                  className="mt-1 w-full rounded border border-white/10 bg-black/40 text-[8px] text-slate-400"
                >
                  {BLEND_MODES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
