"use client";

import { Building2, Lock, Users } from "lucide-react";
import { useOmniMindMarketplace } from "../../lib/omnimind-marketplace-context";
import { MarketplaceListingCard } from "./MarketplaceListingCard";

export function MarketplaceEnterprisePanel() {
  const mp = useOmniMindMarketplace();

  return (
    <div className="h-full overflow-y-auto p-4">
      <header className="mb-4">
        <h2 className="text-sm font-bold text-zinc-100">Enterprise Store</h2>
        <p className="text-[10px] text-zinc-500">
          Private organization stores — internal agents, restricted plugins, role-based visibility
        </p>
      </header>

      {mp.enterpriseStores.map((store) => (
        <section key={store.orgId} className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-violet-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">{store.name}</h3>
              <p className="text-[9px] text-zinc-500">Org ID: {store.orgId}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-[9px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {store.privateListingIds.length} private listings
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {Object.keys(store.roles).length} roles configured
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {mp.enterpriseReady.slice(0, 4).map((listing) => (
              <MarketplaceListingCard
                key={`${store.orgId}-${listing.id}`}
                listing={{ ...listing, enterpriseOnly: true }}
                installed={mp.isInstalled(listing)}
                bookmarked={mp.isBookmarked(listing.id)}
                onInstall={() => void mp.install(listing)}
                onUninstall={() => void mp.uninstall(listing)}
                onBookmark={() => mp.bookmark(listing.id)}
                compact
              />
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[10px] text-zinc-500">
        <p className="font-medium text-zinc-300">Restricted Distribution</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Private plugins visible only to org members</li>
          <li>Internal AI agents and company workflows</li>
          <li>Company themes and internal templates</li>
          <li>Admin / developer / viewer role gates</li>
        </ul>
      </section>
    </div>
  );
}
