import { NextRequest } from "next/server";
import { resolveYouTubeLiveVideo } from "../../../../lib/server/youtube-live-resolver";

export async function GET(req: NextRequest) {
  const channelUrl =
    req.nextUrl.searchParams.get("channelUrl") ||
    req.nextUrl.searchParams.get("channel") ||
    undefined;
  const liveUrl = req.nextUrl.searchParams.get("liveUrl") || undefined;
  const fallbackVideoId = req.nextUrl.searchParams.get("fallbackVideoId") || undefined;
  const fallbackEmbedUrl = req.nextUrl.searchParams.get("fallbackEmbedUrl") || undefined;

  const result = await resolveYouTubeLiveVideo({
    channelUrl,
    liveUrl,
    fallbackVideoId,
    fallbackEmbedUrl,
  });

  return Response.json(result);
}
