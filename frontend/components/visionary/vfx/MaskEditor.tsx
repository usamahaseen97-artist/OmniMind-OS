"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function MaskEditor() {
  const { masks, addMask, updateMask } = useVisionaryVFX();

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Masks</p>
        <button type="button" onClick={() => addMask("Bezier Mask")} className="text-[9px] text-fuchsia-400">
          + Mask
        </button>
      </div>
      <ul className="space-y-1">
        {masks.map((m) => (
          <li key={m.id} className="rounded border border-white/[0.04] p-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-300">{m.label}</span>
              <button
                type="button"
                onClick={() => updateMask(m.id, { inverted: !m.inverted })}
                className="text-[8px] text-slate-500"
              >
                {m.inverted ? "INV" : "NORM"}
              </button>
            </div>
            <p className="text-[8px] text-slate-600">feather {m.feather}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
