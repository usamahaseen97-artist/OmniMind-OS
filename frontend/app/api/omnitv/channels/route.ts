import { NextRequest } from "next/server";
import { LIVE_TV_CATEGORIES, type LiveTvCategory } from "../../../../lib/live-tv-api";
import { filterChannels, isLiveTvCategory } from "../_lib";

export async function GET(req: NextRequest) {
  const rawCategory = req.nextUrl.searchParams.get("category") || "All";
  const category: LiveTvCategory = isLiveTvCategory(rawCategory) ? rawCategory : "All";
  const query = req.nextUrl.searchParams.get("q") || "";

  return Response.json({
    channels: filterChannels({ category, query }),
    categories: LIVE_TV_CATEGORIES,
    legalOnly: true,
    newsApiConfigured: Boolean(process.env.NEWS_API_KEY),
  });
}
