export type { ClinicalAISessionRecord } from "../clinical-intelligence/types";

export type ClinicalAIJobRecord = {
  jobId: string;
  sessionId: string;
  patientId: string;
  status: "queued" | "processing" | "complete" | "failed";
  engineIds: string[];
  createdAt: string;
  completedAt?: string;
  error?: string;
};

export type ClinicalReasoningReplayRecord = {
  replayToken: string;
  sessionId: string;
  steps: import("../clinical-intelligence/types").ReasoningStep[];
  storedAt: string;
};
