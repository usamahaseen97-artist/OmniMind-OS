import { NextRequest, NextResponse } from "next/server";

const backendInternal =
  process.env.OMNIMIND_BACKEND_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8001";

/** Proxy + transcode hint: serve generated MP4 from FastAPI with correct headers. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[0-9a-f-]{8,}\.mp4$/i.test(filename)) {
    return NextResponse.json({ error: "invalid file" }, { status: 400 });
  }

  const target = `${backendInternal}/api/v1/tools/media/generated/${encodeURIComponent(filename)}`;
  try {
    const upstream = await fetch(target, {
      signal: AbortSignal.timeout(120_000),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Video not found (${upstream.status}). Restart backend and regenerate.` },
        { status: upstream.status },
      );
    }
    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "proxy failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
