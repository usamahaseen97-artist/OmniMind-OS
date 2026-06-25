"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function PromptLibrary({ compact = false }: { compact?: boolean }) {
  const { promptLibrary } = useVisionaryMarketing();

  return (
    <div className={compact ? "border-t border-white/[0.06] p-2" : "p-4"}>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Prompt Library</p>
      <ul className="max-h-32 space-y-1 overflow-y-auto">
        {promptLibrary.map((p) => (
          <li key={p.id} className="rounded bg-white/[0.03] px-2 py-1">
            <p className="text-[9px] text-slate-400">{p.label}</p>
            {!compact ? <p className="text-[8px] text-slate-600">{p.prompt}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
