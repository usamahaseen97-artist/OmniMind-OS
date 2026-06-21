"use client";

import { Film, Info, Play, Search, Server, Star, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { estimateNetworkTelemetry } from "../../lib/bigdata-api";
import {
  fetchMoviesCatalog,
  trackMovieEvent,
  type MovieCatalogItem,
  type MoviesCatalog,
} from "../../lib/omnimovies-api";
import {
  entertainmentHorizontalRail,
  entertainmentHorizontalScroll,
} from "../../lib/responsive-layout";
import { cn } from "../../lib/utils";
import { useEntertainmentMood } from "./EntertainmentMoodProvider";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

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

function PosterCard({
  item,
  onPlay,
  onClickTrack,
}: {
  item: MovieCatalogItem;
  onPlay: (item: MovieCatalogItem) => void;
  onClickTrack: (item: MovieCatalogItem) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const poster = item.posterUrl && !imgError ? item.posterUrl : null;

  return (
    <button
      type="button"
      onClick={() => {
        onClickTrack(item);
        onPlay(item);
      }}
      title={item.title}
      className="group relative aspect-[2/3] w-[128px] shrink-0 overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-900 text-left transition duration-200 hover:z-10 hover:scale-[1.03] hover:border-[#E50914]/70 sm:w-[148px] md:w-[156px]"
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
        <div className={cn("flex h-full w-full flex-col justify-end bg-gradient-to-br p-2", gradientFor(item.id))}>
          <p className="line-clamp-3 text-xs font-bold text-white">{item.title}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2 pt-10">
        <p className="line-clamp-2 text-xs font-bold leading-tight text-white">{item.title}</p>
        <p className="mt-0.5 text-[10px] text-zinc-400">
          {item.year || "—"}
          {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ""}
        </p>
      </div>

      {item.rating && item.rating >= 8 ? (
        <span className="absolute left-1.5 top-1.5 rounded bg-[#E50914] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
          Top
        </span>
      ) : null}

      <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <Play className="h-5 w-5 fill-current" />
        </span>
      </div>
    </button>
  );
}

function MovieRow({
  title,
  subtitle,
  items,
  onPlay,
  onClickTrack,
}: {
  title: string;
  subtitle?: string;
  items: MovieCatalogItem[];
  onPlay: (item: MovieCatalogItem) => void;
  onClickTrack: (item: MovieCatalogItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="min-w-0 w-full max-w-full">
      <h2 className="mb-1 truncate text-base font-bold text-zinc-100">{title}</h2>
      {subtitle ? <p className="mb-3 text-xs text-zinc-500">{subtitle}</p> : <div className="mb-3" />}
      <div className={entertainmentHorizontalRail}>
        <div className={cn(entertainmentHorizontalScroll, "gap-3 pr-3")}>
          <div className="inline-flex w-max min-w-0 snap-x snap-mandatory gap-3">
          {items.map((item) => (
            <PosterCard
              key={`${title}-${item.id}`}
              item={item}
              onPlay={onPlay}
              onClickTrack={onClickTrack}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface OmniMoviesViewProps {
  userId?: string;
}

export function OmniMoviesView({ userId = "anonymous" }: OmniMoviesViewProps) {
  const { mood, bufferHealing } = useEntertainmentMood();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<MoviesCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<MovieCatalogItem | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchMoviesCatalog(query, ctrl.signal, userId)
        .then(setCatalog)
        .catch((err: Error) => {
          setCatalog(null);
          setError(err.message || "Could not load movies");
        })
        .finally(() => setLoading(false));
    }, 280);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, userId]);

  const onClickTrack = useCallback(
    (item: MovieCatalogItem) => {
      const net = estimateNetworkTelemetry();
      void trackMovieEvent({
        movieId: item.id,
        action: "click",
        userId,
        title: item.title,
        category: item.genres[0],
        genres: item.genres,
        networkBitrate: net.networkBitrate,
        packetLossRatio: net.packetLossRatio,
      });
    },
    [userId],
  );

  const selectPlay = useCallback(
    (item: MovieCatalogItem) => {
      setPlayError(null);
      setPlaying(item);
      const net = estimateNetworkTelemetry();
      void trackMovieEvent({
        movieId: item.id,
        action: "play",
        userId,
        title: item.title,
        category: item.genres[0],
        genres: item.genres,
        networkBitrate: net.networkBitrate,
        packetLossRatio: net.packetLossRatio,
      });
    },
    [userId],
  );

  const hero = useMemo(
    () => catalog?.hero ?? catalog?.trendingNow[0] ?? null,
    [catalog],
  );

  const sourceLabel = useMemo(() => {
    if (!catalog) return "Loading…";
    if (catalog.source === "tmdb") return `${catalog.count} international titles · TMDB`;
    return `${catalog.count} titles · curated + streaming`;
  }, [catalog]);

  return (
    <div className="relative flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden text-zinc-100">
      <header className="z-30 flex h-14 max-h-14 shrink-0 min-w-0 items-center gap-2 border-b mood-accent-border bg-black/40 px-4 py-2 backdrop-blur-xl sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <Film className="h-5 w-5 mood-accent-text" />
          <span className="text-lg font-black tracking-tight mood-accent-text">OmniMovies</span>
          {mood ? (
            <span className="hidden rounded-full border mood-accent-border px-2 py-0.5 text-[10px] text-zinc-400 lg:inline">
              {mood.theme_label}
            </span>
          ) : null}
          <span className="hidden rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-400 sm:inline">
            Movies
          </span>
        </div>
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Hollywood & international movies…"
            className="w-full rounded-full border border-zinc-700 bg-[#16161c] py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#E50914]/60"
          />
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 sm:inline-flex">
          <Server className="h-3.5 w-3.5" />
          {sourceLabel}
        </span>
      </header>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-16">
        {error && !loading ? (
          <p className="px-6 py-16 text-center text-sm text-amber-400">{error}</p>
        ) : null}

        {hero ? (
          <section className="relative mx-4 mt-4 min-w-0 max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-zinc-800/60 sm:mx-6 sm:max-w-[calc(100%-3rem)]">
            {hero.backdropUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${hero.backdropUrl})` }}
              />
            ) : (
              <div className={cn("absolute inset-0 bg-gradient-to-br", gradientFor(hero.id))} />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
            <div className="relative flex min-h-[200px] flex-col justify-end gap-3 p-5 sm:min-h-[280px] sm:p-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E50914]">
                {catalog?.personalizedForYou.length ? "Personalized for You" : "Trending Now"}
              </span>
              <h1 className="max-w-2xl text-2xl font-black leading-tight text-white sm:text-4xl">
                {hero.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                {hero.year ? <span>{hero.year}</span> : null}
                {hero.rating ? (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {hero.rating.toFixed(1)}
                  </span>
                ) : null}
                {hero.genres.slice(0, 3).map((g) => (
                  <span key={g} className="text-zinc-400">
                    {g}
                  </span>
                ))}
              </div>
              {hero.overview ? (
                <p className="max-w-2xl text-sm leading-6 text-zinc-300 line-clamp-3">{hero.overview}</p>
              ) : null}
              <div className="mt-1 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => selectPlay(hero)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-zinc-200"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play
                </button>
                {hero.trailerUrl ? (
                  <a
                    href={hero.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-600 bg-zinc-800/60 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    <Info className="h-4 w-4" />
                    Trailer
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-6 box-border min-w-0 w-full max-w-full space-y-8 px-4 sm:px-6">
          {loading && !catalog ? (
            <div className="space-y-8">
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="min-w-0">
                  <div className="mb-3 h-4 w-48 animate-pulse rounded bg-zinc-800" />
                  <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <div
                        key={c}
                        className="aspect-[2/3] w-[128px] shrink-0 animate-pulse rounded-lg bg-zinc-900"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : catalog ? (
            <>
              <MovieRow
                title="Trending Now"
                subtitle="Kafka → movie-events · Spark mood & recommendations"
                items={catalog.trendingNow}
                onPlay={selectPlay}
                onClickTrack={onClickTrack}
              />
              <MovieRow
                title="Personalized for You"
                subtitle={`Based on watch history · ${catalog.analytics?.engine ?? "python"} engine`}
                items={catalog.personalizedForYou}
                onPlay={selectPlay}
                onClickTrack={onClickTrack}
              />
              {catalog.rows.map((row) => (
                <MovieRow
                  key={row.genre}
                  title={row.genre}
                  items={row.items}
                  onPlay={selectPlay}
                  onClickTrack={onClickTrack}
                />
              ))}
            </>
          ) : null}
        </div>
      </div>

      {playing ? (
        <div className="absolute inset-0 z-[80] flex flex-col bg-black/97 p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white sm:text-base">{playing.title}</p>
              <p className="truncate text-[11px] text-zinc-500">
                {playing.year} · {playing.genres.slice(0, 3).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlaying(null)}
              className="shrink-0 rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:text-white"
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {playing.streamKind === "hls" ? (
              <HlsVideoPlayer
                key={`${playing.id}-${bufferHealing?.recommended_variant ?? "auto"}`}
                src={playing.streamUrl}
                autoPlay
                preferredVariant={bufferHealing?.recommended_variant}
                onError={(msg) => {
                  if (!/autoplay/i.test(msg)) setPlayError(msg);
                  const net = estimateNetworkTelemetry();
                  void trackMovieEvent({
                    movieId: playing.id,
                    action: "buffer",
                    userId,
                    title: playing.title,
                    category: playing.genres[0],
                    genres: playing.genres,
                    networkBitrate: net.networkBitrate,
                    packetLossRatio: Math.min(0.15, (net.packetLossRatio || 0) + 0.03),
                  });
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
                className="max-h-full w-full max-w-5xl rounded-lg bg-black"
                onError={() => setPlayError("Stream unavailable — try another title")}
              />
            )}
            {playError ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/75 px-6 text-center text-sm text-white">
                {playError}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
