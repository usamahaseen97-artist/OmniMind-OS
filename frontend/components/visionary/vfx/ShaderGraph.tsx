"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

const SHADER_NODE_TYPES = ["Color", "Noise", "Fresnel", "Mix", "Output"];

export function ShaderGraph() {
  const { shaders, addShader } = useVisionaryVFX();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Shader Graph</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {SHADER_NODE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addShader(t)}
            className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[8px] text-slate-500 hover:text-fuchsia-300"
          >
            + {t}
          </button>
        ))}
      </div>
      <ul className="space-y-0.5">
        {shaders.map((n) => (
          <li key={n.id} className="text-[9px] text-slate-500">
            {n.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
