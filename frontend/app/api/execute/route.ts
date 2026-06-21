import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  const body = (await request.json()) as ExecutePayload;

  if (!body?.domain || !body?.command?.trim()) {
    return NextResponse.json(
      { error: "Invalid request: 'domain' and 'command' are required." },
      { status: 400 }
    );
  }

  const backendUrl = process.env.OMNIMIND_BACKEND_URL ?? "http://127.0.0.1:8001";

  try {
    const upstream = await fetch(`${backendUrl}/api/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        domain: body.domain,
        command: body.command,
        tier: body.tier ?? "discovery_free",
        context: body.context ?? {}
      })
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
      { status: 502 }
    );
  }
}
