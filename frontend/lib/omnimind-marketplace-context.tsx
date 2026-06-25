"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMarketplaceManager,
  MARKETPLACE_CATEGORIES,
  type MarketplaceCollection,
  type MarketplaceListing,
  type MarketplaceSyncState,
  type PluginHealthReport,
} from "../core/marketplace";
import type { MarketplaceAnalytics } from "../core/marketplace/types";
import { useOmniMindBrainOptional } from "./omnimind-brain-context";

export type MarketplaceView = "browse" | "developer" | "enterprise" | "analytics";

type MarketplaceContextValue = {
  listings: MarketplaceListing[];
  collections: MarketplaceCollection[];
  categories: string[];
  syncState: MarketplaceSyncState;
  analytics: MarketplaceAnalytics;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeView: MarketplaceView;
  setActiveView: (v: MarketplaceView) => void;
  selectedKind: string | null;
  setSelectedKind: (k: string | null) => void;
  filteredListings: MarketplaceListing[];
  trending: MarketplaceListing[];
  editorsChoice: MarketplaceListing[];
  verified: MarketplaceListing[];
  enterpriseReady: MarketplaceListing[];
  newReleases: MarketplaceListing[];
  highestRated: MarketplaceListing[];
  install: (listing: MarketplaceListing) => Promise<{ ok: boolean; error?: string }>;
  uninstall: (listing: MarketplaceListing) => Promise<{ ok: boolean }>;
  isInstalled: (listing: MarketplaceListing) => boolean;
  bookmark: (listingId: string) => void;
  isBookmarked: (listingId: string) => boolean;
  syncCloud: () => Promise<MarketplaceSyncState>;
  healthCheck: (pluginId: string) => PluginHealthReport;
  developer: ReturnType<ReturnType<typeof getMarketplaceManager>["getDeveloper"]>;
  generateApiKey: (label: string) => void;
  enterpriseStores: ReturnType<ReturnType<typeof getMarketplaceManager>["enterprise"]["list"]>;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function OmniMindMarketplaceProvider({ children }: { children: ReactNode }) {
  const brain = useOmniMindBrainOptional();
  const manager = useMemo(() => getMarketplaceManager(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<MarketplaceView>("browse");
  const [selectedKind, setSelectedKind] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<MarketplaceSyncState>(manager.sync.getState());
  const [analytics, setAnalytics] = useState<MarketplaceAnalytics>(manager.analytics.get());
  const [developer, setDeveloper] = useState(manager.getDeveloper());

  const listings = useMemo(() => manager.catalog.all(), [manager]);
  const collections = useMemo(() => manager.catalog.collections(), [manager]);
  const enterpriseStores = useMemo(() => manager.enterprise.list(), [manager]);

  const filteredListings = useMemo(() => {
    let result = searchQuery ? manager.catalog.search(searchQuery) : listings;
    if (selectedKind) result = result.filter((l) => l.kind === selectedKind);
    return result;
  }, [listings, manager, searchQuery, selectedKind]);

  const refresh = useCallback(() => {
    setSyncState(manager.sync.getState());
    setAnalytics(manager.analytics.get());
    setDeveloper(manager.getDeveloper());
  }, [manager]);

  const install = useCallback(
    async (listing: MarketplaceListing) => {
      const result = await manager.installListing(listing);
      refresh();
      manager.notifyBrain("install", { listingId: listing.id, ok: result.ok });
      brain?.pinNote?.(`Marketplace: installed ${listing.name}`);
      return result;
    },
    [brain, manager, refresh],
  );

  const uninstall = useCallback(
    async (listing: MarketplaceListing) => {
      const result = await manager.uninstallListing(listing);
      refresh();
      return result;
    },
    [manager, refresh],
  );

  const bookmark = useCallback(
    (listingId: string) => {
      manager.bookmark(listingId);
      refresh();
    },
    [manager, refresh],
  );

  const syncCloud = useCallback(async () => {
    const state = await manager.syncCloud();
    setSyncState(state);
    return state;
  }, [manager]);

  useEffect(() => {
    const onSync = () => refresh();
    window.addEventListener("omnimind:marketplace-synced", onSync);
    return () => window.removeEventListener("omnimind:marketplace-synced", onSync);
  }, [refresh]);

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      listings,
      collections,
      categories: MARKETPLACE_CATEGORIES,
      syncState,
      analytics,
      searchQuery,
      setSearchQuery,
      activeView,
      setActiveView,
      selectedKind,
      setSelectedKind,
      filteredListings,
      trending: manager.catalog.trending(),
      editorsChoice: manager.catalog.editorsChoice(),
      verified: manager.catalog.verified(),
      enterpriseReady: manager.catalog.enterpriseReady(),
      newReleases: manager.catalog.newReleases(),
      highestRated: manager.catalog.highestRated(),
      install,
      uninstall,
      isInstalled: (l) => manager.isInstalled(l),
      bookmark,
      isBookmarked: (id) => syncState.bookmarks.some((b) => b.listingId === id),
      syncCloud,
      healthCheck: (id) => manager.lifecycle.healthCheck(id),
      developer,
      generateApiKey: (label) => {
        manager.generateApiKey(label);
        refresh();
      },
      enterpriseStores,
    }),
    [
      listings,
      collections,
      syncState,
      analytics,
      searchQuery,
      activeView,
      selectedKind,
      filteredListings,
      manager,
      install,
      uninstall,
      bookmark,
      syncCloud,
      developer,
      enterpriseStores,
    ],
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useOmniMindMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error("useOmniMindMarketplace requires OmniMindMarketplaceProvider");
  return ctx;
}

export function useOmniMindMarketplaceOptional() {
  return useContext(MarketplaceContext);
}
