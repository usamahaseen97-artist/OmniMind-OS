"use client";

import {
  CheckCircle2,
  Clapperboard,
  Heart,
  Search,
  ShieldCheck,
  Tv,
  Youtube,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchLegalChannels,
  LEGAL_CHANNEL_FALLBACK,
  LIVE_TV_CATEGORIES,
  type LegalLiveChannel,
  type LiveTvCategory,
} from "../../lib/live-tv-api";
import { estimateNetworkTelemetry, postTelemetry } from "../../lib/bigdata-api";
import { fetchTvLiveGrid, type LiveFeed } from "../../lib/omnitv-bigdata-api";
import {
  entertainmentHorizontalRail,
  entertainmentHorizontalScroll,
} from "../../lib/responsive-layout";
import { cn } from "../../lib/utils";
import { useEntertainmentMood } from "./EntertainmentMoodProvider";
import { OmniTVChannelCard } from "./OmniTVChannelCard";
import { HlsVideoPlayer } from "./HlsVideoPlayer";
import { OmniTVLiveEvents, publishOmniTVClientEvent } from "./OmniTVLiveEvents";
import { OmniTVPlayer, OmniTVPlayerFallback } from "./OmniTVPlayer";
import { OmniTVPlayerSkeleton, OmniTVRowSkeleton } from "./OmniTVSkeletons";

const FAVORITES_KEY = "omnimind_legal_tv_favorites_v1";
const CATEGORY_FILTERS = [...LIVE_TV_CATEGORIES, "Favorites"] as const;

type OmniTvFilter = (typeof CATEGORY_FILTERS)[number];

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    /* local storage is optional */
  }
}

function sourceLabel(channel?: LegalLiveChannel) {
  if (!channel) return "Select a channel";
  if (channel.sourceType === "youtube") return "Official YouTube embed";
  if (channel.sourceType === "hls") return "Public HLS stream";
  return "Official provider · external";
}

type OmniTVViewProps = { userId?: string };

