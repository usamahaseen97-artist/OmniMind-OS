"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function AtmosMixer() {
  const { spatialMix, updateSpatialObject } = useOmniMusicStudio();

  return (
    <div className="rounded border border-violet-500/20 bg-violet-500/5 p-2">
      <p className="mb-2 text-[9px] font-medium text-violet-200">Atmos Object Mixer · 3D panning</p>
      {spatialMix.objects.map((obj) => (
        <div key={obj.id} className="mb-2 rounded border border-white/[0.04] p-2 text-[8px]">
          <span className="text-slate-400">{obj.label}</span>
          <div className="mt-1 grid grid-cols-3 gap-1">
            <label className="text-slate-600">X<input type="range" min={-1} max={1} step={0.1} value={obj.x} onChange={(e) => updateSpatialObject(obj.id, { x: Number(e.target.value) })} className="w-full" /></label>
            <label className="text-slate-600">Y<input type="range" min={-1} max={1} step={0.1} value={obj.y} onChange={(e) => updateSpatialObject(obj.id, { y: Number(e.target.value) })} className="w-full" /></label>
            <label className="text-slate-600">Z<input type="range" min={-1} max={1} step={0.1} value={obj.z} onChange={(e) => updateSpatialObject(obj.id, { z: Number(e.target.value) })} className="w-full" /></label>
          </div>
        </div>
      ))}
    </div>
  );
}
