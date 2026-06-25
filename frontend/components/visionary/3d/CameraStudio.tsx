"use client";

import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function CameraStudio() {
  const cameras = useVisionaryStudio3D().objects.filter((o) => o.type === "camera");

  return (
    <div className="border-b border-white/[0.06] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Camera Studio</p>
      {cameras.map((c) => (
        <p key={c.id} className="text-[9px] text-slate-400">{c.name} · FOV · DOF — stub</p>
      ))}
    </div>
  );
}
