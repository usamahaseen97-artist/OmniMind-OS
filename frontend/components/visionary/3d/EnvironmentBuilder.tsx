"use client";

import { ENVIRONMENT_TYPES } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function EnvironmentBuilder() {
  const { environmentElements, addEnvironmentElement } = useVisionaryStudio3D();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-cyan-400">Environment Builder</p>
      <div className="mb-4 grid grid-cols-3 gap-1">
        {ENVIRONMENT_TYPES.map((t) => (
          <button key={t.id} type="button" onClick={() => addEnvironmentElement(t.id, t.label)} className="rounded border border-white/[0.06] px-1 py-2 text-[8px] text-slate-500">{t.label}</button>
        ))}
      </div>
      <ul className="space-y-1">
        {environmentElements.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
            {e.name} <span className="text-slate-600">{e.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
