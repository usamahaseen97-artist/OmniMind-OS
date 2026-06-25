import type { ClinicalAgentFinding } from "../../clinical-intelligence/types";
import type { AgentConflict, AgentVote, ConsensusResult, MultiAgentId } from "../types";
import { MULTI_AGENT_REGISTRY } from "../agents/ExtendedAgentRegistry";

function mapFindingToAgentId(finding: ClinicalAgentFinding): MultiAgentId {
  const match = MULTI_AGENT_REGISTRY.find((a: (typeof MULTI_AGENT_REGISTRY)[number]) => a.phase2AgentId === finding.agentId);
  return match?.id ?? "chief-medical-coordinator";
}

/** Multi-agent collaboration — voting, conflict detection, consensus */
export class AgentCollaborationEngine {
  detectConflicts(findings: ClinicalAgentFinding[]): AgentConflict[] {
    const conflicts: AgentConflict[] = [];
    const differentialMap = new Map<string, { agentId: MultiAgentId; summary: string; confidence: number }[]>();

    for (const f of findings) {
      for (const d of f.differentialConsiderations) {
        const key = d.toLowerCase().slice(0, 40);
        const list = differentialMap.get(key) ?? [];
        list.push({ agentId: mapFindingToAgentId(f), summary: f.summary, confidence: f.confidence.score });
        differentialMap.set(key, list);
      }
    }

    for (const [topic, positions] of differentialMap) {
      if (positions.length < 2) continue;
      const confidences = positions.map((p) => p.confidence);
      const spread = Math.max(...confidences) - Math.min(...confidences);
      if (spread > 0.2) {
        conflicts.push({
          id: `conflict-${Date.now()}-${topic.slice(0, 8)}`,
          topic,
          agents: positions.map((p) => p.agentId),
          positions,
          severity: spread > 0.4 ? "high" : spread > 0.25 ? "moderate" : "low",
          requiresClinicianReview: true,
        });
      }
    }
    return conflicts;
  }

  collectVotes(findings: ClinicalAgentFinding[]): AgentVote[] {
    return findings.map((f) => ({
      agentId: mapFindingToAgentId(f),
      position: f.summary,
      confidence: f.confidence.score,
      evidence: f.supportingEvidence.map((e) => e.label),
    }));
  }

  compareEvidence(findings: ClinicalAgentFinding[]) {
    const evidenceByAgent = findings.map((f) => ({
      agentId: mapFindingToAgentId(f),
      evidence: f.supportingEvidence,
      missing: f.missingInformation,
    }));
    const shared = new Set<string>();
    const unique = new Map<MultiAgentId, string[]>();
    for (const entry of evidenceByAgent) {
      for (const e of entry.evidence) {
        const key = `${e.type}:${e.label}`;
        if ([...evidenceByAgent].some((o) => o !== entry && o.evidence.some((x) => `${x.type}:${x.label}` === key))) {
          shared.add(key);
        } else {
          const list = unique.get(entry.agentId) ?? [];
          list.push(e.label);
          unique.set(entry.agentId, list);
        }
      }
    }
    return { sharedEvidence: [...shared], uniqueByAgent: Object.fromEntries(unique) };
  }

  buildConsensus(findings: ClinicalAgentFinding[]): ConsensusResult {
    const votes = this.collectVotes(findings);
    const conflicts = this.detectConflicts(findings);
    const avgConfidence = votes.length ? votes.reduce((s, v) => s + v.confidence, 0) / votes.length : 0;
    const agreementLevel = conflicts.length === 0 ? "full" : conflicts.some((c) => c.severity === "high") ? "conflicted" : "partial";

    return {
      summary:
        findings.length === 0
          ? "No agent findings to synthesize."
          : `Consensus from ${findings.length} agent(s). ${conflicts.length ? `${conflicts.length} conflict(s) flagged for clinician review.` : "No major conflicts detected."}`,
      agreementLevel,
      votes,
      conflicts,
      aggregatedConfidence: {
        level: avgConfidence >= 0.7 ? "high" : avgConfidence >= 0.5 ? "moderate" : "low",
        score: Math.round(avgConfidence * 100) / 100,
        rationale: `Aggregated across ${votes.length} agent vote(s)`,
      },
      clinicianEscalationRequired: conflicts.some((c) => c.severity === "high") || agreementLevel === "conflicted",
    };
  }
}

let engine: AgentCollaborationEngine | null = null;

export function getAgentCollaborationEngine() {
  if (!engine) engine = new AgentCollaborationEngine();
  return engine;
}
