"use client";

import { useOmniForgeEnterprise } from "../../../lib/omniforge-enterprise-context";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";

type Props = { files: { path: string; content: string }[] };

export function OmniForgeTestingPanel({ files }: Props) {
  const ent = useOmniForgeEnterprise();
  const eng = useOmniForgeEngineering();

  return (
    <div className="space-y-2 overflow-y-auto p-3 text-[10px]">
      <div className="flex items-center justify-between">
        <p className="font-bold uppercase tracking-wider text-zinc-300">Testing</p>
        <button
          type="button"
          onClick={() => ent.generateTests(files, eng.wizard.projectName || "app")}
          className="rounded border border-cyan-500/30 px-2 py-0.5 text-cyan-300"
        >
          Generate
        </button>
      </div>
      {ent.testSuites.length ? (
        ent.testSuites.map((s) => (
          <div key={s.path} className="rounded border border-white/10 p-2">
            <p className="text-zinc-300">{s.kind} · {s.framework}</p>
            <p className="font-mono text-[9px] text-zinc-600">{s.path}</p>
          </div>
        ))
      ) : (
        <p className="text-zinc-600">Unit, integration, API, UI, E2E, performance, and security suites.</p>
      )}
    </div>
  );
}
