export type YouTubeLiveResolveStatus = "live" | "offline" | "fallback" | "error";

export type YouTubeLiveResolveInput = {
  channelUrl?: string;
  liveUrl?: string;
  fallbackVideoId?: string;
  fallbackEmbedUrl?: string;
  cacheTtlMs?: number;
};

export type YouTubeLiveResolveResult = {
  status: YouTubeLiveResolveStatus;
  videoId: string | null;
  embedUrl: string | null;
  liveUrl: string | null;
  fallback: boolean;
  cached: boolean;
  cacheExpiresAt: number;
  resolver: "yt-channel-info" | "scrape" | "fallback";
  error?: string;
};

type CacheEntry = {
  expiresAt: number;
  result: Omit<YouTubeLiveResolveResult, "cached">;
};

const LIVE_TTL_MS = 60_000;
const OFFLINE_TTL_MS = 180_000;
const ERROR_TTL_MS = 30_000;
const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{6,}$/;

const cache =
  ((globalThis as typeof globalThis & { __omnitvLiveCache?: Map<string, CacheEntry> })
    .__omnitvLiveCache ??= new Map<string, CacheEntry>());

function withEmbedParams(videoId: string): string {
  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("mute", "1");
  url.searchParams.set("rel", "0");
  return url.toString();
}

function extractVideoId(value?: string | null): string | null {
  if (!value) return null;
  return (
    value.match(/(?:\/embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/)?.[1] ??
    null
  );
}

function parseChannelRef(value?: string | null): { channelId: string; channelIdType: number } | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1]) return { channelId: parts[1], channelIdType: 1 };
    if (parts[0] === "user" && parts[1]) return { channelId: parts[1], channelIdType: 2 };
    if (parts[0] === "c" && parts[1]) return { channelId: parts[1], channelIdType: 3 };
    if (parts[0]?.startsWith("@")) return { channelId: parts[0].slice(1), channelIdType: 0 };
    if (parts[0] && !["watch", "embed", "live"].includes(parts[0])) {
      return { channelId: parts[0], channelIdType: 0 };
    }
  } catch {
    const cleaned = value.replace(/^@/, "").trim();
    if (cleaned) return { channelId: cleaned, channelIdType: 0 };
  }
  return null;
}

function findLiveVideoIdInUnknownPayload(payload: unknown): string | null {
  const seen = new Set<unknown>();

  function walk(node: unknown, liveContext: boolean): string | null {
    if (!node || seen.has(node)) return null;
    if (typeof node === "string") {
      const videoId = extractVideoId(node);
      return liveContext && videoId ? videoId : null;
    }
    if (typeof node !== "object") return null;
    seen.add(node);

    const record = node as Record<string, unknown>;
    const text = JSON.stringify(record).slice(0, 4000).toLowerCase();
    const nodeLooksLive =
      liveContext ||
      text.includes('"islive"') ||
      text.includes('"islivenow"') ||
      text.includes("live now") ||
      text.includes("watching") ||
      text.includes("streamed live") ||
      text.includes("upcoming");

    const direct = record.videoId;
    if (nodeLooksLive && typeof direct === "string" && YOUTUBE_ID_PATTERN.test(direct)) {
      return direct;
    }

    for (const value of Object.values(record)) {
      const found = walk(value, nodeLooksLive);
      if (found) return found;
    }
    return null;
  }

  return walk(payload, false);
}

async function resolveViaYtChannelInfo(
  input: YouTubeLiveResolveInput,
): Promise<{ videoId: string | null; error?: string }> {
  const channelRef = parseChannelRef(input.channelUrl) || parseChannelRef(input.liveUrl);
  if (!channelRef) return { videoId: null, error: "No channel reference for yt-channel-info" };

  try {
    const mod = await import("yt-channel-info");
    const ytch = mod.default as unknown as {
      getChannelVideos?: (payload: {
        channelId: string;
        channelIdType?: number;
        sortBy?: "newest" | "oldest" | "popular";
      }) => unknown;
    };

    if (typeof ytch.getChannelVideos !== "function") {
      return { videoId: null, error: "yt-channel-info getChannelVideos unavailable" };
    }

    const response = await Promise.resolve(
      ytch.getChannelVideos({
        channelId: channelRef.channelId,
        channelIdType: channelRef.channelIdType,
        sortBy: "newest",
      }),
    );

    const alertMessage =
      typeof response === "object" && response && "alertMessage" in response
        ? String((response as { alertMessage?: unknown }).alertMessage || "")
        : "";
    if (alertMessage) return { videoId: null, error: alertMessage };

    return { videoId: findLiveVideoIdInUnknownPayload(response) };
  } catch (error) {
    return {
      videoId: null,
      error: error instanceof Error ? error.message : "yt-channel-info lookup failed",
    };
  }
}

