"use client";

import { Lightbulb } from "lucide-react";
import { useOmniMindEcosystemOptional } from "../../lib/omnimind-ecosystem-context";

/** AI diagnostic recommendations — architectural advice panel. */
export function OmniMindDiagnosticPanel() {
  const eco = useOmniMindEcosystemOptional();
  const tips = eco?.aiSuggestions ?? [];

  if (!tips.length) return null;

  return (
    <div className="shrink-0 border-b border-white/[0.06] px-2 py-2">
      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-amber-400/90">
        <Lightbulb className="h-3 w-3" />
        AI Diagnostics
      </div>
      <ul className="mt-1 space-y-1">
        {tips.slice(0, 4).map((t) => (
          <li key={t.id} className="rounded border border-amber-500/15 bg-amber-500/5 px-2 py-1 text-[8px] leading-snug text-amber-100/90">
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
