"use client";

import Link from "next/link";
import { Download, ExternalLink, Puzzle } from "lucide-react";
import { useMemo } from "react";
import { getMarketplaceCatalog } from "../../../../../core/marketplace";
import { getMarketplaceSync } from "../../../../../core/marketplace/sync";
import { useOmniMindMarketplaceOptional } from "../../../../../lib/omnimind-marketplace-context";
import type { MarketplaceListing } from "../../../../../core/marketplace/types";

/** Extensions panel — links to marketplace and shows installed listings. */
export function OmniForgeExtensionsPanel() {
  const mp = useOmniMindMarketplaceOptional();
  const catalog = useMemo(() => getMarketplaceCatalog(), []);
  const installedIds = mp?.syncState.installedPlugins ?? getMarketplaceSync().getState().installedPlugins;

  const installed = useMemo((): MarketplaceListing[] =>
      installedIds
        .map((id: string) => catalog.get(id) ?? catalog.all().find((l: MarketplaceListing) => l.manifest?.id === id))
        .filter((l): l is MarketplaceListing => !!l)
        .slice(0, 8),
    [catalog, installedIds],
  );

  const featured = useMemo(() => catalog.trending(5), [catalog]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <Puzzle className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Extensions</span>
        </div>
        <Link
          href="/marketplace"
          className="flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[8px] text-cyan-300 hover:bg-cyan-500/20"
        >
          <ExternalLink className="h-3 w-3" />
          Marketplace
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {installed.length ? (
          <>
            <p className="mb-1 px-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">Installed</p>
            {installed.map((ext: MarketplaceListing) => (
              <div
                key={ext.id}
                className="mb-1 flex items-center justify-between rounded border border-white/[0.06] px-2 py-2"
              >
                <div>
                  <p className="text-[10px] font-medium text-zinc-300">{ext.name}</p>
                  <p className="text-[8px] text-emerald-500">Active</p>
                </div>
              </div>
            ))}
          </>
        ) : null}

        <p className="mb-1 mt-2 px-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">Featured</p>
        {featured.map((ext: MarketplaceListing) => {
          const isInstalled = installedIds.includes(ext.id) || (ext.manifest && installedIds.includes(ext.manifest.id));
          return (
            <div
              key={ext.id}
              className="mb-1 flex items-center justify-between rounded border border-white/[0.06] px-2 py-2"
            >
              <div>
                <p className="text-[10px] font-medium text-zinc-300">{ext.name}</p>
                <p className="text-[8px] text-zinc-600">{isInstalled ? "Installed" : ext.category}</p>
              </div>
              {!isInstalled ? (
                <Link
                  href="/marketplace"
                  className="flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[8px] text-cyan-300"
                >
                  <Download className="h-3 w-3" />
                  Get
                </Link>
              ) : (
                <span className="text-[8px] text-emerald-500">Active</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
