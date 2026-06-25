"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function TemplateMarketplace() {
  const { marketplaceTemplates, plugins, installPlugin } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-violet-400">Template Marketplace</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {marketplaceTemplates.map((t) => (
          <div key={t.id} className="rounded-lg border border-white/[0.06] p-3">
            <p className="text-[10px] text-slate-300">{t.name}</p>
            <p className="text-[8px] text-slate-600">{t.platform} · {t.category}</p>
            {t.premium ? <span className="text-[7px] text-amber-400">Premium</span> : null}
          </div>
        ))}
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Marketing Plugins</p>
      {plugins.map((p) => (
        <div key={p.id} className="mb-2 flex items-center justify-between rounded bg-white/[0.03] px-2 py-1.5">
          <span className="text-[10px] text-slate-400">{p.name}</span>
          {p.installed ? (
            <span className="text-[8px] text-emerald-400">Installed</span>
          ) : (
            <button type="button" onClick={() => installPlugin(p.id)} className="text-[8px] text-violet-400">Install</button>
          )}
        </div>
      ))}
    </div>
  );
}
