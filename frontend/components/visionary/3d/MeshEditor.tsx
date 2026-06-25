"use client";

import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function MeshEditor() {
  const { selectedObjectId, objects, updateObject } = useVisionaryStudio3D();
  const obj = objects.find((o) => o.id === selectedObjectId);

  if (!obj) return <div className="p-2 text-[9px] text-slate-600">Select a mesh</div>;

  return (
    <div className="border-b border-white/[0.06] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Mesh Editor</p>
      <p className="text-[10px] text-slate-400">{obj.name}</p>
      {(["position", "rotation", "scale"] as const).map((axis) => (
        <div key={axis} className="mt-1">
          <p className="text-[7px] capitalize text-slate-600">{axis}</p>
          {([0, 1, 2] as const).map((i) => (
            <input
              key={i}
              type="range"
              min={axis === "scale" ? 0.1 : -10}
              max={axis === "scale" ? 3 : 10}
              step={0.1}
              value={obj[axis][i]}
              onChange={(e) => {
                const next = [...obj[axis]] as [number, number, number];
                next[i] = Number(e.target.value);
                updateObject(obj.id, { [axis]: next });
              }}
              className="w-full"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
