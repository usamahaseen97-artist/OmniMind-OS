import { NextResponse } from "next/server";
import { deployStepsForTarget, type ArchitectFlowSelections } from "../../../../lib/architect-flow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  deployId?: string;
  selections?: ArchitectFlowSelections;
};

/**
 * Auth guard — blocks unauthenticated requests before returning deploy commands.
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

export async function POST(req: Request) {
  const authError = rejectUnlessAuthenticated(req);
  if (authError) return authError;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, commands: [] }, { status: 400 });
  }

  const deployId = body.deployId ?? "local_only";
  const selections = body.selections ?? { projectPrompt: "" };
  const commands = deployStepsForTarget(deployId, selections);

  console.info("[OmniMind Architect] Deploy CLI hook", { deployId, steps: commands.length });

  return NextResponse.json({ ok: true, commands });
}