function normalizeYouTubeLiveUrl(input: YouTubeLiveResolveInput): string | null {
  const directVideoId = extractVideoId(input.liveUrl) || extractVideoId(input.channelUrl);
  if (directVideoId) return `https://www.youtube.com/watch?v=${directVideoId}`;

  const rawUrl = input.liveUrl || input.channelUrl;
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;
    const path = url.pathname.replace(/\/+$/, "");
    if (path.endsWith("/live")) return url.toString();
    if (/^\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)$/i.test(path)) {
      url.pathname = `${path}/live`;
      url.search = "";
      return url.toString();
    }
    return url.toString();
  } catch {
    return null;
  }
}

function parseLiveVideoId(html: string, responseUrl: string): string | null {
  const redirectedId = extractVideoId(responseUrl);
  if (redirectedId) return redirectedId;

  const candidates = [
    ...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{6,})"/g),
    ...html.matchAll(/watch\?v=([a-zA-Z0-9_-]{6,})/g),
  ]
    .map((match) => match[1])
    .filter((id, index, ids) => YOUTUBE_ID_PATTERN.test(id) && ids.indexOf(id) === index);

  if (!candidates.length) return null;

  const pageLooksLive =
    html.includes('"isLiveNow":true') ||
    html.includes('"style":"LIVE"') ||
    html.includes('LIVE NOW') ||
    html.includes('is live now');

  return pageLooksLive ? candidates[0] : null;
}

function setCache(
  key: string,
  result: Omit<YouTubeLiveResolveResult, "cached" | "cacheExpiresAt">,
  ttlMs: number,
): YouTubeLiveResolveResult {
  const expiresAt = Date.now() + ttlMs;
  const cachedResult = { ...result, cacheExpiresAt: expiresAt };
  cache.set(key, { expiresAt, result: cachedResult });
  return { ...cachedResult, cached: false };
}

function fallbackResult(
  input: YouTubeLiveResolveInput,
  liveUrl: string | null,
  error?: string,
): Omit<YouTubeLiveResolveResult, "cached" | "cacheExpiresAt"> {
  const fallbackId = input.fallbackVideoId || extractVideoId(input.fallbackEmbedUrl);
  return {
    status: fallbackId || input.fallbackEmbedUrl ? "fallback" : "offline",
    videoId: fallbackId,
    embedUrl: fallbackId ? withEmbedParams(fallbackId) : input.fallbackEmbedUrl || null,
    liveUrl,
    fallback: true,
    resolver: "fallback",
    error,
  };
}

export async function resolveYouTubeLiveVideo(
  input: YouTubeLiveResolveInput,
): Promise<YouTubeLiveResolveResult> {
  const liveUrl = normalizeYouTubeLiveUrl(input);
  const fallbackId = input.fallbackVideoId || extractVideoId(input.fallbackEmbedUrl);
  const cacheKey = liveUrl || fallbackId || input.channelUrl || "unknown";
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.result, cached: true };
  }

  if (!liveUrl) {
    return setCache(
      cacheKey,
      fallbackResult(input, null, "No valid YouTube channel/live URL supplied"),
      ERROR_TTL_MS,
    );
  }

  const ytChannelInfo = await resolveViaYtChannelInfo(input);
  if (ytChannelInfo.videoId) {
    return setCache(
      cacheKey,
      {
        status: "live",
        videoId: ytChannelInfo.videoId,
        embedUrl: withEmbedParams(ytChannelInfo.videoId),
        liveUrl,
        fallback: false,
        resolver: "yt-channel-info",
      },
      input.cacheTtlMs ?? LIVE_TTL_MS,
    );
  }

  try {
    const response = await fetch(liveUrl, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Accept: "text/html,*/*",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return setCache(
        cacheKey,
        fallbackResult(input, liveUrl, `YouTube returned ${response.status}`),
        ERROR_TTL_MS,
      );
    }

    const html = await response.text();
    const videoId = parseLiveVideoId(html, response.url);
    if (!videoId) {
      return setCache(
        cacheKey,
        fallbackResult(input, liveUrl, "Channel is offline or no embeddable live video was found"),
        OFFLINE_TTL_MS,
      );
    }

    return setCache(
      cacheKey,
      {
        status: "live",
        videoId,
        embedUrl: withEmbedParams(videoId),
        liveUrl,
        fallback: false,
        resolver: "scrape",
      },
      input.cacheTtlMs ?? LIVE_TTL_MS,
    );
  } catch (error) {
    return setCache(
      cacheKey,
      fallbackResult(
        input,
        liveUrl,
        error instanceof Error ? error.message : "Unable to fetch YouTube live page",
      ),
      ERROR_TTL_MS,
    );
  }
}

export function clearYouTubeLiveResolverCache() {
  cache.clear();
}

