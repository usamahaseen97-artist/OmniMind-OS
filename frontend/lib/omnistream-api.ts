import { getBackendUrl } from "./backend-url";
import { STREAM_CATALOG, STREAM_ROW_LABELS } from "./entertainment-catalog";

export type StreamCatalogItem = {
  id: string;
  title: string;
  year: string;
  type: "movie" | "series";
  genres: string[];
  overview: string;
  rating?: number;
  source: "jellyfin" | "library" | "demo";
  streamKind: "file" | "hls";
  streamUrl: string;
  posterUrl?: string;
  backdropUrl?: string;
};

export type StreamSource = "jellyfin" | "library" | "demo";

export type StreamLibrary = {
  source: StreamSource;
  configured: boolean;
  items: StreamCatalogItem[];
  error?: string;
};

const DEMO_LIBRARY: StreamCatalogItem[] = STREAM_CATALOG.map((title) => ({
  id: title.id,
  title: title.title,
  year: title.year,
  type: "movie",
  genres: [STREAM_ROW_LABELS[title.row], ...title.tags],
  overview: `${STREAM_ROW_LABELS[title.row]} · audio: ${title.audioOptions.join(", ")}.`,
  source: "demo",
  streamKind: "file",
  streamUrl: title.previewVideoUrl,
  posterUrl: undefined,
  backdropUrl: undefined,
}));

function filterDemo(query: string): StreamCatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return DEMO_LIBRARY;
  return DEMO_LIBRARY.filter((item) =>
    [item.title, item.year, ...item.genres].some((value) => value.toLowerCase().includes(q)),
  );
}

type FastApiMovie = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
  release_year?: number;
  stream_url?: string;
  stream_kind?: "hls" | "file";
  rating?: number;
};

function mapMovies(movies: FastApiMovie[], base: string): StreamCatalogItem[] {
  return movies.map((movie) => {
    const raw = movie.stream_url || `/api/v1/stream/${encodeURIComponent(movie.id)}`;
    const streamUrl = /^https?:\/\//i.test(raw) ? raw : `${base}${raw}`;
    const streamKind = movie.stream_kind ?? (raw.toLowerCase().endsWith(".m3u8") ? "hls" : "file");
    const poster =
      movie.thumbnail_url || `https://picsum.photos/seed/omni-${movie.id}/400/600`;
    return {
      id: String(movie.id),
      title: movie.title,
      year: movie.release_year ? String(movie.release_year) : "",
      type: "movie",
      genres: movie.category ? [movie.category] : [],
      overview: movie.description ?? "",
      rating: typeof movie.rating === "number" ? movie.rating : undefined,
      source: "library",
      streamKind,
      streamUrl,
      posterUrl: poster,
      backdropUrl: poster,
    };
  });
}

async function fetchDirectFromBackend(
  query: string,
  signal?: AbortSignal,
): Promise<StreamLibrary | null> {
  try {
    const base = getBackendUrl();
    const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    const res = await fetch(`${base}/api/v1/movies${q}`, { signal, cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { movies?: FastApiMovie[] };
    const movies = Array.isArray(data.movies) ? data.movies : [];
    if (movies.length === 0) return null;
    return { source: "library", configured: true, items: mapMovies(movies, base) };
  } catch {
    return null;
  }
}

export async function fetchStreamLibrary(
  query = "",
  signal?: AbortSignal,
): Promise<StreamLibrary> {
  try {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/omnistream/library?${params.toString()}`, {
      signal,
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as {
        configured?: boolean;
        source?: StreamSource;
        items?: StreamCatalogItem[];
      };
      if (data.configured && Array.isArray(data.items) && data.items.length > 0) {
        return { source: data.source ?? "library", configured: true, items: data.items };
      }
    }
  } catch {
    /* try direct backend */
  }

  const direct = await fetchDirectFromBackend(query, signal);
  if (direct) return direct;

  return { source: "demo", configured: false, items: filterDemo(query) };
}
