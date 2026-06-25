/**
 * API contracts for Medical Diagnostic Enterprise Suite.
 * Backend implementation deferred — defines REST surface for future services.
 */

import type {
  AuditLogEntry,
  ClinicalTimelineEvent,
  ConsentRecord,
  MedicalRecordRef,
  PatientProfile,
  PatientSummary,
} from "./types";

export const MEDICAL_API_BASE = "/api/v1/medical-enterprise";

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  meta?: { page?: number; total?: number };
};

/** GET /patients */
export type ListPatientsRequest = { q?: string; department?: string; page?: number; limit?: number };
export type ListPatientsResponse = ApiResponse<PatientSummary[]>;

/** GET /patients/:id */
export type GetPatientResponse = ApiResponse<PatientProfile>;

/** GET /patients/:id/timeline */
export type GetTimelineResponse = ApiResponse<ClinicalTimelineEvent[]>;

/** GET /patients/:id/records */
export type ListRecordsRequest = { kind?: string; status?: string };
export type ListRecordsResponse = ApiResponse<MedicalRecordRef[]>;

/** POST /patients/:id/records — upload metadata (file upload separate) */
export type CreateRecordRequest = {
  kind: string;
  title: string;
  source: "upload" | "device" | "lab" | "manual";
};

/** GET /audit */
export type ListAuditResponse = ApiResponse<AuditLogEntry[]>;

/** GET /consent/:patientId */
export type GetConsentResponse = ApiResponse<ConsentRecord[]>;

/** POST /workflow/:patientId/step — advance workflow (no AI logic) */
export type AdvanceWorkflowRequest = { step: string; notes?: string };

/** GET /devices */
export type ListDevicesResponse = ApiResponse<
  { id: string; name: string; type: string; status: string }[]
>;

/** Future AI engine slots — POST /ai/analyze (not implemented) */
export type AIAnalyzeRequest = {
  patientId: string;
  recordId?: string;
  engineId: string;
  context?: Record<string, unknown>;
};

export type AIAnalyzeResponse = ApiResponse<{
  status: "queued" | "processing" | "complete";
  jobId: string;
  disclaimer: string;
}>;

/** POST /clinical-intelligence/analyze */
export type ClinicalIntelligenceAnalyzeRequest = {
  patientId: string;
  sessionId?: string;
  symptoms?: {
    symptoms: { id: string; label: string; severity?: string; duration?: string }[];
    onsetPattern?: string;
  };
  history?: {
    pastDiagnoses: string[];
    familyHistory: string[];
    surgeries: string[];
    allergies: string[];
    currentMedications: string[];
    lifestyleFactors: string[];
  };
  vitals?: Record<string, number | string>;
  labPanels?: { kind: string; collectedAt: string; values: { analyte: string; value: number | string; flag?: string }[] }[];
  imagingStudyIds?: string[];
  medications?: string[];
  agentIds?: string[];
  stream?: boolean;
};

export type ClinicalIntelligenceAnalyzeResponse = ApiResponse<{
  sessionId: string;
  summary: string;
  confidence: { level: string; score: number };
  agentFindings: unknown[];
  replayToken: string;
  disclaimer: string;
}>;

/** GET /clinical-intelligence/replay/:token */
export type ClinicalIntelligenceReplayResponse = ApiResponse<{
  steps: unknown[];
  response?: unknown;
}>;

export const MEDICAL_API_ROUTES = {
  patients: `${MEDICAL_API_BASE}/patients`,
  patient: (id: string) => `${MEDICAL_API_BASE}/patients/${id}`,
  timeline: (id: string) => `${MEDICAL_API_BASE}/patients/${id}/timeline`,
  records: (id: string) => `${MEDICAL_API_BASE}/patients/${id}/records`,
  audit: `${MEDICAL_API_BASE}/audit`,
  consent: (id: string) => `${MEDICAL_API_BASE}/consent/${id}`,
  workflow: (id: string) => `${MEDICAL_API_BASE}/workflow/${id}`,
  devices: `${MEDICAL_API_BASE}/devices`,
  aiAnalyze: `${MEDICAL_API_BASE}/ai/analyze`,
  clinicalAnalyze: `${MEDICAL_API_BASE}/clinical-intelligence/analyze`,
  clinicalReplay: (token: string) => `${MEDICAL_API_BASE}/clinical-intelligence/replay/${token}`,
  clinicalAgents: `${MEDICAL_API_BASE}/clinical-intelligence/agents`,
} as const;
