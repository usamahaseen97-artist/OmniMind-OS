import { fetchJellyfinImage, isJellyfinConfigured } from "../../../../../lib/server/jellyfin";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  if (!isJellyfinConfigured()) {
    return new Response("Jellyfin not configured", { status: 404 });
  }

  const { id } = await params;
  const typeParam = new URL(req.url).searchParams.get("type");
  const type = typeParam === "Backdrop" ? "Backdrop" : "Primary";

  try {
    const upstream = await fetchJellyfinImage(id, type);
    if (!upstream.ok || !upstream.body) {
      return new Response("Image not found", { status: upstream.status || 404 });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Image proxy error", { status: 502 });
  }
}
