"use client";

import type { MultiAgentResponse } from "@/core/medical-enterprise/multi-agent/types";
import { listMultiAgents } from "@/core/medical-enterprise/multi-agent/agents/ExtendedAgentRegistry";

export function AgentCollaborationView({ response }: { response: MultiAgentResponse | null }) {
  if (!response) {
    return <p className="p-3 text-[9px] text-slate-500">Run multi-agent analysis to see collaboration results</p>;
  }

  const { consensus, clinicalResponse, decisionSupport } = response;
  const agents = listMultiAgents();

  return (
    <div className="space-y-2 overflow-y-auto p-2">
      <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
        <p className="text-[8px] font-medium uppercase text-slate-500">Consensus</p>
        <p className="mt-1 text-[9px] text-slate-300">{consensus.summary}</p>
        <p className="mt-1 text-[8px] text-cyan-400/80">
          Agreement: {consensus.agreementLevel} · Confidence: {consensus.aggregatedConfidence.score}
        </p>
      </div>

      {consensus.conflicts.length > 0 && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2">
          <p className="text-[8px] font-medium text-amber-300">Conflicts — clinician review</p>
          {consensus.conflicts.map((c) => (
            <p key={c.id} className="mt-1 text-[8px] text-amber-200/80">
              [{c.severity}] {c.topic}
            </p>
          ))}
        </div>
      )}

      <p className="text-[8px] font-medium uppercase text-slate-600">Agent findings ({clinicalResponse.agentFindings.length})</p>
      {clinicalResponse.agentFindings.map((f) => (
        <div key={`${f.agentId}-${f.summary.slice(0, 20)}`} className="rounded border border-white/[0.06] px-2 py-1.5">
          <p className="text-[9px] font-medium text-slate-300">{f.agentName}</p>
          <p className="text-[8px] text-slate-500">{f.summary.slice(0, 120)}…</p>
        </div>
      ))}

      <p className="text-[8px] font-medium uppercase text-slate-600">Decision support</p>
      <ul className="space-y-0.5 text-[8px] text-slate-500">
        {decisionSupport.suggestedFollowUpQuestions.slice(0, 4).map((q) => (
          <li key={q}>? {q}</li>
        ))}
      </ul>

      <p className="text-[7px] text-slate-600">{agents.length} agents registered</p>
    </div>
  );
}
