"use client";

import { BrainCircuit, Network } from "lucide-react";
import { DeckShell } from "../DeckShell";

export function DeckMetaPanel() {
  return (
    <DeckShell title="META-AGENT Orchestrator" subtitle="Routes sub-agents · monitors all 14 architectures">
      <div className="flex items-center justify-center gap-3 py-4">
        <BrainCircuit className="h-10 w-10 text-[#10B981]" />
        <Network className="h-8 w-8 text-violet-400/60" />
      </div>
      <p className="text-center text-[10px] text-zinc-500">
        Delegates tasks across OmniMind tool graph without altering stream handlers.
      </p>
    </DeckShell>
  );
}
