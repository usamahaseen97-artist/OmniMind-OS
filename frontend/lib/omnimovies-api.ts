import { getBackendUrl } from "./backend-url";
import { normalizeBackendResourceUrl } from "./api-config";

export type MovieCatalogItem = {
  id: string;
  title: string;
  year: string;
  type: "movie" | "series";
  genres: string[];
  overview: string;
  rating?: number;
  source: string;
  streamKind: "file" | "hls";
  streamUrl: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
};

export type MovieCatalogRow = {
  genre: string;
  items: MovieCatalogItem[];
};

export type MoviesCatalog = {
  source: string;
  count: number;
  hero: MovieCatalogItem | null;
  trendingNow: MovieCatalogItem[];
  personalizedForYou: MovieCatalogItem[];
  rows: MovieCatalogRow[];
  analytics?: {
    engine?: string;
    event_count?: number;
    kafka_topic?: string;
  };
};

type ApiMovie = {
  id: string;
  title: string;
  description?: string;
  overview?: string;
  category?: string;
  genres?: string[];
  release_year?: number;
  rating?: number;
  thumbnail_url?: string;
  poster_url?: string;
  backdrop_url?: string;
  stream_url?: string;
  stream_kind?: string;
  trailer_url?: string;
  source?: string;
};

function mapMovie(raw: ApiMovie, base: string): MovieCatalogItem {
  const streamRaw = raw.stream_url || `/api/v1/stream/${encodeURIComponent(raw.id)}`;
  const streamUrl = normalizeBackendResourceUrl(
    /^https?:\/\//i.test(streamRaw) ? streamRaw : `${base}${streamRaw}`,
  );
  const poster = raw.poster_url || raw.thumbnail_url || raw.backdrop_url || "";
  return {
    id: String(raw.id),
    title: raw.title,
    year: raw.release_year ? String(raw.release_year) : "",
    type: "movie",
    genres: raw.genres?.length ? raw.genres : raw.category ? [raw.category] : ["International"],
    overview: raw.overview || raw.description || "",
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    source: raw.source || "catalog",
    streamKind: (raw.stream_kind === "hls" ? "hls" : "file") as "file" | "hls",
    streamUrl,
    posterUrl: poster,
    backdropUrl: raw.backdrop_url || poster,
    trailerUrl: raw.trailer_url || undefined,
  };
}

function mapList(items: ApiMovie[] | undefined, base: string): MovieCatalogItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((m) => mapMovie(m, base));
}

const OFFLINE_MOVIES_FALLBACK: MoviesCatalog = {
  source: "resilient-fallback",
  count: 6,
  hero: {
    id: "inception",
    title: "Inception",
    year: "2010",
    type: "movie",
    genres: ["Mind-Bending Sci-Fi", "International"],
    overview: "A thief enters dreams to plant an idea — reality bends.",
    rating: 8.8,
    source: "international",
    streamKind: "hls",
    streamUrl:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
    posterUrl: "https://picsum.photos/seed/omni-inception/400/600",
    backdropUrl: "https://picsum.photos/seed/omni-back-inception/1280/720",
  },
  trendingNow: [],
  personalizedForYou: [],
  rows: [
    {
      genre: "Mind-Bending Sci-Fi",
      items: [
        {
          id: "inception",
          title: "Inception",
          year: "2010",
          type: "movie",
          genres: ["Sci-Fi"],
          overview: "Dream architecture and shared subconscious.",
          rating: 8.8,
          source: "international",
          streamKind: "hls",
          streamUrl:
            "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
          posterUrl: "https://picsum.photos/seed/omni-inception/400/600",
          backdropUrl: "https://picsum.photos/seed/omni-back-inception/1280/720",
        },
        {
          id: "interstellar",
          title: "Interstellar",
          year: "2014",
          type: "movie",
          genres: ["Sci-Fi"],
          overview: "Explorers travel through a wormhole to save humanity.",
          rating: 8.7,
          source: "international",
          streamKind: "hls",
          streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          posterUrl: "https://picsum.photos/seed/omni-interstellar/400/600",
          backdropUrl: "https://picsum.photos/seed/omni-back-interstellar/1280/720",
        },
        {
          id: "shutter-island",
          title: "Shutter Island",
          year: "2010",
          type: "movie",
          genres: ["Thriller"],
          overview: "A marshal investigates an isolated psychiatric facility.",
          rating: 8.2,
          source: "international",
          streamKind: "hls",
          streamUrl: "https://test-streams.mux.dev/pts_shift/master.m3u8",
          posterUrl: "https://picsum.photos/seed/omni-shutter/400/600",
          backdropUrl: "https://picsum.photos/seed/omni-back-shutter/1280/720",
        },
      ],
    },
  ],
};

