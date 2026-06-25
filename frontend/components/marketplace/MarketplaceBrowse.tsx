"use client";

import { Search } from "lucide-react";
import { useOmniMindMarketplace } from "../../lib/omnimind-marketplace-context";
import { MarketplaceListingCard } from "./MarketplaceListingCard";

const KIND_FILTERS = [
  { id: null, label: "All" },
  { id: "ai_tool", label: "AI Tools" },
  { id: "ai_agent", label: "Agents" },
  { id: "plugin", label: "Plugins" },
  { id: "workflow", label: "Workflows" },
  { id: "theme", label: "Themes" },
  { id: "template", label: "Templates" },
  { id: "enterprise_connector", label: "Connectors" },
  { id: "developer_sdk", label: "SDKs" },
  { id: "model_provider", label: "Models" },
] as const;

function ListingRow({ title, listings }: { title: string; listings: ReturnType<typeof useOmniMindMarketplace>["trending"] }) {
  const mp = useOmniMindMarketplace();
  if (!listings.length) return null;
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{title}</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <MarketplaceListingCard
            key={listing.id}
            listing={listing}
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
  );
}

export function MarketplaceBrowse() {
  const mp = useOmniMindMarketplace();
  const showCurated = !mp.searchQuery && !mp.selectedKind;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={mp.searchQuery}
            onChange={(e) => mp.setSearchQuery(e.target.value)}
            placeholder="Search tools, agents, workflows, themes…"
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/30 focus:outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => mp.setSelectedKind(f.id)}
              className={`rounded-full px-2.5 py-1 text-[9px] transition ${
                mp.selectedKind === f.id
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {showCurated ? (
          <>
            <ListingRow title="Trending" listings={mp.trending} />
            <ListingRow title="Editor's Choice" listings={mp.editorsChoice} />
            <ListingRow title="Enterprise Ready" listings={mp.enterpriseReady} />
            <ListingRow title="New Releases" listings={mp.newReleases} />
            <ListingRow title="Highest Rated" listings={mp.highestRated} />
            {mp.collections.map((col) => (
              <ListingRow
                key={col.id}
                title={col.title}
                listings={col.listingIds.map((id) => mp.listings.find((l) => l.id === id)).filter(Boolean) as typeof mp.trending}
              />
            ))}
          </>
        ) : (
          <section>
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {mp.filteredListings.length} results
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mp.filteredListings.map((listing) => (
                <MarketplaceListingCard
                  key={listing.id}
                  listing={listing}
                  installed={mp.isInstalled(listing)}
                  bookmarked={mp.isBookmarked(listing.id)}
                  onInstall={() => void mp.install(listing)}
                  onUninstall={() => void mp.uninstall(listing)}
                  onBookmark={() => mp.bookmark(listing.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
