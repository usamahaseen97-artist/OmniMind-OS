import { fetchJellyfinStream, isJellyfinConfigured } from "../../../../../lib/server/jellyfin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  if (!isJellyfinConfigured()) {
    return new Response("Jellyfin not configured", { status: 404 });
  }

  const { id } = await params;
  const range = req.headers.get("range");

  try {
    const upstream = await fetchJellyfinStream(id, range);
    if (!upstream.ok || !upstream.body) {
      return new Response("Stream not available", { status: upstream.status || 404 });
    }

    const headers = new Headers();
    const copy = ["content-type", "content-length", "content-range", "accept-ranges"];
    for (const key of copy) {
      const value = upstream.headers.get(key);
      if (value) headers.set(key, value);
    }
    if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
    headers.set("Cache-Control", "no-store");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Stream proxy error", { status: 502 });
  }
}