OFFLINE_MOVIES_FALLBACK.trendingNow = OFFLINE_MOVIES_FALLBACK.rows[0].items;
OFFLINE_MOVIES_FALLBACK.personalizedForYou = OFFLINE_MOVIES_FALLBACK.rows[0].items.slice(1);

export async function fetchMoviesCatalog(
  query: string,
  signal?: AbortSignal,
  userId = "anonymous",
): Promise<MoviesCatalog> {
  let base: string;
  try {
    base = getBackendUrl();
  } catch {
    return { ...OFFLINE_MOVIES_FALLBACK };
  }
  const params = new URLSearchParams({ user_id: userId, limit: "80" });
  if (query.trim()) params.set("q", query.trim());
  let res: Response;
  try {
    res = await fetch(`${base}/api/v1/movies/catalog?${params}`, {
      signal,
      cache: "no-store",
    });
  } catch {
    return { ...OFFLINE_MOVIES_FALLBACK };
  }
  if (!res.ok) {
    return { ...OFFLINE_MOVIES_FALLBACK, source: `fallback-${res.status}` };
  }
  const data = (await res.json()) as {
    source?: string;
    count?: number;
    hero?: ApiMovie;
    trending_now?: ApiMovie[];
    personalized_for_you?: ApiMovie[];
    rows?: { genre: string; items: ApiMovie[] }[];
    analytics?: MoviesCatalog["analytics"];
    movies?: ApiMovie[];
  };

  const mapRow = (row: { genre: string; items: ApiMovie[] }) => ({
    genre: row.genre,
    items: mapList(row.items, base),
  });

  const mapped: MoviesCatalog = {
    source: data.source || "catalog",
    count: data.count ?? 0,
    hero: data.hero ? mapMovie(data.hero, base) : null,
    trendingNow: mapList(data.trending_now, base),
    personalizedForYou: mapList(data.personalized_for_you, base),
    rows: (data.rows || []).map(mapRow),
    analytics: data.analytics,
  };
  if (mapped.count > 0 && (mapped.trendingNow.length || mapped.rows.length)) {
    return mapped;
  }
  return { ...OFFLINE_MOVIES_FALLBACK, source: "resilient-fallback" };
}

export async function trackMovieEvent(
  payload: {
    movieId: string;
    action: "click" | "play" | "view" | "pause" | "skip" | "stop" | "buffer";
    userId?: string;
    title?: string;
    category?: string;
    genres?: string[];
    networkBitrate?: number;
    packetLossRatio?: number;
  },
  signal?: AbortSignal,
): Promise<void> {
  try {
    const base = getBackendUrl();
    await fetch(`${base}/api/v1/movies/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: payload.movieId,
        action: payload.action,
        user_id: payload.userId || "anonymous",
        title: payload.title || "",
        category: payload.category || "",
        genres: payload.genres || [],
        network_bitrate: payload.networkBitrate ?? 0,
        packet_loss_ratio: payload.packetLossRatio ?? 0,
      }),
      signal,
    });
  } catch {
    /* telemetry is best-effort */
  }
}
