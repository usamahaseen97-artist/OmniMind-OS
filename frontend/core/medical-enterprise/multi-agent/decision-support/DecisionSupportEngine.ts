import type { ClinicalAIResponse } from "../../clinical-intelligence/types";
import type { ConsensusResult, DecisionSupportOutput } from "../types";
import { MULTI_AGENT_DISCLAIMER } from "../types";

/** Clinical decision support — never definitive diagnoses */
export class DecisionSupportEngine {
  generate(clinical: ClinicalAIResponse, consensus: ConsensusResult): DecisionSupportOutput {
    const riskIndicators = clinical.agentFindings
      .flatMap((f) => f.urgencyIndicators)
      .filter(Boolean);

    return {
      suggestedFollowUpQuestions: clinical.suggestedNextQuestions.slice(0, 10),
      missingClinicalInformation: clinical.missingInformation,
      potentialInvestigations: clinical.agentFindings
        .flatMap((f) => f.recommendedDataCollection)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 8),
      monitoringSuggestions: clinical.agentFindings
        .filter((f) => f.agentId === "vital-signs" || f.agentId === "risk-assessment")
        .map((f) => f.summary)
        .slice(0, 5),
      referralConsiderations: clinical.differentialConsiderations.slice(0, 6),
      riskIndicators: riskIndicators.length ? riskIndicators : consensus.conflicts.map((c) => `Conflict: ${c.topic}`),
      disclaimer: MULTI_AGENT_DISCLAIMER,
    };
  }
}

let engine: DecisionSupportEngine | null = null;

export function getDecisionSupportEngine() {
  if (!engine) engine = new DecisionSupportEngine();
  return engine;
}
