import legalChannels from "../data/channels.json";

export const LIVE_TV_CATEGORIES = ["All", "Live News", "Sports", "Dramas", "Movies"] as const;

export type LiveTvCategory = (typeof LIVE_TV_CATEGORIES)[number];

export type LegalLiveChannel = {
  id: string;
  name: string;
  category: Exclude<LiveTvCategory, "All">;
  country: string;
  language: string;
  sourceType: "youtube" | "hls" | "external";
  type?: "youtube" | "hls" | "external";
  youtubeId?: string;
  youtubeHandle?: string;
  youtubeChannelId?: string;
  youtubeChannel?: string;
  youtubeLiveUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  embed?: string;
  embedUrl?: string;
  hlsUrl?: string;
  officialUrl: string;
  description: string;
  tags: string[];
  posterGradient: string;
  isLive: boolean;
  verifiedLegal: boolean;
  legalSource?: boolean;
};

const OMNITV_API_URL = process.env.NEXT_PUBLIC_OMNITV_API_URL?.replace(/\/$/, "") || "";

type ChannelJsonRow = Omit<Partial<LegalLiveChannel>, "id"> & {
  id?: string | number;
  type?: "youtube" | "hls" | "external";
  youtubeId?: string;
  youtubeHandle?: string;
  youtubeChannel?: string;
  youtubeLiveUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  embed?: string;
  stream?: string;
  legalSource?: boolean;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategory(value: unknown): Exclude<LiveTvCategory, "All"> {
  const normalized = String(value || "").trim().toLowerCase();
  const mapped =
    normalized === "news" || normalized === "live news"
      ? "Live News"
      : normalized === "sport" || normalized === "sports"
        ? "Sports"
        : normalized === "drama" || normalized === "dramas"
          ? "Dramas"
          : normalized === "movie" || normalized === "movies"
            ? "Movies"
            : value;
  return LIVE_TV_CATEGORIES.includes(mapped as LiveTvCategory) && mapped !== "All"
    ? (mapped as Exclude<LiveTvCategory, "All">)
    : "Live News";
}

export function withYouTubePlayerParams(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("autoplay", "1");
    parsed.searchParams.set("mute", "1");
    parsed.searchParams.set("rel", "0");
    return parsed.toString();
  } catch {
    return url;
  }
}

function extractYouTubeId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:\/embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return match?.[1];
}

