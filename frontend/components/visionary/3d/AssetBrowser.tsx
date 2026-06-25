"use client";

import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function AssetBrowser({ compact = false }: { compact?: boolean }) {
  const { assets } = useVisionaryStudio3D();

  return (
    <div className={compact ? "border-t border-white/[0.06] p-2" : "p-4"}>
      <p className="mb-1 text-[9px] uppercase text-slate-600">Asset Browser</p>
      <ul className="max-h-28 space-y-0.5 overflow-y-auto">
        {assets.map((a) => (
          <li key={a.id} className="text-[8px] text-slate-500">{a.name} · {a.kind}</li>
        ))}
      </ul>
    </div>
  );
}
