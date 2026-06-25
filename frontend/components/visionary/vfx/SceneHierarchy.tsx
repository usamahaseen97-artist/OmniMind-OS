"use client";

import { cn } from "../../../lib/utils";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function SceneHierarchy() {
  const { sceneObjects, selectedObjectId, setSelectedObjectId, addSceneObject } = useVisionaryVFX();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-2 py-1.5">
        <p className="text-[9px] font-semibold uppercase text-slate-500">Scene</p>
        <div className="flex gap-1">
          {(["mesh", "camera", "light", "empty"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addSceneObject(type)}
              className="rounded px-1 text-[8px] text-fuchsia-400 hover:bg-fuchsia-500/10"
            >
              +{type[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
        {sceneObjects.map((obj) => (
          <li key={obj.id}>
            <button
              type="button"
              onClick={() => setSelectedObjectId(obj.id)}
              className={cn(
                "flex w-full items-center gap-1 rounded px-2 py-1 text-left text-[10px]",
                selectedObjectId === obj.id ? "bg-fuchsia-500/10 text-fuchsia-200" : "text-slate-400",
                obj.parentId && "pl-4",
              )}
            >
              <span className="text-[8px] uppercase text-slate-600">{obj.type}</span>
              {obj.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
