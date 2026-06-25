"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function RotoBrush() {
  const { masks, addMask, updateMask } = useVisionaryVFX();
  const rotoMasks = masks.filter((m) => m.label.toLowerCase().includes("roto"));

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Roto Brush</p>
        <button type="button" onClick={() => addMask("Roto Mask")} className="text-[9px] text-fuchsia-400">
          + Roto
        </button>
      </div>
      <ul className="space-y-1">
        {rotoMasks.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1">
            <span className="text-[10px] text-slate-300">{m.label}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={m.feather}
              onChange={(e) => updateMask(m.id, { feather: Number(e.target.value) })}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
