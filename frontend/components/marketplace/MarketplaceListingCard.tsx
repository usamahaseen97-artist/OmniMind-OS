"use client";

import { Bookmark, Download, Shield, Star, Trash2 } from "lucide-react";
import type { MarketplaceListing } from "../../core/marketplace/types";
import { MONETIZATION_MODELS } from "../../core/marketplace";
import { cn } from "../../lib/utils";

type Props = {
  listing: MarketplaceListing;
  installed?: boolean;
  bookmarked?: boolean;
  onInstall?: () => void;
  onUninstall?: () => void;
  onBookmark?: () => void;
  compact?: boolean;
};

const BADGE_LABELS: Record<string, string> = {
  trending: "Trending",
  editors_choice: "Editor's Choice",
  verified: "Verified",
  enterprise_ready: "Enterprise",
  new_release: "New",
};

export function MarketplaceListingCard({
  listing,
  installed,
  bookmarked,
  onInstall,
  onUninstall,
  onBookmark,
  compact,
}: Props) {
  const pricing = MONETIZATION_MODELS[listing.pricing];

  return (
    <article
      className={cn(
        "group flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] transition hover:border-cyan-500/20 hover:bg-white/[0.04]",
        compact ? "p-2.5" : "p-3.5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={cn("truncate font-semibold text-zinc-100", compact ? "text-[11px]" : "text-xs")}>
            {listing.name}
          </h3>
          <p className="mt-0.5 text-[9px] text-zinc-500">
            {listing.author} · v{listing.version}
          </p>
        </div>
        <button
          type="button"
          onClick={onBookmark}
          className={cn(
            "shrink-0 rounded p-1 transition",
            bookmarked ? "text-amber-400" : "text-zinc-600 hover:text-zinc-400",
          )}
          aria-label="Bookmark"
        >
          <Bookmark className="h-3.5 w-3.5" fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {!compact ? (
        <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-zinc-400">{listing.description}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1">
        {listing.badges.slice(0, 2).map((b) => (
          <span key={b} className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[8px] font-medium text-cyan-300/90">
            {BADGE_LABELS[b] ?? b}
          </span>
        ))}
        <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-zinc-500">{listing.category}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <div className="flex items-center gap-2 text-[9px] text-zinc-500">
          <span className="flex items-center gap-0.5 text-amber-400/90">
            <Star className="h-3 w-3 fill-amber-400/30" />
            {listing.rating.toFixed(1)}
          </span>
          <span>{listing.downloads.toLocaleString()} dl</span>
          {listing.badges.includes("verified") ? <Shield className="h-3 w-3 text-emerald-500/70" /> : null}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-500">
            {listing.priceUsd ? `$${listing.priceUsd}` : pricing.label}
          </span>
          {installed ? (
            <button
              type="button"
              onClick={onUninstall}
              className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-[9px] text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={onInstall}
              className="flex items-center gap-1 rounded bg-cyan-500/15 px-2 py-1 text-[9px] font-medium text-cyan-300 hover:bg-cyan-500/25"
            >
              <Download className="h-3 w-3" />
              Install
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
