"use client";

import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

const NODE_TYPES = ["Color", "Noise", "Fresnel", "Normal Map", "Mix", "Output"];

export function ShaderEditor() {
  const { shaders, addShader } = useVisionaryStudio3D();

  return (
    <div className="border-b border-white/[0.06] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Shader Editor</p>
      <div className="mb-1 flex flex-wrap gap-0.5">
        {NODE_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => addShader(t, t.toLowerCase())} className="rounded border border-white/[0.06] px-1 text-[7px] text-slate-500">+{t}</button>
        ))}
      </div>
      {shaders.map((s) => <p key={s.id} className="text-[8px] text-slate-600">{s.label}</p>)}
    </div>
  );
}
