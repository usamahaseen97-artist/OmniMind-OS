"use client";

import { ChevronDown, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MUSIC_PLAYLISTS, type MusicTrack } from "../../lib/entertainment-catalog";
import {
  fetchMusicCatalog,
  fetchMusicRecommendations,
  fetchMusicTrending,
  searchMusic,
} from "../../lib/omnimusic-api";
import { estimateNetworkTelemetry, postTelemetry } from "../../lib/bigdata-api";
import { getMusicPlayHistory } from "../../lib/omnimusic-taste";
import {
  entertainmentHorizontalRail,
  entertainmentHorizontalScroll,
} from "../../lib/responsive-layout";
import { IconScrollMore } from "../ui/IconScrollActions";
import { cn } from "../../lib/utils";
import { useEntertainmentMood } from "./EntertainmentMoodProvider";
import { OmniMusicLibraryRail } from "./OmniMusicLibraryRail";
import { OmniMusicNowPlaying } from "./OmniMusicNowPlaying";
import { OmniMusicPlayer, type MusicPlaybackControls } from "./OmniMusicPlayer";
import { OmniMusicTopBar } from "./OmniMusicTopBar";

type OmniMusicViewProps = {
  userId?: string;
};

function TrackCard({
  track,
  activeId,
  size = "md",
  isPlaying = false,
  onSelect,
}: {
  track: MusicTrack;
  activeId?: string;
  size?: "sm" | "md" | "lg";
  isPlaying?: boolean;
  onSelect: (t: MusicTrack) => void;
}) {
  const isActive = activeId === track.id;
  const dim =
    size === "lg"
      ? "w-36 sm:w-44"
      : size === "sm"
        ? "w-28"
        : "w-32 sm:w-36";

  return (
    <button
      type="button"
      onClick={() => onSelect(track)}
      className={cn(
        "group shrink-0 snap-start text-left transition",
        dim,
        isActive && "opacity-100",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-md shadow-lg transition group-hover:shadow-xl",
          size === "lg" ? "aspect-square" : "aspect-square",
          isActive ? "ring-2 ring-[#1ed760]" : "",
        )}
      >
        {track.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/30 via-[#15171E] to-[#0B0C10]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1ed760] text-[#0B0C10] shadow-lg ring-2 ring-white/20">
            {isActive && isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current pl-0.5" />
            )}
          </span>
        </div>
        {track.source === "audius" || track.tags.includes("trending") ? (
          <span className="absolute left-2 top-2 rounded-md bg-violet-600/90 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
            Live
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-semibold text-white">{track.title}</p>
      <p className="line-clamp-2 text-xs text-zinc-400">{track.artist}</p>
    </button>
  );
}

const PAGE_SIZE = 60;

function TrackGrid({
  tracks,
  activeId,
  isPlaying = false,
  onSelect,
  hasMore,
  loadingMore,
  onLoadMore,
  total,
}: {
  tracks: MusicTrack[];
  activeId?: string;
  isPlaying?: boolean;
  onSelect: (t: MusicTrack) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  total?: number;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-zinc-500">
          {total != null ? (
            <>
              Showing <span className="text-zinc-300">{tracks.length}</span> of{" "}
              <span className="font-semibold text-emerald-400">{total.toLocaleString()}</span> songs
            </>
          ) : (
            <>{tracks.length} songs</>
          )}
        </p>
      </div>
      <div className="w-full min-w-0 max-w-full rounded-xl border border-gray-800/50 bg-[#0a0a0f]/50 p-3">
        <div className="grid w-full min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,8.5rem),1fr))] gap-3">
          {tracks.map((t) => (
            <TrackCard
              key={t.id}
              track={t}
              activeId={activeId}
              isPlaying={isPlaying}
              size="md"
              onSelect={onSelect}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 pb-2">
          {hasMore && onLoadMore ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={onLoadMore}
              className="flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Load more songs
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  onShowAll,
}: {
  title: string;
  onShowAll?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-xl font-bold tracking-tight text-white hover:underline">{title}</h2>
      {onShowAll ? (
        <IconScrollMore onClick={onShowAll} direction="down" ariaLabel="Scroll section" />
      ) : null}
    </div>
  );
}

function QuickAccessGrid({
  items,
  onPick,
}: {
  items: { id: string; label: string; thumb?: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="mb-8 grid w-full min-w-0 max-w-full grid-cols-[repeat(auto-fill,minmax(min(100%,11rem),1fr))] gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(item.id)}
          className="group flex h-[52px] items-center gap-0 overflow-hidden rounded-md bg-[#ffffff1a] text-left transition hover:bg-[#ffffff2a]"
        >
          <div className="h-[52px] w-[52px] shrink-0 overflow-hidden bg-zinc-800">
            {item.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumb} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#450af5] to-[#8e8ee8] text-lg">
                ♥
              </div>
            )}
          </div>
          <span className="truncate px-3 text-sm font-bold text-white">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function HorizontalRow({
  title,
  tracks,
  activeId,
  isPlaying = false,
  onSelect,
  onShowAll,
  size = "md",
}: {
  title: string;
  icon?: ReactNode;
  tracks: MusicTrack[];
  activeId?: string;
  isPlaying?: boolean;
  onSelect: (t: MusicTrack) => void;
  onShowAll?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  if (tracks.length === 0) return null;
  return (
    <section className="mb-10 w-full min-w-0 max-w-full">
      <SectionHeader title={title} onShowAll={onShowAll} />
      <div className={entertainmentHorizontalRail}>
        <div className={cn(entertainmentHorizontalScroll, "flex gap-4 pr-3")}>
          {tracks.map((t) => (
            <TrackCard
              key={t.id}
              track={t}
              activeId={activeId}
              isPlaying={isPlaying}
              size={size}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function OmniMusicView({ userId = "guest-founder" }: OmniMusicViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<string | "all">("all");
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [userInitiated, setUserInitiated] = useState(false);
  const [trending, setTrending] = useState<MusicTrack[]>([]);
  const [browseTracks, setBrowseTracks] = useState<MusicTrack[]>([]);
  const [searchResults, setSearchResults] = useState<MusicTrack[] | null>(null);
  const [playlists, setPlaylists] = useState<string[]>([...MUSIC_PLAYLISTS]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [, setCatalogSource] = useState<"api" | "local">("local");
  const [recommended, setRecommended] = useState<MusicTrack[]>([]);
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogOffset, setCatalogOffset] = useState(0);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [contentFilter, setContentFilter] = useState<"all" | "music" | "podcasts">("all");
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<MusicPlaybackControls | null>(null);

  const { mood } = useEntertainmentMood();

  const emitMusicTelemetry = useCallback(
    (t: MusicTrack, status: "play" | "click" | "skip") => {
      const net = estimateNetworkTelemetry();
      const genre =
        t.tags?.find((tag) => /lo-?fi|synth|pop|rock|hip/i.test(tag)) ||
        t.playlist ||
        t.category ||
        "music";
      void postTelemetry({
        domain: "music",
        userId: userId ?? "anonymous",
        contentId: t.id,
        genre: String(genre),
        playbackStatus: status,
        networkBitrate: net.networkBitrate,
        packetLossRatio: net.packetLossRatio,
        title: t.title,
      });
    },
    [userId],
  );

  const selectTrack = useCallback(
    (t: MusicTrack) => {
      setUserInitiated(true);
      setActiveTrack(t);
      emitMusicTelemetry(t, "play");
    },
    [emitMusicTelemetry],
  );

  const onActiveTrackChange = useCallback(
    (t: MusicTrack) => {
      setUserInitiated(true);
      setActiveTrack(t);
      emitMusicTelemetry(t, "play");
    },
    [emitMusicTelemetry],
  );

  const onPlaybackReady = useCallback((controls: MusicPlaybackControls) => {
    playbackRef.current = controls;
  }, []);

  const handleTrackPress = useCallback(
    (t: MusicTrack) => {
      if (activeTrack?.id === t.id) {
        playbackRef.current?.togglePlay();
        setUserInitiated(true);
        return;
      }
      selectTrack(t);
    },
    [activeTrack?.id, selectTrack],
  );

  const scrollMainDown = useCallback(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    el.scrollBy({ top: Math.max(280, Math.min(remaining, 520)), behavior: "smooth" });
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoadingTrending(true);
    void fetchMusicTrending(48, ctrl.signal)
      .then((rows) => {
        setTrending(rows);
        if (rows.length > 0) {
          setActiveTrack((cur) => cur ?? rows[0]);
        }
      })
      .finally(() => setLoadingTrending(false));
    void fetchMusicRecommendations(getMusicPlayHistory(), userId, ctrl.signal).then(
      setRecommended,
    );
    return () => ctrl.abort();
  }, [userId]);

  const loadCatalogPage = useCallback(
    (offset: number, append: boolean) => {
      const ctrl = new AbortController();
      if (append) setLoadingMore(true);
      void fetchMusicCatalog(
        "",
        activePlaylist === "all" ? undefined : activePlaylist,
        ctrl.signal,
        { offset, limit: PAGE_SIZE },
      )
        .then((res) => {
          setBrowseTracks(res.tracks);
          setPlaylists(res.playlists);
          setCatalogSource(res.source);
          setCatalogTotal(res.total ?? res.tracks.length);
          setHasMoreCatalog(res.hasMore ?? false);
          setCatalogOffset(offset + res.tracks.length);
          setAllTracks((prev) => {
            if (!append) return res.tracks;
            const seen = new Set(prev.map((t) => t.id));
            const added = res.tracks.filter((t) => !seen.has(t.id));
            return [...prev, ...added];
          });
        })
        .finally(() => setLoadingMore(false));
      return () => ctrl.abort();
    },
    [activePlaylist],
  );

  useEffect(() => {
    if (searchQuery.trim()) return;
    return loadCatalogPage(0, false);
  }, [searchQuery, loadCatalogPage]);

  const loadMoreSongs = useCallback(() => {
    if (!hasMoreCatalog || loadingMore) return;
    loadCatalogPage(catalogOffset, true);
  }, [hasMoreCatalog, loadingMore, catalogOffset, loadCatalogPage]);

  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el || searchQuery.trim()) return;
    const onScroll = () => {
      if (!hasMoreCatalog || loadingMore) return;
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 160;
      if (nearBottom) loadMoreSongs();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMoreCatalog, loadingMore, loadMoreSongs, searchQuery]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      setLoadingSearch(false);
      return;
    }
    const ctrl = new AbortController();
    setLoadingSearch(true);
    const timer = setTimeout(() => {
      void searchMusic(q, ctrl.signal)
        .then((rows) => {
          setSearchResults(rows);
        })
        .finally(() => setLoadingSearch(false));
    }, 120);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [searchQuery]);

  const displayTracks = useMemo(() => {
    if (searchQuery.trim()) return searchResults ?? [];
    const base = trending.length ? trending : browseTracks;
    if (activePlaylist === "all") return base;
    const low = activePlaylist.toLowerCase();
    return base.filter(
      (t) =>
        t.playlist.toLowerCase().includes(low) ||
        (t.category ?? "").toLowerCase().includes(low) ||
        t.tags.some((tag) => tag.toLowerCase().includes(low)),
    );
  }, [searchQuery, searchResults, trending, browseTracks, activePlaylist]);

  const queueTracks = useMemo(() => {
    const base =
      allTracks.length > 0 ? allTracks : displayTracks.length > 0 ? displayTracks : trending;
    if (!activeTrack) return base;
    const idx = base.findIndex((t) => t.id === activeTrack.id);
    if (idx >= 0) {
      const head = base.slice(0, idx);
      const tail = base.slice(idx);
      return [...tail, ...head.filter((t) => t.id !== activeTrack.id)];
    }
    return [activeTrack, ...base];
  }, [allTracks, displayTracks, trending, activeTrack?.id]);

  const trendingNow = useMemo(
    () => (searchQuery.trim() ? [] : (trending.length ? trending : browseTracks).slice(0, 24)),
    [searchQuery, trending, browseTracks],
  );

  const pakistani = useMemo(
    () =>
      trendingNow.filter(
        (t) =>
          /pakistan|coke|atif|pasoori|punjabi|urdu/i.test(
            `${t.playlist} ${t.artist} ${t.tags.join(" ")}`,
          ),
      ),
    [trendingNow],
  );

  const bollywood = useMemo(
    () =>
      trendingNow.filter((t) =>
        /bollywood|arijit|shahrukh|hindi/i.test(`${t.playlist} ${t.artist} ${t.tags.join(" ")}`),
      ),
    [trendingNow],
  );

  const globalPop = useMemo(
    () =>
      trendingNow.filter(
        (t) =>
          /hollywood|pop|english|weeknd|swift|drake/i.test(
            `${t.playlist} ${t.artist} ${t.tags.join(" ")}`,
          ) && !pakistani.includes(t) && !bollywood.includes(t),
      ),
    [trendingNow, pakistani, bollywood],
  );

  const featured = trendingNow[0] ?? browseTracks[0] ?? null;
  const isSearching = Boolean(searchQuery.trim());

  const handleSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setUserInitiated(true);
  }, []);

  const poolForThumbs = allTracks.length ? allTracks : trending.length ? trending : browseTracks;

  const quickAccessItems = useMemo(() => {
    const items: { id: string; label: string; thumb?: string }[] = [
      {
        id: "all",
        label: "Liked Songs",
        thumb: poolForThumbs[0]?.thumbnailUrl,
      },
    ];
    for (const pl of playlists.slice(0, 7)) {
      const t = poolForThumbs.find((x) =>
        x.playlist.toLowerCase().includes(pl.toLowerCase().slice(0, 6)),
      );
      items.push({ id: pl, label: pl, thumb: t?.thumbnailUrl });
    }
    return items;
  }, [playlists, poolForThumbs]);

  const goHome = useCallback(() => {
    setSearchQuery("");
    setActivePlaylist("all");
    setContentFilter("all");
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const pickQuickAccess = useCallback(
    (id: string) => {
      setSearchQuery("");
      setActivePlaylist(id === "all" ? "all" : id);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const filterChips: { id: typeof contentFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "music", label: "Music" },
    { id: "podcasts", label: "Podcasts" },
  ];

  return (
    <div className="box-border flex h-full min-h-0 w-full max-w-full flex-col overflow-x-hidden overflow-y-hidden bg-black text-white">
      <div className="box-border flex min-h-0 w-full max-w-full flex-1 overflow-hidden">
        <OmniMusicLibraryRail
          playlists={playlists}
          activePlaylist={activePlaylist}
          onSelectPlaylist={setActivePlaylist}
          recentTracks={poolForThumbs}
          onSelectTrack={handleTrackPress}
          activeTrackId={activeTrack?.id}
        />

        <div className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-lg bg-[#121212]">
          <OmniMusicTopBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchQuery={handleSearchQuery}
            onSelectTrack={handleTrackPress}
            userId={userId}
            onHome={goHome}
          />

          <div
            ref={mainScrollRef}
            className="history-scroll-hover min-h-0 w-full max-w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain overscroll-x-none px-4 pb-6 pt-2 md:px-6"
            style={{ scrollbarGutter: "stable", WebkitOverflowScrolling: "touch" }}
          >
            {loadingTrending && !isSearching ? (
              <div className="space-y-6">
                <div className="h-40 animate-pulse rounded-2xl bg-zinc-900/80" />
                <div className="flex gap-3 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-36 w-36 shrink-0 animate-pulse rounded-xl bg-zinc-900" />
                  ))}
                </div>
              </div>
            ) : isSearching ? (
              <>
                <h2 className="mb-2 text-lg font-bold text-zinc-100">
                  Results for &ldquo;{searchQuery.trim()}&rdquo;
                </h2>
                {loadingSearch ? (
                  <p className="text-sm text-zinc-500">
                    Finding tracks on Audius… (first search can take up to a minute)
                  </p>
                ) : displayTracks.length > 0 ? (
                  <TrackGrid
                    tracks={displayTracks}
                    activeId={activeTrack?.id}
                    isPlaying={isPlaying}
                    onSelect={handleTrackPress}
                    total={displayTracks.length}
                  />
                ) : (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    No tracks found — try another spelling or wait for the catalog to finish loading.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {filterChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      disabled={chip.id === "podcasts"}
                      onClick={() => chip.id !== "podcasts" && setContentFilter(chip.id)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-bold transition",
                        contentFilter === chip.id
                          ? "bg-white text-black"
                          : "bg-[#ffffff1a] text-white hover:bg-[#ffffff2a]",
                        chip.id === "podcasts" && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className={cn(entertainmentHorizontalRail, "mb-4 md:hidden")}>
                  <div className={cn(entertainmentHorizontalScroll, "gap-2 pb-1")}>
                  <button
                    type="button"
                    onClick={() => setActivePlaylist("all")}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold",
                      activePlaylist === "all" ? "bg-[#1ed760] text-black" : "bg-[#ffffff1a] text-white",
                    )}
                  >
                    Trending
                  </button>
                  {playlists.map((pl) => (
                    <button
                      key={pl}
                      type="button"
                      onClick={() => setActivePlaylist(pl)}
                      className={cn(
                        "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold",
                        activePlaylist === pl ? "bg-[#1ed760] text-black" : "bg-[#ffffff1a] text-white",
                      )}
                    >
                      {pl}
                    </button>
                  ))}
                  </div>
                </div>

                <QuickAccessGrid items={quickAccessItems} onPick={pickQuickAccess} />

                {recommended.length > 0 ? (
                  <HorizontalRow
                    title="Jump back in"
                    tracks={recommended}
                    activeId={activeTrack?.id}
                    isPlaying={isPlaying}
                    onSelect={handleTrackPress}
                    onShowAll={() => pickQuickAccess("all")}
                    size="lg"
                  />
                ) : null}

                <HorizontalRow
                  title="Trending now"
                  tracks={trendingNow}
                  activeId={activeTrack?.id}
                  isPlaying={isPlaying}
                  onSelect={handleTrackPress}
                  onShowAll={scrollMainDown}
                  size="lg"
                />

                {pakistani.length > 0 ? (
                  <HorizontalRow
                    title="Pakistani & Coke Studio"
                    tracks={pakistani.slice(0, 16)}
                    activeId={activeTrack?.id}
                    isPlaying={isPlaying}
                    onSelect={handleTrackPress}
                    onShowAll={() => setActivePlaylist("Pakistani Latest")}
                  />
                ) : null}

                {bollywood.length > 0 ? (
                  <HorizontalRow
                    title="Albums featuring songs you like"
                    tracks={bollywood.slice(0, 16)}
                    activeId={activeTrack?.id}
                    isPlaying={isPlaying}
                    onSelect={handleTrackPress}
                    onShowAll={() => setActivePlaylist("Bollywood Latest")}
                  />
                ) : null}

                {globalPop.length > 0 ? (
                  <HorizontalRow
                    title="Global pop"
                    tracks={globalPop.slice(0, 16)}
                    activeId={activeTrack?.id}
                    isPlaying={isPlaying}
                    onSelect={handleTrackPress}
                    onShowAll={() => setActivePlaylist("Hollywood Pop")}
                  />
                ) : null}

                <section className="mb-10">
                  <SectionHeader
                    title="All songs"
                    onShowAll={scrollMainDown}
                  />
                  <TrackGrid
                    tracks={allTracks.length ? allTracks : browseTracks}
                    activeId={activeTrack?.id}
                    isPlaying={isPlaying}
                    onSelect={handleTrackPress}
                    hasMore={hasMoreCatalog}
                    loadingMore={loadingMore}
                    onLoadMore={loadMoreSongs}
                    total={catalogTotal || allTracks.length}
                  />
                </section>

                {displayTracks.length === 0 && allTracks.length === 0 ? (
                  <p className="py-12 text-center text-sm text-zinc-500">
                    Start backend on port 8001 for live catalog — then reload.
                  </p>
                ) : null}
              </>
            )}
          </div>

        </div>

        {showNowPlaying ? (
          <OmniMusicNowPlaying
            track={activeTrack}
            playlistLabel={activeTrack?.playlist ?? "OmniMusic"}
            isPlaying={isPlaying}
            onClose={() => setShowNowPlaying(false)}
            className="max-xl:fixed max-xl:inset-y-0 max-xl:right-0 max-xl:z-[60] max-xl:max-h-full max-xl:shadow-2xl"
          />
        ) : null}
      </div>

      {activeTrack && !showNowPlaying ? (
        <button
          type="button"
          onClick={() => setShowNowPlaying(true)}
          className="fixed bottom-[5.5rem] right-2 z-40 max-w-[calc(100vw-1rem)] rounded-full border border-white/20 bg-[#282828] px-4 py-2 text-xs font-bold text-white shadow-xl xl:hidden"
        >
          Now playing
        </button>
      ) : null}

      <OmniMusicPlayer
        tracks={queueTracks}
        activeTrack={activeTrack}
        onActiveTrackChange={onActiveTrackChange}
        onPlayingChange={setIsPlaying}
        onPlaybackReady={onPlaybackReady}
        onToggleNowPlaying={() => setShowNowPlaying((v) => !v)}
        nowPlayingOpen={showNowPlaying}
        userInitiated={userInitiated}
        autoPlayFeaturedOnce={false}
      />
    </div>
  );
}
