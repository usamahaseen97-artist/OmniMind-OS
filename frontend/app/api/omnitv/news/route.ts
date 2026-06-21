import { NextRequest } from "next/server";

const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { articles: [], configured: false, error: "NEWS_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const country = req.nextUrl.searchParams.get("country") || "pk";
  const category = req.nextUrl.searchParams.get("category") || "general";
  const url = new URL(NEWS_API_URL);
  url.searchParams.set("country", country);
  url.searchParams.set("category", category);
  url.searchParams.set("pageSize", "8");

  const upstream = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 300 },
  });

  if (!upstream.ok) {
    return Response.json(
      { articles: [], configured: true, error: `News API ${upstream.status}` },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as { articles?: unknown[] };
  return Response.json({ articles: data.articles ?? [], configured: true });
}
