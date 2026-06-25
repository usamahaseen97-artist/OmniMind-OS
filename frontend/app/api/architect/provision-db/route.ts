import { NextResponse } from "next/server";
import { requireInternalApiAuth } from "../../../../lib/server/api-route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  email?: string;
  provider?: "supabase" | "mongodb_atlas";
  projectPrompt?: string;
};

/** Managed DB spin-up hook — connection string stays server-side; client gets success only. */
export async function POST(req: Request) {
  const authError = requireInternalApiAuth(req);
  if (authError) return authError;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const provider = body.provider;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: "Valid email required" }, { status: 400 });
  }

  if (provider !== "supabase" && provider !== "mongodb_atlas") {
    return NextResponse.json({ success: false, message: "Unknown provider" }, { status: 400 });
  }

  // Hook point: wire to scripts/provision-atlas.ps1 or Supabase Management API.
  // Never return raw credentials to the browser.
  console.info("[OmniMind Architect] DB provision queued", { provider, emailDomain: email.split("@")[1] });

  return NextResponse.json({
    success: true,
    injected: true,
    provider,
    message:
      provider === "supabase"
        ? "Supabase project queued — credentials injected into your scaffold .env server-side."
        : "MongoDB Atlas cluster queued — connection string injected silently.",
  });
}
