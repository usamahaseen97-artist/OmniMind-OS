/**
 * AI Clinical Intelligence Engine — public API
 */
export type * from "./types";

export { MEDICAL_CLINICAL_AGENTS, getMedicalAgent, listMedicalAgents, selectAgentsForRequest } from "./agents/MedicalAgentRegistry";
export { runMedicalAgent, resolveAgentsForRequest } from "./agents/MedicalAgentRunner";
export { SYMPTOM_CATALOG } from "./symptoms/symptom-catalog";
export { getLabAnalyzerRegistry, LabAnalyzerRegistry } from "./labs/LabAnalyzerRegistry";
export { getClinicalRiskEngine, ClinicalRiskEngine } from "./risk/RiskEngine";
export { getGuidelineEngine, GuidelineEngine } from "./guidelines/GuidelineEngine";
export { CLINICAL_PROMPT_TEMPLATES, agentPrompt } from "./prompts/templates";
export { getReasoningAuditStore, ReasoningAuditStore } from "./audit/ReasoningAuditStore";
export { getClinicalResultMerger, ClinicalResultMerger } from "./orchestration/ClinicalResultMerger";
export { getClinicalBrainBridge, ClinicalBrainBridge } from "./orchestration/ClinicalBrainBridge";
export { getInferenceCache, InferenceCache } from "./pipeline/InferenceCache";
export { getClinicalReasoningPipeline, ClinicalReasoningPipeline } from "./pipeline/ClinicalReasoningPipeline";
export { CLINICAL_AI_DISCLAIMER } from "./types";

import { getClinicalReasoningPipeline } from "./pipeline/ClinicalReasoningPipeline";
import { listMedicalAgents } from "./agents/MedicalAgentRegistry";

/** Facade service for clinical intelligence operations */
export const clinicalIntelligenceService = {
  agents: listMedicalAgents,
  analyze: (req: import("./types").ClinicalIntelligenceRequest) => getClinicalReasoningPipeline().run(req),
  stream: (req: import("./types").ClinicalIntelligenceRequest) => getClinicalReasoningPipeline().stream(req),
  replay: (token: string) => getClinicalReasoningPipeline().replay(token),
};