function extractYouTubeChannelId(url: string | undefined): string | undefined {
  return url?.match(/youtube\.com\/channel\/([^/?#]+)/)?.[1];
}

function extractYouTubeHandle(url: string | undefined): string | undefined {
  return url?.match(/youtube\.com\/@([^/?#]+)/)?.[1];
}

function youtubeEmbedFromId(videoId: string | undefined): string | undefined {
  return videoId ? withYouTubePlayerParams(`https://www.youtube.com/embed/${videoId}`) : undefined;
}

function youtubeChannelLiveEmbed(channelId: string | undefined): string | undefined {
  return channelId
    ? withYouTubePlayerParams(`https://www.youtube.com/embed/live_stream?channel=${channelId}`)
    : undefined;
}

/**
 * Embed a channel's "uploads" playlist (latest official videos). This is the
 * correct embed for VOD channels (dramas, sports highlights, movies) that do not
 * run a 24/7 live stream. YouTube's uploads playlist id = channel id with the
 * leading "UC" replaced by "UU".
 */
function youtubeUploadsEmbed(channelId: string | undefined): string | undefined {
  if (!channelId || !/^UC[\w-]+$/.test(channelId)) return undefined;
  const uploadsPlaylist = `UU${channelId.slice(2)}`;
  return withYouTubePlayerParams(
    `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylist}`,
  );
}

export const toYouTubeEmbedFromId = youtubeEmbedFromId;
export const toYouTubeChannelLiveEmbed = youtubeChannelLiveEmbed;
export const toYouTubeUploadsEmbed = youtubeUploadsEmbed;

function isTrustedPublicSource(row: ChannelJsonRow): boolean {
  const sourceType = row.sourceType ?? row.type;
  const embedUrl = row.embedUrl ?? row.embed ?? "";
  const youtubeLiveUrl = row.youtubeLiveUrl ?? row.liveUrl ?? row.officialUrl ?? "";
  if (row.verifiedLegal === true || row.legalSource === true) return true;
  if (sourceType === "youtube") {
    return Boolean(
      row.youtubeId ||
        row.youtubeChannelId ||
        row.youtubeChannel ||
        /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//.test(embedUrl) ||
        /^https:\/\/(www\.)?youtube\.com\/(@[^/]+|channel\/[^/]+)\/live/.test(youtubeLiveUrl),
    );
  }
  return false;
}

export function normalizeLegalChannels(data: unknown): LegalLiveChannel[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as ChannelJsonRow;
    const sourceType = row.sourceType ?? row.type;
    const youtubeId = row.youtubeId ?? extractYouTubeId(row.embedUrl ?? row.embed);
    const youtubeChannel = row.youtubeChannel;
    const youtubeChannelId = row.youtubeChannelId ?? extractYouTubeChannelId(youtubeChannel);
    const youtubeHandle = row.youtubeHandle ?? extractYouTubeHandle(youtubeChannel);
    const youtubeLiveUrl =
      row.youtubeLiveUrl ||
      (sourceType === "youtube" ? row.liveUrl : undefined) ||
      (youtubeHandle ? `https://www.youtube.com/@${youtubeHandle.replace(/^@/, "")}/live` : undefined);
    const isLive = row.isLive ?? sourceType === "youtube";
    const embedUrl =
      sourceType === "youtube"
        ? youtubeEmbedFromId(youtubeId) ||
          withYouTubePlayerParams(row.embedUrl ?? row.embed) ||
          (isLive
            ? youtubeChannelLiveEmbed(youtubeChannelId)
            : youtubeUploadsEmbed(youtubeChannelId)) ||
          youtubeUploadsEmbed(youtubeChannelId) ||
          youtubeChannelLiveEmbed(youtubeChannelId)
        : row.embedUrl ?? row.embed;
    const hlsUrl = row.hlsUrl ?? row.stream ?? (sourceType === "hls" ? row.liveUrl : undefined);
    if (
      !row.name ||
      (sourceType !== "youtube" && sourceType !== "hls" && sourceType !== "external")
    ) {
      return [];
    }
    if (!isTrustedPublicSource(row)) return [];

    const channel: LegalLiveChannel = {
      id: row.id === undefined || row.id === null ? slugify(row.name) : String(row.id),
      name: row.name,
      category: normalizeCategory(row.category),
      country: row.country || "Global",
      language: row.language || "Unknown",
      sourceType,
      type: sourceType,
      youtubeId,
      youtubeHandle,
      youtubeChannelId,
      youtubeChannel,
      youtubeLiveUrl,
      liveUrl: row.liveUrl,
      thumbnail: row.thumbnail,
      embed: embedUrl,
      embedUrl,
      hlsUrl,
      officialUrl: youtubeLiveUrl || row.officialUrl || row.liveUrl || embedUrl || hlsUrl || "#",
      description: row.description || `Official ${sourceType.toUpperCase()} source for ${row.name}.`,
      tags: Array.isArray(row.tags) ? row.tags : [row.name, sourceType],
      posterGradient: row.posterGradient || "from-emerald-950 via-zinc-950 to-black",
      isLive,
      verifiedLegal: true,
      legalSource: true,
    };
    return [channel];
  });
}

export const LEGAL_CHANNEL_FALLBACK: LegalLiveChannel[] = normalizeLegalChannels(legalChannels);

export async function resolveYouTubeEmbed(
  channel: LegalLiveChannel,
  signal?: AbortSignal,
): Promise<string | undefined> {
  if (channel.sourceType !== "youtube") return undefined;

  try {
    const res = await fetch(`${OMNITV_API_URL}/api/omnitv/channels/${channel.id}/live`, {
      signal,
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { embedUrl?: string };
      if (data.embedUrl) return withYouTubePlayerParams(data.embedUrl);
    }
  } catch {
    // Fall back to the static official embed when the optional Express API is off.
  }

  return withYouTubePlayerParams(channel.embedUrl);
}

export type ChannelEpisode = {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
};

export async function fetchChannelEpisodes(
  channelId: string,
  signal?: AbortSignal,
): Promise<ChannelEpisode[]> {
  try {
    const res = await fetch(`${OMNITV_API_URL}/api/omnitv/channels/${channelId}/episodes`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { episodes?: ChannelEpisode[] };
    return Array.isArray(data.episodes) ? data.episodes : [];
  } catch {
    return [];
  }
}

export async function fetchLegalChannels(
  category: LiveTvCategory = "All",
  query = "",
  signal?: AbortSignal,
): Promise<LegalLiveChannel[]> {
  const params = new URLSearchParams();
  if (category !== "All") params.set("category", category);
  if (query.trim()) params.set("q", query.trim());

  try {
    const res = await fetch(`${OMNITV_API_URL}/api/omnitv/channels?${params.toString()}`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Channel API ${res.status}`);
    const data = (await res.json()) as { channels?: unknown };
    const channels = normalizeLegalChannels(data.channels);
    if (channels.length > 0 || query.trim()) return channels;
  } catch {
    // Express API is optional in local dev; keep the UI functional from JSON.
  }

  const q = query.trim().toLowerCase();
  return LEGAL_CHANNEL_FALLBACK.filter((channel) => {
    if (category !== "All" && channel.category !== category) return false;
    if (!q) return true;
    return [
      channel.name,
      channel.category,
      channel.country,
      channel.language,
      channel.description,
      ...channel.tags,
    ].some((value) => value.toLowerCase().includes(q));
  });
}
