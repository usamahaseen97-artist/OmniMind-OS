import { NextResponse } from "next/server";
import { deployStepsForTarget, type ArchitectFlowSelections } from "../../../../lib/architect-flow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  deployId?: string;
  selections?: ArchitectFlowSelections;
};

export async function POST(req: Request) {
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
