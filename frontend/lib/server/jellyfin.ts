/**
 * Server-side Jellyfin (open-source media server) client.
 *
 * The API key stays on the server. The browser only talks to our own
 * /api/omnistream/* routes, which proxy Jellyfin for library, images and video.
 *
 * Configure via env (see .env.local.example):
 *   JELLYFIN_URL      e.g. http://192.168.1.10:8096
 *   JELLYFIN_API_KEY  Jellyfin Dashboard → API Keys
 *   JELLYFIN_USER_ID  (optional) — auto-detected from /Users if omitted
 */

const JELLYFIN_URL = (process.env.JELLYFIN_URL || "").replace(/\/$/, "");
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY || "";

let cachedUserId = process.env.JELLYFIN_USER_ID || "";

export type JellyfinCatalogItem = {
  id: string;
  title: string;
  type: "movie" | "series";
  year: string;
  overview: string;
  genres: string[];
  rating?: number;
  hasPrimary: boolean;
  hasBackdrop: boolean;
};

export function isJellyfinConfigured(): boolean {
  return Boolean(JELLYFIN_URL && JELLYFIN_API_KEY);
}

export function getJellyfinBaseUrl(): string {
  return JELLYFIN_URL;
}

function withKey(path: string, params: Record<string, string | number | boolean> = {}): URL {
  const url = new URL(`${JELLYFIN_URL}${path}`);
  url.searchParams.set("api_key", JELLYFIN_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function jfJson<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const res = await fetch(withKey(path, params), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Jellyfin ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const users = await jfJson<Array<{ Id?: string }>>("/Users");
  cachedUserId = users?.[0]?.Id ?? "";
  if (!cachedUserId) throw new Error("No Jellyfin user found");
  return cachedUserId;
}

type RawItem = {
  Id: string;
  Name?: string;
  Type?: string;
  ProductionYear?: number;
  Overview?: string;
  Genres?: string[];
  CommunityRating?: number;
  ImageTags?: { Primary?: string };
  BackdropImageTags?: string[];
};

function normalize(item: RawItem): JellyfinCatalogItem {
  return {
    id: item.Id,
    title: item.Name ?? "Untitled",
    type: item.Type === "Series" ? "series" : "movie",
    year: item.ProductionYear ? String(item.ProductionYear) : "",
    overview: item.Overview ?? "",
    genres: Array.isArray(item.Genres) ? item.Genres : [],
    rating: typeof item.CommunityRating === "number" ? item.CommunityRating : undefined,
    hasPrimary: Boolean(item.ImageTags?.Primary),
    hasBackdrop: Array.isArray(item.BackdropImageTags) && item.BackdropImageTags.length > 0,
  };
}

export async function getJellyfinLibrary(query?: string): Promise<JellyfinCatalogItem[]> {
  const userId = await getUserId();
  const data = await jfJson<{ Items?: RawItem[] }>(`/Users/${userId}/Items`, {
    IncludeItemTypes: "Movie,Series",
    Recursive: true,
    Fields: "Genres,Overview,ProductionYear",
    SortBy: "SortName",
    SortOrder: "Ascending",
    ImageTypeLimit: 1,
    EnableImageTypes: "Primary,Backdrop",
    Limit: 500,
    ...(query?.trim() ? { SearchTerm: query.trim() } : {}),
  });
  return (data.Items ?? []).map(normalize);
}

/** Proxy an item image (Primary poster / Backdrop) from Jellyfin. */
export async function fetchJellyfinImage(
  id: string,
  type: "Primary" | "Backdrop",
): Promise<Response> {
  return fetch(withKey(`/Items/${id}/Images/${type}`, { quality: 90 }), {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}

/**
 * Proxy a direct (static) video stream, forwarding the browser's Range header so
 * the <video> element can seek. Works for browser-friendly containers (mp4/webm).
 */
export async function fetchJellyfinStream(id: string, range: string | null): Promise<Response> {
  return fetch(
    withKey(`/Videos/${id}/stream`, { static: true, mediaSourceId: id }),
    {
      headers: range ? { Range: range } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    },
  );
}
