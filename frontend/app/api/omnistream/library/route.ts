import { getJellyfinLibrary, isJellyfinConfigured } from "../../../../lib/server/jellyfin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same port as frontend/lib/backend-url.ts — fixed 8001, no multi-port probe
const BACKEND_BASE =
  process.env.OMNIMIND_BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001";

async function resolveBackendBase(): Promise<string> {
  return BACKEND_BASE;
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

/** Fallback source: the FastAPI streaming backend (featured catalog + local media). */
async function fetchFastApiLibrary(query: string) {
  const base = await resolveBackendBase();
  if (!base) return null;
  try {
    const url = `${base}/api/v1/movies${query ? `?q=${encodeURIComponent(query)}` : ""}`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { movies?: FastApiMovie[] };
    const movies = Array.isArray(data.movies) ? data.movies : [];
    if (movies.length === 0) return null;

    const items = movies.map((movie) => {
      const raw = movie.stream_url || `/api/v1/stream/${encodeURIComponent(movie.id)}`;
      // Remote (http) streams play directly; relative paths resolve to the backend.
      const streamUrl = /^https?:\/\//i.test(raw) ? raw : `${base}${raw}`;
      const streamKind = movie.stream_kind ?? (raw.toLowerCase().endsWith(".m3u8") ? "hls" : "file");
      return {
        id: String(movie.id),
        title: movie.title,
        year: movie.release_year ? String(movie.release_year) : "",
        type: "movie" as const,
        genres: movie.category ? [movie.category] : [],
        overview: movie.description ?? "",
        rating: typeof movie.rating === "number" ? movie.rating : undefined,
        source: "library" as const,
        streamKind,
        streamUrl,
        posterUrl: movie.thumbnail_url || `https://picsum.photos/seed/omni-${movie.id}/400/600`,
        backdropUrl: movie.thumbnail_url || `https://picsum.photos/seed/omni-${movie.id}/1280/720`,
      };
    });
    return { configured: true, source: "library" as const, count: items.length, items };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get("q") ?? "";

  if (!isJellyfinConfigured()) {
    const fastApi = await fetchFastApiLibrary(query);
    if (fastApi) return Response.json(fastApi);
    return Response.json({ configured: false, source: "demo", items: [] });
  }

  try {
    const library = await getJellyfinLibrary(query);
    const items = library.map((item) => ({
      id: item.id,
      title: item.title,
      year: item.year,
      type: item.type,
      genres: item.genres,
      overview: item.overview,
      rating: item.rating,
      source: "jellyfin" as const,
      streamKind: "file" as const,
      streamUrl: `/api/omnistream/stream/${encodeURIComponent(item.id)}`,
      posterUrl: item.hasPrimary
        ? `/api/omnistream/image/${encodeURIComponent(item.id)}?type=Primary`
        : undefined,
      backdropUrl: item.hasBackdrop
        ? `/api/omnistream/image/${encodeURIComponent(item.id)}?type=Backdrop`
        : undefined,
    }));
    return Response.json({ configured: true, source: "jellyfin", count: items.length, items });
  } catch (error) {
    return Response.json(
      {
        configured: true,
        source: "jellyfin",
        items: [],
        error: error instanceof Error ? error.message : "Unable to reach Jellyfin",
      },
      { status: 502 },
    );
  }
}
