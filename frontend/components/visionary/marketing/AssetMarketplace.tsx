"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function AssetMarketplace({ compact = false }: { compact?: boolean }) {
  const { marketplaceTemplates } = useVisionaryMarketing();
  const assets = marketplaceTemplates.filter((t) => t.category === "asset");

  if (compact) {
    return (
      <div className="border-t border-white/[0.06] p-2">
        <p className="mb-1 text-[8px] uppercase text-slate-600">Assets</p>
        <p className="text-[8px] text-slate-500">{assets.length} marketplace items</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Asset Marketplace</p>
      {marketplaceTemplates.map((t) => (
        <p key={t.id} className="text-[9px] text-slate-500">{t.name}</p>
      ))}
    </div>
  );
}
