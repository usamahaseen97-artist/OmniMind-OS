/**
 * Clinical AI Intelligence — shared type contracts.
 * Structured CDS output; never asserts definitive diagnosis.
 */

export const CLINICAL_AI_DISCLAIMER =
  "AI-assisted clinical decision support for qualified healthcare professionals. " +
  "Does not replace licensed medical judgment. All outputs require clinician review.";

export type ClinicalAgentId =
  | "symptom-analysis"
  | "medical-history"
  | "vital-signs"
  | "laboratory-interpretation"
  | "radiology-assistant"
  | "medication-safety"
  | "drug-interaction"
  | "clinical-guideline"
  | "risk-assessment"
  | "follow-up-recommendation"
  | "medical-documentation"
  | "medical-literature";

export type ConfidenceLevel = "low" | "moderate" | "medium" | "high";

export type ConfidenceEstimate = {
  level: ConfidenceLevel;
  score: number;
  rationale: string;
};

export type EvidenceSource = {
  id: string;
  type: "patient-record" | "lab" | "imaging" | "guideline" | "literature" | "agent-inference";
  label: string;
  reference?: string;
  retrievedAt?: string;
};

export type ReasoningStep = {
  id: string;
  agentId: ClinicalAgentId;
  timestamp: string;
  stage: string;
  inputSummary: string;
  outputSummary: string;
  durationMs: number;
};

export type ClinicalAgentFinding = {
  agentId: ClinicalAgentId;
  agentName: string;
  summary: string;
  supportingEvidence: EvidenceSource[];
  confidence: ConfidenceEstimate;
  missingInformation: string[];
  suggestedNextQuestions: string[];
  differentialConsiderations: string[];
  urgencyIndicators: string[];
  recommendedDataCollection: string[];
  structuredData: Record<string, unknown>;
  clinicianReviewRequired: true;
};

export type ClinicalAIResponse = {
  sessionId: string;
  patientId: string;
  summary: string;
  supportingEvidence: EvidenceSource[];
  confidence: ConfidenceEstimate;
  missingInformation: string[];
  suggestedNextQuestions: string[];
  differentialConsiderations: string[];
  clinicianReviewRequired: true;
  disclaimer: string;
  agentFindings: ClinicalAgentFinding[];
  reasoningSteps: ReasoningStep[];
  contributingAgents: ClinicalAgentId[];
  mergedAt: string;
  replayToken: string;
};

export type SymptomInput = {
  id: string;
  label: string;
  severity?: "mild" | "moderate" | "severe";
  duration?: string;
  onset?: string;
  notes?: string;
};

export type StructuredSymptomReport = {
  symptoms: SymptomInput[];
  onsetPattern?: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
};

export type PatientHistoryContext = {
  pastDiagnoses: string[];
  familyHistory: string[];
  surgeries: string[];
  allergies: string[];
  currentMedications: string[];
  lifestyleFactors: string[];
};

export type VitalSignsSnapshot = {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  temperatureC?: number;
  spO2?: number;
  recordedAt?: string;
};

export type LabPanelKind =
  | "cbc"
  | "cmp"
  | "lipid"
  | "liver-function"
  | "kidney-function"
  | "blood-glucose"
  | "hba1c"
  | "thyroid"
  | "inflammatory-markers"
  | "urinalysis";

export type LabValue = {
  analyte: string;
  value: number | string;
  unit?: string;
  referenceRange?: string;
  flag?: "low" | "high" | "critical" | "normal" | "unknown";
};

export type LabPanelInput = {
  kind: LabPanelKind;
  collectedAt: string;
  values: LabValue[];
};

export type LabInterpretationPlaceholder = {
  panelKind: LabPanelKind;
  summary: string;
  flaggedAnalytes: string[];
  interpretationSlots: {
    analyte: string;
    status: "pending-review" | "requires-context" | "within-reference";
    clinicianNote: string;
  }[];
  missingContext: string[];
  confidence: ConfidenceEstimate;
};

export type RiskCategory =
  | "cardiovascular"
  | "diabetes"
  | "infection"
  | "respiratory"
  | "neurological";

export type RiskScoreResult = {
  category: RiskCategory;
  score: number;
  maxScore: number;
  level: "low" | "moderate" | "elevated" | "high";
  factors: { id: string; label: string; weight: number; present: boolean }[];
  transparentFormula: string;
  missingInputs: string[];
};

export type GuidelinePlugin = {
  id: string;
  name: string;
  version: string;
  source: string;
  applicableWhen: (context: Record<string, unknown>) => boolean;
  retrieve: (context: Record<string, unknown>) => Promise<GuidelineReference[]>;
};

export type GuidelineReference = {
  id: string;
  title: string;
  recommendation: string;
  evidenceLevel?: string;
  source: string;
};

export type ClinicalIntelligenceRequest = {
  patientId: string;
  sessionId?: string;
  symptoms?: StructuredSymptomReport;
  history?: PatientHistoryContext;
  vitals?: VitalSignsSnapshot;
  labPanels?: LabPanelInput[];
  imagingStudyIds?: string[];
  medications?: string[];
  agentIds?: ClinicalAgentId[];
  requesterRole: string;
  stream?: boolean;
};

export type ClinicalIntelligenceStreamEvent =
  | { type: "agent-start"; agentId: ClinicalAgentId; timestamp: string }
  | { type: "agent-finding"; finding: ClinicalAgentFinding }
  | { type: "reasoning-step"; step: ReasoningStep }
  | { type: "partial-summary"; text: string }
  | { type: "complete"; response: ClinicalAIResponse }
  | { type: "error"; message: string };

export type ClinicalAISessionRecord = {
  sessionId: string;
  patientId: string;
  createdAt: string;
  completedAt?: string;
  requestHash: string;
  response?: ClinicalAIResponse;
  reasoningSteps: ReasoningStep[];
  contributingAgents: ClinicalAgentId[];
  requesterId: string;
  requesterRole: string;
};
