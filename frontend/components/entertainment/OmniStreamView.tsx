"use client";

import { Info, Play, Radio, Search, Server, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchStreamLibrary,
  type StreamCatalogItem,
  type StreamSource,
} from "../../lib/omnistream-api";
import { fetchLiveChannels, type LiveChannel } from "../../lib/live-stream-api";
import { OmniLivePlayer } from "./OmniLivePlayer";
import { HlsVideoPlayer } from "./HlsVideoPlayer";
import { cn } from "../../lib/utils";

const POSTER_GRADIENTS = [
  "from-rose-900/70 to-[#101014]",
  "from-amber-900/60 to-[#101014]",
  "from-emerald-900/55 to-[#101014]",
  "from-violet-900/60 to-[#101014]",
  "from-sky-900/60 to-[#101014]",
  "from-fuchsia-900/55 to-[#101014]",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return POSTER_GRADIENTS[hash % POSTER_GRADIENTS.length];
}

const CATEGORY_ORDER = [
  "Trending Now",
  "Hollywood",
  "Bollywood",
  "Horror",
  "Thriller",
  "Sci-Fi",
  "Pakistani Drama",
  "Turkish Drama",
  "Anime",
  "Drama",
  "Drama Series",
  "Action",
  "Anime & Animation",
];

function PosterCard({
  item,
  onPlay,
}: {
  item: StreamCatalogItem;
  onPlay: (item: StreamCatalogItem) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const poster = item.posterUrl && !imgError ? item.posterUrl : null;

  return (
    <button
      type="button"
      onClick={() => onPlay(item)}
      title={item.title}
      className="group relative aspect-[2/3] w-[132px] shrink-0 overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-900 text-left transition duration-200 hover:z-10 hover:scale-105 hover:border-[#E50914]/70 sm:w-[150px]"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={cn("h-full w-full bg-gradient-to-br", gradientFor(item.id))} />
      )}

      {/* Title always visible (fixes blank Action cards) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-2 pb-2 pt-8">
        <p className="line-clamp-2 text-xs font-bold leading-tight text-white">{item.title}</p>
        <p className="mt-0.5 text-[10px] text-zinc-400">
          {item.year || "2024"}
          {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ""}
        </p>
      </div>

      {item.rating && item.rating >= 8.5 ? (
        <span className="absolute left-1.5 top-1.5 rounded bg-[#E50914] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
          Hot
        </span>
      ) : null}

      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <Play className="h-5 w-5 fill-current" />
        </span>
      </div>
    </button>
  );
}

function LiveBrowser({
  loading,
  channels,
  active,
  onSelect,
}: {
  loading: boolean;
  channels: LiveChannel[];
  active: LiveChannel | null;
  onSelect: (channel: LiveChannel) => void;
}) {
  if (loading && channels.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="aspect-video w-full max-w-4xl animate-pulse rounded-xl bg-zinc-900" />
      </div>
    );
  }
  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <Radio className="h-8 w-8 text-zinc-600" />
        <p className="text-sm text-zinc-500">No live channels available right now.</p>
        <p className="text-xs text-zinc-600">Backend offline or no live sources configured.</p>
      </div>
    );
  }
  return (
    <div className="px-4 py-5 sm:px-6">
      {active ? (
        <div className="mx-auto mb-6 w-full max-w-4xl">
          <OmniLivePlayer key={active.id} channel={active} />
        </div>
      ) : null}
      <h2 className="mb-3 text-base font-bold text-zinc-100">Live channels</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onClick={() => onSelect(channel)}
            className={cn(
              "group relative overflow-hidden rounded-lg border bg-zinc-900 p-3 text-left transition hover:border-[#E50914]/70",
              active?.id === channel.id ? "border-[#E50914]" : "border-zinc-800/70",
            )}
          >
            <div className="flex items-center justify-between">
              {channel.isLive ? (
                <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                  Live
                </span>
              ) : (
                <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-bold uppercase text-zinc-200">
                  Replay
                </span>
              )}
              <Radio className="h-4 w-4 text-zinc-500 group-hover:text-[#E50914]" />
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-white">{channel.name}</p>
            <p className="truncate text-[11px] text-zinc-500">{channel.category}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function OmniStreamView() {
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState<StreamCatalogItem[]>([]);
  const [source, setSource] = useState<StreamSource>("demo");
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<StreamCatalogItem | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);
  const [tab, setTab] = useState<"vod" | "live">("vod");
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);
  const [activeLive, setActiveLive] = useState<LiveChannel | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (tab !== "live") return;
    const ctrl = new AbortController();
    setLiveLoading(true);
    fetchLiveChannels(ctrl.signal)
      .then((res) => {
        setLiveChannels(res.channels);
        setActiveLive((current) => current ?? res.channels[0] ?? null);
      })
      .catch(() => setLiveChannels([]))
      .finally(() => setLiveLoading(false));
    return () => ctrl.abort();
  }, [tab]);

  useEffect(() => {
    if (tab !== "vod") return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      void fetchStreamLibrary(query, ctrl.signal)
        .then((result) => {
          setLibrary(result.items);
          setSource(result.source);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, tab]);

  const selectPlay = (item: StreamCatalogItem) => {
    setPlayError(null);
    setPlaying(item);
  };

  const featured = useMemo(
    () => library.find((item) => item.backdropUrl) ?? library[0],
    [library],
  );

  const trendingRow = useMemo(() => library.slice(0, 20), [library]);

  const rows = useMemo(() => {
    const map = new Map<string, StreamCatalogItem[]>();
    for (const item of library) {
      const genre = item.genres[0] ?? "Featured";
      const list = map.get(genre) ?? [];
      list.push(item);
      map.set(genre, list);
    }
    const ordered = CATEGORY_ORDER.filter((g) => map.has(g)).map((genre) => ({
      genre,
      items: map.get(genre) ?? [],
    }));
    const rest = [...map.entries()]
      .filter(([g]) => !CATEGORY_ORDER.includes(g))
      .map(([genre, items]) => ({ genre, items }));
    return [...ordered, ...rest];
  }, [library]);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0B0F] text-zinc-100">
      {/* Top nav */}
      <header className="z-30 flex shrink-0 items-center gap-3 border-b border-zinc-800/70 bg-[#0B0B0F]/95 px-4 py-2.5 backdrop-blur-xl sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-black tracking-tight text-[#E50914]">OmniMovies</span>
        </div>
        <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-zinc-700 bg-[#16161c] p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => setTab("vod")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold transition",
              tab === "vod" ? "bg-[#E50914] text-white" : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            Movies
          </button>
          <button
            type="button"
            onClick={() => setTab("live")}
            className={cn(
              "flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-semibold transition",
              tab === "live" ? "bg-[#E50914] text-white" : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            <Radio className="h-3 w-3" />
            Live
          </button>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies, series, genres…"
            className="w-full rounded-full border border-zinc-700 bg-[#16161c] py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#E50914]/60 focus:bg-black"
          />
        </div>
        <span
          className={cn(
            "hidden shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold sm:inline-flex",
            source !== "demo"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-zinc-700 bg-zinc-900 text-zinc-400",
          )}
        >
          <Server className="h-3.5 w-3.5" />
          {source === "jellyfin"
            ? "Jellyfin connected"
            : source === "library"
              ? `${library.length} movies live`
              : "Demo library"}
        </span>
      </header>

      <div className="history-scroll-hover min-h-0 flex-1 overflow-y-auto pb-16">
        {tab === "live" ? (
          <LiveBrowser
            loading={liveLoading}
            channels={liveChannels}
            active={activeLive}
            onSelect={setActiveLive}
          />
        ) : (
        <>
        {/* Hero billboard */}
        {featured ? (
          <section className="relative mx-4 mt-4 overflow-hidden rounded-2xl border border-zinc-800/60 sm:mx-6">
            {featured.backdropUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${featured.backdropUrl})` }}
              />
            ) : (
              <div className={cn("absolute inset-0 bg-gradient-to-br", gradientFor(featured.id))} />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="relative flex min-h-[200px] flex-col justify-end gap-3 p-5 sm:min-h-[300px] sm:p-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E50914]">
                Featured
              </span>
              <h1 className="max-w-xl text-2xl font-black leading-tight text-white sm:text-4xl">
                {featured.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-300">
                {featured.year ? <span>{featured.year}</span> : null}
                {featured.rating ? (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {featured.rating.toFixed(1)}
                  </span>
                ) : null}
                <span className="rounded border border-zinc-600 px-1.5 py-0.5 uppercase text-zinc-400">
                  {featured.type}
                </span>
                {featured.genres.slice(0, 3).map((genre) => (
                  <span key={genre} className="text-zinc-400">
                    {genre}
                  </span>
                ))}
              </div>
              {featured.overview ? (
                <p className="max-w-xl text-sm leading-6 text-zinc-300 line-clamp-3">
                  {featured.overview}
                </p>
              ) : null}
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => selectPlay(featured)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play
                </button>
                <button
                  type="button"
                  onClick={() => selectPlay(featured)}
                  className="inline-flex items-center gap-2 rounded-md bg-zinc-600/60 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-zinc-500/60"
                >
                  <Info className="h-4 w-4" />
                  More info
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {/* Rows */}
        <div className="mt-6 space-y-7 px-4 sm:px-6">
          {loading && library.length === 0 ? (
            <div className="space-y-7">
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r}>
                  <div className="mb-3 h-4 w-40 animate-pulse rounded bg-zinc-800" />
                  <div className="flex gap-3">
                    {Array.from({ length: 6 }).map((_, c) => (
                      <div key={c} className="aspect-[2/3] w-[132px] shrink-0 animate-pulse rounded-lg bg-zinc-900 sm:w-[150px]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : library.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-600">
              No titles found{query ? ` for “${query}”.` : "."}
            </p>
          ) : (
            <>
              {trendingRow.length > 0 ? (
                <section>
                  <h2 className="mb-1 text-base font-bold text-zinc-100">
                    Trending &amp; Famous
                    <span className="ml-2 text-xs font-normal text-zinc-500">
                      {trendingRow.length} titles
                    </span>
                  </h2>
                  <p className="mb-3 text-xs text-zinc-500">
                    Hollywood, Bollywood, Horror, Action, Sci-Fi, Pakistani &amp; Turkish dramas
                  </p>
                  <div className="history-scroll-hover flex gap-3 overflow-x-auto pb-2">
                    {trendingRow.map((item) => (
                      <PosterCard key={`trending-${item.id}`} item={item} onPlay={selectPlay} />
                    ))}
                  </div>
                </section>
              ) : null}
              {rows.map(({ genre, items }) => (
                <section key={genre}>
                  <h2 className="mb-3 text-base font-bold text-zinc-100">{genre}</h2>
                  <div className="history-scroll-hover flex gap-3 overflow-x-auto pb-2">
                    {items.map((item) => (
                      <PosterCard key={`${genre}-${item.id}`} item={item} onPlay={selectPlay} />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
        </>
        )}
      </div>

      {/* Player overlay */}
      {playing ? (
        <div className="absolute inset-0 z-[80] flex flex-col bg-black/97 p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white sm:text-base">{playing.title}</p>
              <p className="text-[11px] text-zinc-500">
                {playing.year} · {playing.genres.slice(0, 3).join(" · ") || playing.type}
                {playing.source === "jellyfin"
                  ? " · Jellyfin"
                  : playing.source === "library"
                    ? " · Library"
                    : " · Demo"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlaying(null)}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition hover:border-[#E50914]/60 hover:text-white"
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {playing.streamKind === "hls" ? (
              <HlsVideoPlayer
                key={playing.id}
                src={playing.streamUrl}
                autoPlay
                onError={(message) => {
                  if (!/autoplay/i.test(message)) setPlayError(message);
                }}
                onPlaying={() => setPlayError(null)}
                className="max-h-full w-full max-w-5xl rounded-lg bg-black"
              />
            ) : (
              <video
                key={playing.id}
                src={playing.streamUrl}
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                onContextMenu={(event) => event.preventDefault()}
                onError={() => setPlayError("Stream updating, please try another server")}
                className="max-h-full w-full max-w-5xl rounded-lg bg-black"
              />
            )}

            {playError ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/75 px-6 text-center">
                <p className="text-sm font-semibold text-white">Stream updating, please try another server</p>
                <p className="text-xs text-zinc-400">{playError}</p>
              </div>
            ) : null}
          </div>
          {playing.overview ? (
            <p className="mx-auto mt-3 max-w-3xl text-center text-xs leading-5 text-zinc-500 line-clamp-2">
              {playing.overview}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
