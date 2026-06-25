"use client";

import { listDeploymentTargets } from "../../../lib/omniforge-enterprise";
import { useOmniForgeEnterprise } from "../../../lib/omniforge-enterprise-context";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";

export function OmniForgeDeploymentPanel() {
  const ent = useOmniForgeEnterprise();
  const eng = useOmniForgeEngineering();
  const targets = listDeploymentTargets();

  return (
    <div className="space-y-2 overflow-y-auto p-3 text-[10px]">
      <p className="font-bold uppercase tracking-wider text-zinc-300">Deployment Center</p>
      <div className="flex flex-wrap gap-1">
        {targets.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => ent.planDeployment(t, eng.wizard.projectName || "omniforge-app")}
            className="rounded border border-white/10 px-2 py-1 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300"
          >
            {t}
          </button>
        ))}
      </div>
      {ent.deployment ? (
        <div className="rounded border border-white/10 p-2 text-zinc-500">
          <p className="text-zinc-300">{ent.deployment.label} pipeline</p>
          <p className="mt-1">{ent.deployment.stages.join(" → ")}</p>
          <ul className="mt-2 list-inside list-disc">
            {ent.deployment.configFiles.map((f: { path: string }) => (
              <li key={f.path} className="font-mono text-[9px]">{f.path}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
