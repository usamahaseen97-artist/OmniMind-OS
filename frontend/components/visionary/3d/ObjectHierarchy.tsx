"use client";

import { cn } from "../../../lib/utils";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function ObjectHierarchy() {
  const { objects, collections, selectedObjectId, setSelectedObjectId, addObject, updateObject } = useVisionaryStudio3D();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-2 py-1">
        <p className="text-[9px] uppercase text-slate-600">Hierarchy</p>
        <div className="flex gap-0.5">
          {(["mesh", "camera", "light", "empty", "armature"] as const).map((t) => (
            <button key={t} type="button" onClick={() => addObject(t, t)} className="text-[7px] text-cyan-400">+{t[0]}</button>
          ))}
        </div>
      </div>
      {collections.map((col) => (
        <div key={col.id} className="px-1 py-0.5">
          <p className="text-[8px] uppercase text-slate-600">{col.name}</p>
          {objects.filter((o) => o.collectionId === col.id).map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => setSelectedObjectId(obj.id)}
              className={cn(
                "flex w-full items-center gap-1 rounded px-2 py-0.5 text-left text-[10px]",
                selectedObjectId === obj.id ? "bg-cyan-500/10 text-cyan-200" : "text-slate-400",
              )}
            >
              <span className="text-[7px] uppercase text-slate-600">{obj.type}</span>
              {obj.name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { visible: !obj.visible }); }}
                className="ml-auto text-[8px]"
              >
                {obj.visible ? "👁" : "—"}
              </button>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
