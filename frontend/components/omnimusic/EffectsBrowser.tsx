"use client";

import { INTERNAL_PLUGINS } from "../../lib/omnimusic-studio/constants";

export function EffectsBrowser() {
  return (
    <div className="p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Effects</p>
      {INTERNAL_PLUGINS.map((p) => (
        <p key={p.id} className="text-[8px] text-slate-500">{p.name} · {p.category}</p>
      ))}
    </div>
  );
}
