"use client";

import { PHYSICS_TYPES } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function PhysicsSimulation() {
  const { physicsObjects, addPhysics } = useVisionaryVFX();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Physics</p>
      <div className="flex flex-wrap gap-1">
        {PHYSICS_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => addPhysics(item.id)}
            className="rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500 hover:border-cyan-400/50 hover:text-cyan-200"
          >
            {item.label}
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-0.5">
        {physicsObjects.map((obj) => (
          <li key={obj.id} className="text-[8px] text-slate-600">
            {obj.label} · {obj.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
