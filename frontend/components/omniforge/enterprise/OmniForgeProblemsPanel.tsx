"use client";

import { useOmniForgeEnterpriseOptional } from "../../../lib/omniforge-enterprise-context";

export function OmniForgeProblemsPanel() {
  const ent = useOmniForgeEnterpriseOptional();
  const items = ent?.autoFixItems ?? [];

  if (!items.length) {
    return <p className="p-3 text-[10px] text-zinc-600">No problems detected. Run build or auto-fix scan.</p>;
  }

  return (
    <div className="overflow-y-auto p-2 text-[10px]">
      {items.map((item) => (
        <div key={item.id} className="mb-1 flex gap-2 rounded border border-white/10 px-2 py-1">
          <span className={item.category === "security" ? "text-red-400" : "text-amber-400"}>{item.category}</span>
          <span className="truncate text-zinc-400">{item.file}</span>
          <span className="text-zinc-600">{item.message}</span>
        </div>
      ))}
    </div>
  );
}
