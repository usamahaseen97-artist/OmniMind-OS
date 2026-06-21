import { NextRequest } from "next/server";
import { publishOmniTVEvent, type OmniTVEvent } from "../../../../../lib/server/omnitv-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set<OmniTVEvent["type"]>([
  "channel.play",
  "channel.switch",
  "embed.failed",
]);

/**
 * Client-publishable OmniTV events (play / switch / embed failure).
 * `channel.health` is server-only and emitted by the live resolver.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Event payload required" }, { status: 400 });
  }

  const raw = body as Partial<OmniTVEvent> & { type?: string; channelId?: string };
  if (!raw.type || !ALLOWED_TYPES.has(raw.type as OmniTVEvent["type"])) {
    return Response.json({ error: "Unsupported event type" }, { status: 400 });
  }
  if (!raw.channelId || typeof raw.channelId !== "string") {
    return Response.json({ error: "channelId is required" }, { status: 400 });
  }

  const event = { ...raw, at: Date.now() } as OmniTVEvent;
  await publishOmniTVEvent(event);

  return Response.json({ ok: true, published: event.type });
}
