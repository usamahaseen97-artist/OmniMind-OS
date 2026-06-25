import type {
  ClinicalAgentFinding,
  ClinicalAIResponse,
  ConfidenceEstimate,
  EvidenceSource,
} from "../types";
import { CLINICAL_AI_DISCLAIMER as DISCLAIMER } from "../types";

/** Merges multi-agent findings into unified clinical summary */
export class ClinicalResultMerger {
  merge(
    sessionId: string,
    patientId: string,
    findings: ClinicalAgentFinding[],
    reasoningSteps: import("../types").ReasoningStep[],
  ): ClinicalAIResponse {
    const supportingEvidence = this.dedupeEvidence(findings.flatMap((f) => f.supportingEvidence));
    const missingInformation = [...new Set(findings.flatMap((f) => f.missingInformation))];
    const suggestedNextQuestions = [...new Set(findings.flatMap((f) => f.suggestedNextQuestions))].slice(0, 12);
    const differentialConsiderations = [...new Set(findings.flatMap((f) => f.differentialConsiderations))];
    const confidence = this.aggregateConfidence(findings.map((f) => f.confidence));

    const summary =
      findings.length === 0
        ? "No agent findings available. Provide symptoms, history, vitals, or labs to enable clinical intelligence."
        : `Unified clinical summary from ${findings.length} specialist agent(s). ` +
          findings.map((f) => f.summary).join(" ");

    return {
      sessionId,
      patientId,
      summary,
      supportingEvidence,
      confidence,
      missingInformation,
      suggestedNextQuestions,
      differentialConsiderations,
      clinicianReviewRequired: true,
      disclaimer: DISCLAIMER,
      agentFindings: findings,
      reasoningSteps,
      contributingAgents: findings.map((f) => f.agentId),
      mergedAt: new Date().toISOString(),
      replayToken: `replay-${sessionId}`,
    };
  }

  private dedupeEvidence(items: EvidenceSource[]): EvidenceSource[] {
    const seen = new Set<string>();
    return items.filter((e) => {
      const key = `${e.type}:${e.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private aggregateConfidence(estimates: ConfidenceEstimate[]): ConfidenceEstimate {
    if (!estimates.length) {
      return { level: "low", score: 0, rationale: "No agent confidence data" };
    }
    const score = estimates.reduce((s, e) => s + e.score, 0) / estimates.length;
    const level = score >= 0.7 ? "high" : score >= 0.5 ? "moderate" : score >= 0.35 ? "medium" : "low";
    return {
      level,
      score: Math.round(score * 100) / 100,
      rationale: `Aggregated across ${estimates.length} agent(s) — clinician review required`,
    };
  }
}

let merger: ClinicalResultMerger | null = null;

export function getClinicalResultMerger(): ClinicalResultMerger {
  if (!merger) merger = new ClinicalResultMerger();
  return merger;
}

// Re-export disclaimer for merger module consumers
export { DISCLAIMER };