/* ------------------------------------------------------------------ *
 * Latest-upload resolution for VOD channels (dramas / sports / movies)
 * These channels are not 24/7 live, so we play their newest official
 * video instead. The channel RSS feed is public, key-free, and gives a
 * real video id we can embed reliably (unlike `videoseries` playlists).
 * ------------------------------------------------------------------ */

const UPLOAD_TTL_MS = 600_000; // 10 min
const UPLOAD_MISS_TTL_MS = 60_000;

const uploadCache =
  ((globalThis as typeof globalThis & {
    __omnitvUploadCache?: Map<string, { expiresAt: number; videoId: string | null }>;
  }).__omnitvUploadCache ??= new Map<string, { expiresAt: number; videoId: string | null }>());

export function uploadsPlaylistId(channelId: string | undefined): string | null {
  return channelId && /^UC[\w-]+$/.test(channelId) ? `UU${channelId.slice(2)}` : null;
}

/** Build an embeddable URL for a channel's latest upload (continues into the uploads playlist). */
export function buildUploadEmbed(
  videoId: string | null,
  channelId?: string,
): string | null {
  const list = uploadsPlaylistId(channelId);
  if (videoId) {
    const url = new URL(`https://www.youtube.com/embed/${videoId}`);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("mute", "1");
    url.searchParams.set("rel", "0");
    if (list) url.searchParams.set("list", list);
    return url.toString();
  }
  if (list) {
    const url = new URL("https://www.youtube.com/embed/videoseries");
    url.searchParams.set("list", list);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("mute", "1");
    url.searchParams.set("rel", "0");
    return url.toString();
  }
  return null;
}

export type YouTubeUpload = {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
};

const uploadsListCache =
  ((globalThis as typeof globalThis & {
    __omnitvUploadsListCache?: Map<string, { expiresAt: number; items: YouTubeUpload[] }>;
  }).__omnitvUploadsListCache ??= new Map<string, { expiresAt: number; items: YouTubeUpload[] }>());

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

/** Fetch a channel's recent uploads (episodes) from its public RSS feed. */
export async function resolveRecentUploads(
  channelId: string | undefined,
  limit = 24,
): Promise<YouTubeUpload[]> {
  if (!channelId || !/^UC[\w-]+$/.test(channelId)) return [];

  const cached = uploadsListCache.get(channelId);
  if (cached && cached.expiresAt > Date.now()) return cached.items.slice(0, limit);

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
          Accept: "application/atom+xml, text/xml, */*",
        },
      },
    );

    if (!res.ok) {
      uploadsListCache.set(channelId, { expiresAt: Date.now() + UPLOAD_MISS_TTL_MS, items: [] });
      return [];
    }

    const xml = await res.text();
    const items: YouTubeUpload[] = [];
    for (const entry of xml.split("<entry>").slice(1)) {
      const videoId = entry.match(/<yt:videoId>([a-zA-Z0-9_-]{6,})<\/yt:videoId>/)?.[1];
      if (!videoId) continue;
      const title = decodeXmlEntities(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ?? "";
      items.push({
        videoId,
        title: title || "Untitled",
        published,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    }

    uploadsListCache.set(channelId, {
      expiresAt: Date.now() + (items.length ? UPLOAD_TTL_MS : UPLOAD_MISS_TTL_MS),
      items,
    });
    return items.slice(0, limit);
  } catch {
    uploadsListCache.set(channelId, { expiresAt: Date.now() + UPLOAD_MISS_TTL_MS, items: [] });
    return [];
  }
}

/** Fetch the newest video id for a channel from its public RSS feed. */
export async function resolveLatestUploadVideoId(
  channelId: string | undefined,
): Promise<string | null> {
  if (!channelId || !/^UC[\w-]+$/.test(channelId)) return null;

  const cached = uploadCache.get(channelId);
  if (cached && cached.expiresAt > Date.now()) return cached.videoId;

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
          Accept: "application/atom+xml, text/xml, */*",
        },
      },
    );

    if (!res.ok) {
      uploadCache.set(channelId, { expiresAt: Date.now() + UPLOAD_MISS_TTL_MS, videoId: null });
      return null;
    }

    const xml = await res.text();
    const videoId =
      xml.match(/<yt:videoId>([a-zA-Z0-9_-]{6,})<\/yt:videoId>/)?.[1] ||
      xml.match(/<videoId>([a-zA-Z0-9_-]{6,})<\/videoId>/)?.[1] ||
      extractVideoId(xml.match(/<link[^>]+href="([^"]+watch\?v=[^"]+)"/)?.[1]) ||
      null;

    uploadCache.set(channelId, {
      expiresAt: Date.now() + (videoId ? UPLOAD_TTL_MS : UPLOAD_MISS_TTL_MS),
      videoId,
    });
    return videoId;
  } catch {
    uploadCache.set(channelId, { expiresAt: Date.now() + UPLOAD_MISS_TTL_MS, videoId: null });
    return null;
  }
}
