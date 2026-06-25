"use client";

import { MATERIAL_PRESETS } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function MaterialEditor({ full = false }: { full?: boolean }) {
  const { materials, selectedMaterialId, setSelectedMaterialId, addMaterial, updateMaterial } = useVisionaryStudio3D();

  return (
    <div className={full ? "h-full overflow-y-auto p-4" : "border-b border-white/[0.06] p-2"}>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Material Editor · PBR</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {MATERIAL_PRESETS.map((p) => (
          <button key={p.id} type="button" onClick={() => addMaterial(p.label, p.id)} className="rounded border border-white/[0.06] px-1 py-0.5 text-[7px] text-slate-500">{p.label}</button>
        ))}
      </div>
      <ul className="space-y-1">
        {materials.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => setSelectedMaterialId(m.id)} className={`w-full rounded px-2 py-1 text-left text-[10px] ${selectedMaterialId === m.id ? "bg-cyan-500/10 text-cyan-200" : "text-slate-400"}`}>
              {m.name} · {m.preset}
            </button>
            {selectedMaterialId === m.id ? (
              <div className="mt-1 space-y-1 px-2">
                <input type="color" value={m.baseColor} onChange={(e) => updateMaterial(m.id, { baseColor: e.target.value })} className="h-5 w-full" />
                {(["metallic", "roughness", "emission", "opacity"] as const).map((k) => (
                  <input key={k} type="range" min={0} max={1} step={0.05} value={m[k]} onChange={(e) => updateMaterial(m.id, { [k]: Number(e.target.value) })} />
                ))}
                <p className="text-[7px] text-slate-600">Normal map: {m.normalMap ?? "none"}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
