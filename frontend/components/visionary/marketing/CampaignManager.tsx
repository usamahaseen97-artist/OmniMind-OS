"use client";

import { Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AD_PLATFORMS } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function CampaignManager({ full = false }: { full?: boolean }) {
  const {
    project,
    activeCampaign,
    setActiveCampaignId,
    addCampaign,
    updateCampaignStatus,
    adCreatives,
    addAdCreative,
  } = useVisionaryMarketing();

  return (
    <div className={cn("flex flex-col", full ? "h-full" : "max-h-[40%]")}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-2 py-1.5">
        <p className="text-[9px] font-semibold uppercase text-slate-500">Campaigns</p>
        <button type="button" onClick={() => addCampaign("New Campaign", "Awareness")} className="text-violet-400">
          <Plus size={12} />
        </button>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
        {project.campaigns.map((c) => (
          <li key={c.id} className="mb-1">
            <button
              type="button"
              onClick={() => setActiveCampaignId(c.id)}
              className={cn(
                "w-full rounded px-2 py-1.5 text-left",
                project.activeCampaignId === c.id ? "bg-violet-500/10 text-violet-200" : "text-slate-500 hover:bg-white/[0.03]",
              )}
            >
              <p className="text-[10px] font-medium">{c.name}</p>
              <p className="text-[8px] text-slate-600">{c.status} · ${c.budget.toLocaleString()}</p>
            </button>
          </li>
        ))}
      </ul>
      {full && activeCampaign ? (
        <div className="border-t border-white/[0.06] p-3">
          <h3 className="text-sm font-semibold text-white">{activeCampaign.name}</h3>
          <p className="mt-1 text-[10px] text-slate-500">{activeCampaign.objective}</p>
          <div className="mt-3 flex gap-1">
            {(["active", "paused", "completed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateCampaignStatus(activeCampaign.id, s)}
                className="rounded border border-white/10 px-2 py-0.5 text-[8px] text-slate-400 capitalize"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[9px] uppercase text-slate-600">Ad Creatives</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {AD_PLATFORMS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addAdCreative(p.id)}
                className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[8px] text-slate-500"
              >
                + {p.label}
              </button>
            ))}
          </div>
          <ul className="mt-2 space-y-1">
            {adCreatives.map((ad) => (
              <li key={ad.id} className="rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
                {ad.platform} · {ad.headline} · A/B {ad.abTestGroup}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
