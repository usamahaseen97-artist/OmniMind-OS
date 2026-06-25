"use client";

import { PARTICLE_PRESETS } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function ParticleSystem() {
  const { particles, addParticle } = useVisionaryVFX();

  return (
    <div className="p-2">
      <p className="mb-2 text-[9px] font-semibold uppercase text-slate-500">Particle System</p>
      <div className="grid grid-cols-3 gap-1">
        {PARTICLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => addParticle(preset.id)}
            className="rounded border border-white/[0.06] px-1 py-1 text-[8px] text-slate-500 hover:border-fuchsia-400/50 hover:text-fuchsia-200"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-0.5">
        {particles.map((p) => (
          <li key={p.id} className="text-[8px] text-slate-600">
            {p.preset} · count {p.count} · {p.enabled ? "on" : "off"}
          </li>
        ))}
      </ul>
    </div>
  );
}
