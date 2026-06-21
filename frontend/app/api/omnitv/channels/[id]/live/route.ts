import { CHANNELS, resolveChannelLive, resolveStaticEmbed } from "../../../_lib";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const channel = CHANNELS.find((item) => item.id === id);

  if (!channel) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }
  if (channel.sourceType !== "youtube") {
    return Response.json({ error: "Channel is not a YouTube source" }, { status: 400 });
  }

  try {
    const live = await resolveChannelLive(channel);

    return Response.json({
      channelId: channel.id,
      videoId: live.videoId,
      embedUrl: live.embedUrl || resolveStaticEmbed(channel),
      officialUrl: channel.youtubeLiveUrl || channel.officialUrl,
      status: live.status,
      resolved: live.status === "live",
      fallback: live.fallback,
      cached: live.cached,
      cacheExpiresAt: live.cacheExpiresAt,
      error: live.error,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to resolve YouTube live stream",
        embedUrl: resolveStaticEmbed(channel),
        officialUrl: channel.youtubeLiveUrl || channel.officialUrl,
        fallback: true,
      },
      { status: 502 },
    );
  }
}
