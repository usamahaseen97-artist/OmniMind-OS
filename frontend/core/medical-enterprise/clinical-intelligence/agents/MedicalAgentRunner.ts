import type { ClinicalIntelligenceRequest } from "../types";
import { getMedicalAgent, selectAgentsForRequest } from "../agents/MedicalAgentRegistry";
import {
  runSymptomAnalysisAgent,
  runMedicalHistoryAgent,
  runVitalSignsAgent,
  runLabInterpretationAgent,
  runMedicationSafetyAgent,
  runDrugInteractionAgent,
  runRadiologyAssistant,
  runFollowUpAgent,
  runDocumentationAgent,
  runLiteratureAgent,
  runRiskAssessmentAgent,
  runGuidelineAgent,
} from "../agents/MedicalAgentHandlers";
import { getLabAnalyzerRegistry } from "../labs/LabAnalyzerRegistry";
import { getClinicalRiskEngine } from "../risk/RiskEngine";
import { getGuidelineEngine } from "../guidelines/GuidelineEngine";
import type { ClinicalAgentFinding, ClinicalAgentId, ReasoningStep } from "../types";

export type AgentRunResult = {
  finding: ClinicalAgentFinding;
  step: ReasoningStep;
};

/** Executes a single medical clinical agent */
export async function runMedicalAgent(
  agentId: ClinicalAgentId,
  req: ClinicalIntelligenceRequest,
): Promise<AgentRunResult> {
  const def = getMedicalAgent(agentId);
  const started = Date.now();
  let finding: ClinicalAgentFinding;

  switch (agentId) {
    case "symptom-analysis":
      finding = await runSymptomAnalysisAgent(req.symptoms!);
      break;
    case "medical-history":
      finding = await runMedicalHistoryAgent(req.history!);
      break;
    case "vital-signs":
      finding = await runVitalSignsAgent(req.vitals!);
      break;
    case "laboratory-interpretation": {
      const registry = getLabAnalyzerRegistry();
      const placeholders = (req.labPanels ?? []).map((p) => registry.analyze(p));
      finding = await runLabInterpretationAgent(placeholders);
      break;
    }
    case "radiology-assistant":
      finding = await runRadiologyAssistant(req.imagingStudyIds ?? []);
      break;
    case "medication-safety":
      finding = await runMedicationSafetyAgent(req.medications ?? [], req.history);
      break;
    case "drug-interaction":
      finding = await runDrugInteractionAgent(req.medications ?? []);
      break;
    case "clinical-guideline": {
      const refs = await getGuidelineEngine().retrieve({
        pastDiagnoses: req.history?.pastDiagnoses ?? [],
        symptoms: req.symptoms?.symptoms.map((s) => s.label) ?? [],
      });
      finding = await runGuidelineAgent(refs);
      break;
    }
    case "risk-assessment": {
      const risks = getClinicalRiskEngine().evaluate(req);
      finding = await runRiskAssessmentAgent(risks);
      break;
    }
    case "follow-up-recommendation":
      finding = await runFollowUpAgent(req.symptoms);
      break;
    case "medical-documentation":
      finding = await runDocumentationAgent(req);
      break;
    case "medical-literature":
      finding = await runLiteratureAgent(req);
      break;
    default:
      finding = {
        agentId,
        agentName: def?.name ?? agentId,
        summary: "Agent not configured",
        supportingEvidence: [],
        confidence: { level: "low", score: 0, rationale: "Unknown agent" },
        missingInformation: [],
        suggestedNextQuestions: [],
        differentialConsiderations: [],
        urgencyIndicators: [],
        recommendedDataCollection: [],
        structuredData: {},
        clinicianReviewRequired: true,
      };
  }

  const step: ReasoningStep = {
    id: `step-${agentId}-${started}`,
    agentId,
    timestamp: new Date().toISOString(),
    stage: "execution",
    inputSummary: def?.requiredInputs.join(", ") ?? "",
    outputSummary: finding.summary.slice(0, 200),
    durationMs: Date.now() - started,
  };

  return { finding, step };
}

export function resolveAgentsForRequest(req: ClinicalIntelligenceRequest) {
  return selectAgentsForRequest(
    {
      symptoms: req.symptoms,
      history: req.history,
      vitals: req.vitals,
      labs: req.labPanels,
      imagingStudyIds: req.imagingStudyIds,
      medications: req.medications,
    },
    req.agentIds,
  );
}
