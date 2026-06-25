/**
 * Medical Multi-Agent Intelligence Platform — type contracts (Phase 5)
 * Clinical decision-support only — never autonomous diagnosis.
 */

export const MULTI_AGENT_DISCLAIMER =
  "Multi-agent clinical decision support for qualified healthcare professionals. " +
  "AI agents assist reasoning but do not replace licensed medical judgment. " +
  "All outputs require clinician review and approval.";

/** Phase 5 agent IDs — maps to Phase 2 clinical agents where applicable */
export type MultiAgentId =
  | "chief-medical-coordinator"
  | "symptom-analysis"
  | "medical-history"
  | "radiology-agent"
  | "laboratory-agent"
  | "vital-signs-agent"
  | "medication-safety"
  | "drug-interaction"
  | "clinical-guideline"
  | "medical-literature"
  | "risk-assessment"
  | "emergency-triage"
  | "follow-up-planning"
  | "medical-documentation"
  | "hospital-workflow";

export type ReasoningMode = "parallel" | "sequential" | "hybrid";

export type ConversationRole = "clinician" | "assistant" | "system" | "agent";

export type ConversationMessage = {
  id: string;
  sessionId: string;
  role: ConversationRole;
  agentId?: MultiAgentId;
  content: string;
  timestamp: string;
  encrypted?: boolean;
  metadata?: Record<string, unknown>;
};

export type ClinicalConversationSession = {
  id: string;
  patientId: string;
  clinicianId: string;
  title: string;
  messages: ConversationMessage[];
  activeAgents: MultiAgentId[];
  consentScope?: string;
  createdAt: string;
  updatedAt: string;
};

export type VoiceDoctorConfig = {
  language: string;
  medicalTerminologyBoost: boolean;
  noiseReduction: boolean;
  speakerIdentification: boolean;
  dictationMode: "clinical" | "conversation" | "command";
  handsFreeNavigation: boolean;
};

export type VoiceTranscript = {
  id: string;
  sessionId: string;
  text: string;
  confidence: number;
  language: string;
  isFinal: boolean;
  timestamp: string;
};

export type InterviewSectionId =
  | "chief-complaint"
  | "hpi"
  | "past-medical-history"
  | "family-history"
  | "social-history"
  | "medications"
  | "allergies"
  | "review-of-systems"
  | "risk-factors";

export type InterviewSection = {
  id: InterviewSectionId;
  label: string;
  prompt: string;
  completed: boolean;
  responses: { question: string; answer: string; timestamp: string }[];
};

export type PatientInterviewSession = {
  id: string;
  patientId: string;
  sections: InterviewSection[];
  progress: number;
  startedAt: string;
  completedAt?: string;
};

export type KnowledgeSourceType =
  | "clinical-guideline"
  | "textbook"
  | "hospital-protocol"
  | "research-paper"
  | "institution-specific";

export type KnowledgeCitation = {
  id: string;
  sourceType: KnowledgeSourceType;
  title: string;
  version?: string;
  publisher?: string;
  url?: string;
  retrievedAt: string;
  excerpt?: string;
};

export type KnowledgeQuery = {
  topic: string;
  sourceTypes?: KnowledgeSourceType[];
  institutionId?: string;
};

export type AgentConflict = {
  id: string;
  topic: string;
  agents: MultiAgentId[];
  positions: { agentId: MultiAgentId; summary: string; confidence: number }[];
  severity: "low" | "moderate" | "high";
  requiresClinicianReview: true;
};

export type AgentVote = {
  agentId: MultiAgentId;
  position: string;
  confidence: number;
  evidence: string[];
};

export type ConsensusResult = {
  summary: string;
  agreementLevel: "full" | "partial" | "conflicted";
  votes: AgentVote[];
  conflicts: AgentConflict[];
  aggregatedConfidence: { level: string; score: number; rationale: string };
  clinicianEscalationRequired: boolean;
};

export type DecisionSupportOutput = {
  suggestedFollowUpQuestions: string[];
  missingClinicalInformation: string[];
  potentialInvestigations: string[];
  monitoringSuggestions: string[];
  referralConsiderations: string[];
  riskIndicators: string[];
  disclaimer: string;
};

export type DocumentationType =
  | "soap-note"
  | "clinical-note"
  | "consultation-note"
  | "referral-letter"
  | "discharge-summary"
  | "follow-up-plan"
  | "progress-note"
  | "medical-report";

export type DocumentationDraft = {
  id: string;
  patientId: string;
  sessionId: string;
  type: DocumentationType;
  title: string;
  sections: { heading: string; content: string }[];
  status: "draft" | "pending-review" | "approved" | "rejected";
  authoredBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  clinicianReviewRequired: true;
};

export type MultiAgentSession = {
  id: string;
  patientId: string;
  reasoningMode: ReasoningMode;
  activeAgents: MultiAgentId[];
  consensus?: ConsensusResult;
  decisionSupport?: DecisionSupportOutput;
  replayToken?: string;
  createdAt: string;
  completedAt?: string;
};

export type MultiAgentRequest = {
  patientId: string;
  sessionId?: string;
  agentIds?: MultiAgentId[];
  reasoningMode?: ReasoningMode;
  symptoms?: import("../../clinical-intelligence/types").StructuredSymptomReport;
  history?: import("../../clinical-intelligence/types").PatientHistoryContext;
  vitals?: import("../../clinical-intelligence/types").VitalSignsSnapshot;
  labPanels?: import("../../clinical-intelligence/types").LabPanelInput[];
  imagingStudyIds?: string[];
  medications?: string[];
  conversationContext?: string;
  requesterRole: string;
  stream?: boolean;
};

export type MultiAgentStreamEvent =
  | { type: "agent-start"; agentId: MultiAgentId; timestamp: string }
  | { type: "agent-complete"; agentId: MultiAgentId; summary: string }
  | { type: "conflict-detected"; conflict: AgentConflict }
  | { type: "consensus-partial"; result: Partial<ConsensusResult> }
  | { type: "conversation-chunk"; text: string }
  | { type: "complete"; session: MultiAgentSession; clinicalResponse: import("../../clinical-intelligence/types").ClinicalAIResponse }
  | { type: "error"; message: string };

export type MultiAgentResponse = {
  session: MultiAgentSession;
  clinicalResponse: import("../../clinical-intelligence/types").ClinicalAIResponse;
  consensus: ConsensusResult;
  decisionSupport: DecisionSupportOutput;
  disclaimer: string;
};
