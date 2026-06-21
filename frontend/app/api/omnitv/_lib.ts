import legalChannels from "../../../data/channels.json";
import {
  LIVE_TV_CATEGORIES,
  normalizeLegalChannels,
  toYouTubeChannelLiveEmbed,
  toYouTubeEmbedFromId,
  toYouTubeUploadsEmbed,
  withYouTubePlayerParams,
  type LegalLiveChannel,
  type LiveTvCategory,
} from "../../../lib/live-tv-api";
import { publishOmniTVEvent } from "../../../lib/server/omnitv-events";
import {
  buildUploadEmbed,
  resolveLatestUploadVideoId,
  resolveRecentUploads,
  resolveYouTubeLiveVideo,
} from "../../../lib/server/youtube-live-resolver";

export const CHANNELS = normalizeLegalChannels(legalChannels);

export function filterChannels({
  category = "All",
  query = "",
}: {
  category?: LiveTvCategory;
  query?: string;
}): LegalLiveChannel[] {
  const q = query.trim().toLowerCase();
  return CHANNELS.filter((channel) => category === "All" || channel.category === category).filter(
    (channel) => {
      if (!q) return true;
      return [
        channel.name,
        channel.category,
        channel.country,
        channel.language,
        channel.description,
        ...channel.tags,
      ].some((value) => value.toLowerCase().includes(q));
    },
  );
}

export function isLiveTvCategory(value: string): value is LiveTvCategory {
  return (LIVE_TV_CATEGORIES as readonly string[]).includes(value);
}

export async function resolveChannelLive(channel: LegalLiveChannel) {
  const result = !channel.isLive
    ? await uploadsPlaylistResult(channel)
    : await resolveYouTubeLiveVideo({
        channelUrl: channel.youtubeChannel,
        liveUrl: channel.youtubeLiveUrl || channel.liveUrl,
        fallbackVideoId: channel.youtubeId,
        fallbackEmbedUrl: resolveStaticEmbed(channel),
      });

  // A "live" channel that isn't actually broadcasting right now: fall back to
  // its latest official upload so the player still plays something legal.
  if (channel.isLive && result.status !== "live" && channel.youtubeChannelId) {
    const videoId = await resolveLatestUploadVideoId(channel.youtubeChannelId);
    const embedUrl = buildUploadEmbed(videoId, channel.youtubeChannelId);
    if (embedUrl) {
      result.embedUrl = embedUrl;
      result.videoId = videoId;
      result.fallback = true;
    }
  }

  // Emit a health event onto the OmniTV event stream (telemetry only, not video).
  // Skip cached hits to avoid flooding the bus with duplicates.
  if (!result.cached) {
    void publishOmniTVEvent({
      type: "channel.health",
      channelId: channel.id,
      channelName: channel.name,
      status: result.status,
      resolver: result.resolver,
      videoId: result.videoId,
      at: Date.now(),
    });
  }

  return result;
}

/**
 * VOD / upload channels (dramas, sports highlights, movies) are not 24/7 live,
 * so live scraping always fails for them. Serve the official uploads playlist
 * directly instead of showing "temporarily unavailable".
 */
async function uploadsPlaylistResult(
  channel: LegalLiveChannel,
): Promise<Awaited<ReturnType<typeof resolveYouTubeLiveVideo>>> {
  const videoId = await resolveLatestUploadVideoId(channel.youtubeChannelId);
  const embedUrl =
    buildUploadEmbed(videoId, channel.youtubeChannelId) ?? resolveStaticEmbed(channel) ?? null;
  return {
    status: embedUrl ? "fallback" : "offline",
    videoId,
    embedUrl,
    liveUrl: channel.youtubeLiveUrl || channel.liveUrl || null,
    fallback: true,
    cached: false,
    cacheExpiresAt: 0,
    resolver: "fallback",
  };
}

export async function getChannelEpisodes(channel: LegalLiveChannel) {
  if (channel.sourceType !== "youtube") return [];
  return resolveRecentUploads(channel.youtubeChannelId);
}

export function resolveStaticEmbed(channel: LegalLiveChannel): string | undefined {
  // Prefer the uploads playlist over a live_stream embed: the playlist always
  // plays the channel's latest official video, while live_stream only works
  // while the channel is actually broadcasting.
  return (
    toYouTubeEmbedFromId(channel.youtubeId) ||
    toYouTubeUploadsEmbed(channel.youtubeChannelId) ||
    toYouTubeChannelLiveEmbed(channel.youtubeChannelId) ||
    withYouTubePlayerParams(channel.embedUrl)
  );
}
