"use client";

import { useOmniForgeEnterprise } from "../../../lib/omniforge-enterprise-context";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";

export function OmniForgeProjectBlueprintPanel() {
  const ent = useOmniForgeEnterprise();
  const eng = useOmniForgeEngineering();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 text-[10px] text-zinc-400">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold uppercase tracking-wider text-zinc-300">Project Blueprint</span>
        <button
          type="button"
          onClick={ent.runProjectAnalyzer}
          className="rounded border border-cyan-500/30 px-2 py-0.5 text-[9px] text-cyan-300"
        >
          Analyze
        </button>
      </div>
      {ent.blueprint ? (
        <div className="space-y-2">
          <Section title="Architecture" body={ent.blueprint.architecture} />
          <Section title="Scalability" body={ent.blueprint.scalability} />
          <Section title="Est. Cost" body={`$${ent.blueprint.estimatedMonthlyCostUsd}/mo`} />
          <Section title="Requirements" body={ent.blueprint.requirements.join(" · ")} />
          <Section title="Dependencies" body={ent.blueprint.dependencies.join(", ")} />
          <Section title="Folder Structure" body={ent.blueprint.folderStructure.join("\n")} />
        </div>
      ) : (
        <p className="text-zinc-600">Submit wizard or click Analyze to generate blueprint before coding.</p>
      )}
      {eng.buildActive ? <p className="mt-3 text-emerald-400">Build pipeline active…</p> : null}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded border border-white/10 p-2">
      <p className="font-semibold text-zinc-300">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-zinc-500">{body}</p>
    </div>
  );
}
