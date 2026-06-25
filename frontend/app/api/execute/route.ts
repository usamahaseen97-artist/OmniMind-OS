import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Domain =
  | "trading"
  | "medical_scans"
  | "game_generation"
  | "data_analytics"
  | "auto_coder"
  | "wealth_oracle"
  | "content_alchemist"
  | "marketing_titan"
  | "cyber_shield"
  | "general";
type Tier = "discovery_free" | "elite_sovereign" | "wealth_architect" | "global_titan";

interface ExecutePayload {
  domain: Domain;
  command: string;
  tier?: Tier;
  context?: Record<string, unknown>;
}

/**
 * Auth guard — blocks unauthenticated requests before any backend proxy I/O.
 * Accepts OMNIMIND_INTERNAL_API_SECRET via X-OmniMind-Api-Key or Bearer token.
 */
function rejectUnlessAuthenticated(req: Request): NextResponse | null {
  const secret = process.env.OMNIMIND_INTERNAL_API_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "development") return null;
    return NextResponse.json(
      { error: "OMNIMIND_INTERNAL_API_SECRET is not configured" },
      { status: 503 },
    );
  }

  const apiKey = req.headers.get("x-omnimind-api-key")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const token = apiKey || bearer;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function POST(request: Request) {
  const authError = rejectUnlessAuthenticated(request);
  if (authError) return authError;

  let body: ExecutePayload;
  try {
    body = (await request.json()) as ExecutePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.domain || !body?.command?.trim()) {
    return NextResponse.json(
      { error: "Invalid request: 'domain' and 'command' are required." },
      { status: 400 },
    );
  }

  const backendUrl = process.env.OMNIMIND_BACKEND_URL ?? "http://127.0.0.1:8001";
  const secret = process.env.OMNIMIND_INTERNAL_API_SECRET?.trim();

  try {
    const upstream = await fetch(`${backendUrl}/api/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-OmniMind-Api-Key": secret } : {}),
      },
      body: JSON.stringify({
        domain: body.domain,
        command: body.command,
        tier: body.tier ?? "discovery_free",
        context: body.context ?? {},
      }),
    });

    const text = await upstream.text();
    let data: unknown = {};

    if (text.trim().length > 0) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = { raw: text };
      }
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Cannot reach backend service. Check OMNIMIND_BACKEND_URL and backend server status." },
      { status: 502 },
    );
  }
}
