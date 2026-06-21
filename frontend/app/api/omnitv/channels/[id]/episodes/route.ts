import { CHANNELS, getChannelEpisodes } from "../../../_lib";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const channel = CHANNELS.find((item) => item.id === id);

  if (!channel) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  try {
    const episodes = await getChannelEpisodes(channel);
    return Response.json({ channelId: channel.id, count: episodes.length, episodes });
  } catch (error) {
    return Response.json(
      {
        channelId: channel.id,
        episodes: [],
        error: error instanceof Error ? error.message : "Unable to load episodes",
      },
      { status: 502 },
    );
  }
}
