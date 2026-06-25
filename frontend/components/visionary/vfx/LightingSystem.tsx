"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function LightingSystem() {
  const { sceneObjects } = useVisionaryVFX();
  const lights = sceneObjects.filter((o) => o.type === "light");

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Lights</p>
      <ul className="space-y-1">
        {lights.map((light) => (
          <li key={light.id} className="rounded bg-white/[0.03] p-1.5">
            <span className="text-[10px] text-slate-300">{light.name}</span>
            <p className="text-[8px] text-slate-600">
              pos ({light.position[0]}, {light.position[1]}, {light.position[2]})
            </p>
          </li>
        ))}
        {lights.length === 0 ? (
          <li className="text-[8px] text-slate-600">Add a light from Scene hierarchy</li>
        ) : null}
      </ul>
    </div>
  );
}
