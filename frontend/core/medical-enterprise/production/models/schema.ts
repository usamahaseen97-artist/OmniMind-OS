import type {
  HealthDashboard,
  ObservabilitySnapshot,
  ExportJob,
  AIFeedbackRecord,
  TestRunResult,
  StructuredLogEntry,
} from "../types";

export type DbHealthSnapshot = HealthDashboard;
export type DbObservabilitySnapshot = ObservabilitySnapshot;
export type DbExportJob = ExportJob & { encrypted: boolean };
export type DbAIFeedbackRecord = AIFeedbackRecord;
export type DbTestRunResult = TestRunResult;
export type DbStructuredLog = StructuredLogEntry;
