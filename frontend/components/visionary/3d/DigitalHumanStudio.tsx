"use client";

import { DIGITAL_HUMAN_ROLES } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function DigitalHumanStudio() {
  const { digitalHumans, createDigitalHuman } = useVisionaryStudio3D();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-cyan-400">Digital Human Engine</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {DIGITAL_HUMAN_ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => createDigitalHuman(r.label, r.id)}
            className="rounded border border-white/[0.06] px-2 py-2 text-left text-[8px] text-slate-500 hover:border-cyan-400/40"
          >
            {r.label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {digitalHumans.map((h) => (
          <li key={h.id} className="rounded border border-cyan-500/20 bg-cyan-500/5 p-2">
            <p className="text-[10px] text-cyan-200">{h.name}</p>
            <p className="text-[8px] text-slate-600">{h.role} · Lip sync {h.lipSyncEnabled ? "on" : "off"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
