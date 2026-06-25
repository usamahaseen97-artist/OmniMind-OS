"use client";

import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function LightingStudio() {
  const lights = useVisionaryStudio3D().objects.filter((o) => o.type === "light");

  return (
    <div className="border-b border-white/[0.06] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Lighting</p>
      {lights.map((l) => (
        <p key={l.id} className="text-[9px] text-slate-400">{l.name} · ({l.position.join(", ")})</p>
      ))}
    </div>
  );
}
