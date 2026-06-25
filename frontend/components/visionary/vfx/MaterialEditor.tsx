"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

const MATERIAL_PRESETS = ["Standard", "Glass", "Metal", "Emissive", "Toon"];

export function MaterialEditor() {
  const { materials, addMaterial, updateMaterial, selectedMaterialId, setSelectedMaterialId } = useVisionaryVFX();

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Materials</p>
        <button type="button" onClick={() => addMaterial()} className="text-[9px] text-fuchsia-400">
          + Material
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {MATERIAL_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => addMaterial(p)}
            className="rounded border border-white/[0.06] px-1 py-0.5 text-[7px] text-slate-500"
          >
            {p}
          </button>
        ))}
      </div>
      <ul className="space-y-1">
        {materials.map((mat) => (
          <li key={mat.id}>
            <button
              type="button"
              onClick={() => setSelectedMaterialId(mat.id)}
              className={`w-full rounded px-2 py-1 text-left text-[10px] ${
                selectedMaterialId === mat.id ? "bg-fuchsia-500/10 text-fuchsia-200" : "text-slate-400"
              }`}
            >
              {mat.name}
            </button>
            {selectedMaterialId === mat.id ? (
              <input
                type="color"
                value={mat.baseColor}
                onChange={(e) => updateMaterial(mat.id, { baseColor: e.target.value })}
                className="mt-1 h-5 w-full"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