export function OmniTVView({ userId = "anonymous" }: OmniTVViewProps) {
  const { mood, bufferHealing } = useEntertainmentMood();
  const [liveFeeds, setLiveFeeds] = useState<LiveFeed[]>([]);
  const [channels, setChannels] = useState<LegalLiveChannel[]>(LEGAL_CHANNEL_FALLBACK);
  const [activeCategory, setActiveCategory] = useState<OmniTvFilter>("Live News");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(LEGAL_CHANNEL_FALLBACK[0]?.id ?? "");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchTvLiveGrid(userId, ctrl.signal).then(setLiveFeeds);
    return () => ctrl.abort();
  }, [userId]);

  useEffect(() => {
    const ctrl = new AbortController();
    const apiCategory: LiveTvCategory = activeCategory === "Favorites" ? "All" : activeCategory;
    setLoading(true);
    setError(null);
    void fetchLegalChannels(apiCategory, query, ctrl.signal)
      .then((next) => {
        setChannels(next);
        setActiveId((current) => {
          if (next.some((channel) => channel.id === current)) return current;
          return next[0]?.id ?? "";
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load legal channels");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [activeCategory, query]);

  const visibleChannels = useMemo(() => {
    if (activeCategory !== "Favorites") return channels;
    return channels.filter((channel) => favorites.includes(channel.id));
  }, [activeCategory, channels, favorites]);

  const active = visibleChannels.find((channel) => channel.id === activeId) ?? visibleChannels[0];

  const playedChannelRef = useRef<string | null>(null);

  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
    setPlayerError(null);
  }, [active, activeId]);

  useEffect(() => {
    if (!active) return;
    const previous = playedChannelRef.current;
    if (previous === active.id) return;
    publishOmniTVClientEvent(
      previous
        ? { type: "channel.switch", fromChannelId: previous, channelId: active.id, channelName: active.name }
        : { type: "channel.play", channelId: active.id, channelName: active.name },
    );
    playedChannelRef.current = active.id;
    const net = estimateNetworkTelemetry();
    void postTelemetry({
      domain: "tv",
      userId,
      contentId: active.id,
      genre: active.category || "live",
      playbackStatus: "play",
      networkBitrate: net.networkBitrate,
      packetLossRatio: net.packetLossRatio,
      title: active.name,
    });
  }, [active, userId]);

  const handlePlayerError = useCallback(
    (message: string) => {
      setPlayerError(message);
      if (active) {
        publishOmniTVClientEvent({ type: "embed.failed", channelId: active.id, reason: message });
      }
    },
    [active],
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const rows = useMemo(
    () =>
      LIVE_TV_CATEGORIES.filter((category) => category !== "All").map((category) => ({
        category,
        channels: visibleChannels.filter((channel) => channel.category === category),
      })),
    [visibleChannels],
  );

  const isActiveFavorite = active ? favorites.includes(active.id) : false;
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectChannel = useCallback((id: string) => {
    setActiveId(id);
    setPlayerError(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="box-border flex h-full min-h-0 w-full max-w-full flex-col overflow-x-hidden overflow-y-hidden text-zinc-100">
      <div
        ref={scrollRef}
        className="history-scroll-hover min-h-0 w-full max-w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
      >
        {/* Top header: brand + search bar */}
        <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#0F0F0F]/95 backdrop-blur-xl">
          <div className="flex h-14 max-h-14 items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00FF87]/15">
                <Tv className="h-5 w-5 text-[#00FF87]" />
              </span>
              <span className="text-lg font-black tracking-tight mood-accent-text">OmniTV</span>
              {mood ? (
                <span className="hidden text-[10px] text-zinc-500 lg:inline">{mood.theme_label}</span>
              ) : null}
              <span className="ml-1 hidden items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#00FF87] sm:inline-flex">
                <ShieldCheck className="h-3 w-3" />
                Legal
              </span>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search channels, countries, categories…"
                className="w-full rounded-full border border-zinc-700 bg-[#121212] py-2.5 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#00FF87]/60 focus:bg-black"
              />
            </div>

            <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-zinc-700 bg-[#121212] px-3 py-1.5 text-xs font-semibold text-zinc-300 md:flex">
              <Heart className={cn("h-3.5 w-3.5", favorites.length > 0 && "fill-current text-red-400")} />
              {favorites.length}
            </div>
          </div>

          {/* Category chips */}
          <div className={cn(entertainmentHorizontalRail, "px-4 sm:px-6 lg:px-8")}>
            <div className={cn(entertainmentHorizontalScroll, "gap-2 pb-2")}>
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                  activeCategory === category
                    ? "bg-white text-black"
                    : "bg-[#272727] text-zinc-200 hover:bg-[#3a3a3a]",
                )}
              >
                {category}
                {category === "Favorites" && favorites.length > 0 ? ` · ${favorites.length}` : ""}
              </button>
            ))}
            </div>
          </div>
        </header>

        {/* Watch area */}
        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <OmniTVPlayerSkeleton />
            ) : playerError ? (
              <OmniTVPlayerFallback channel={active} error={playerError} />
            ) : (
              <OmniTVPlayer channel={active} onError={handlePlayerError} />
            )}

            {active ? (
              <div className="mt-4">
                <h1 className="text-lg font-bold leading-snug text-white sm:text-2xl">
                  {active.name}
                </h1>

                <div className="mt-2 flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                    {active.isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 font-bold text-red-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                        LIVE
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">
                        VOD
                      </span>
                    )}
                    <span>{active.category}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{active.country}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{active.language}</span>
                    {active.verifiedLegal ? (
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        verified
                      </span>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(active.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                        isActiveFavorite
                          ? "bg-red-500/15 text-red-200 hover:bg-red-500/25"
                          : "bg-[#272727] text-zinc-100 hover:bg-[#3a3a3a]",
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isActiveFavorite && "fill-current")} />
                      {isActiveFavorite ? "Saved" : "Save"}
                    </button>
                    {active.officialUrl && active.officialUrl !== "#" ? (
                      <a
                        href={active.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-[#3a3a3a]"
                      >
                        <Youtube className="h-4 w-4" />
                        Official
                      </a>
                    ) : null}
                  </div>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                  {active.description} <span className="text-zinc-600">· {sourceLabel(active)}</span>
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* Big Data live feeds — News / Football / Cricket */}
        {liveFeeds.length > 0 ? (
          <section className="min-w-0 px-4 pt-2 sm:px-6 lg:px-8">
            <div className="mx-auto min-w-0 max-w-full space-y-3">
              <h2 className="text-base font-bold mood-accent-text">Live High-Speed Feeds</h2>
              <p className="text-xs text-zinc-500">
                Kafka tv-events · multi-bitrate HLS
                {bufferHealing?.healing_required
                  ? ` · healing → ${bufferHealing.recommended_variant}`
                  : ""}
              </p>
              <div className={entertainmentHorizontalRail}>
                <div className={cn(entertainmentHorizontalScroll, "gap-4 pr-3")}>
                  <div className="inline-flex w-max min-w-0 snap-x snap-mandatory gap-4">
                    {liveFeeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="w-[min(280px,85vw)] max-w-[280px] shrink-0 overflow-hidden rounded-xl border mood-accent-border bg-zinc-900/80"
                      >
                        <div className="relative aspect-video bg-black">
                          <HlsVideoPlayer
                            src={feed.master_url}
                            preferredVariant={bufferHealing?.recommended_variant}
                            className="h-full w-full"
                            muted
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-white">{feed.title}</p>
                          <p className="text-[11px] text-zinc-500">{feed.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Channel grid */}
        <section className="min-w-0 px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto min-w-0 max-w-full space-y-8">
            {error ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            {loading ? <OmniTVRowSkeleton /> : null}

            {!loading &&
              rows.map(({ category, channels: rowChannels }) =>
                rowChannels.length > 0 ? (
                  <div key={category}>
                    <div className="mb-3 flex items-center gap-2">
                      <Clapperboard className="h-4 w-4 text-[#00FF87]" />
                      <h2 className="text-base font-bold text-zinc-100">{category}</h2>
                      <span className="text-xs text-zinc-600">{rowChannels.length}</span>
                    </div>
                    <div className="grid w-full min-w-0 max-w-full grid-cols-[repeat(auto-fill,minmax(min(100%,9rem),1fr))] gap-3">
                      {rowChannels.map((channel) => (
                        <OmniTVChannelCard
                          key={channel.id}
                          channel={channel}
                          selected={active?.id === channel.id}
                          favorite={favorites.includes(channel.id)}
                          onSelect={() => selectChannel(channel.id)}
                          onToggleFavorite={() => toggleFavorite(channel.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}

            {!loading && visibleChannels.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-[#121212] p-8 text-center">
                <Tv className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-200">No legal channels found</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {activeCategory === "Favorites"
                    ? "Add channels to favorites or clear search to browse saved channels."
                    : "Clear search or switch category to browse official sources."}
                </p>
              </div>
            ) : null}

            <OmniTVLiveEvents />
          </div>
        </section>
      </div>
    </div>
  );
}
