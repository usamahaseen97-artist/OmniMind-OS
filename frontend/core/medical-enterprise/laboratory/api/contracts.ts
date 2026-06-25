import type {
  LabReport,
  LabResultValue,
  AnalyteTrend,
  VitalReading,
  MonitoringAlert,
  LabAIObservation,
  LabImportJob,
  LabProcessingJob,
  MonitoringDashboardState,
  LabSearchQuery,
  DeviceSession,
  WearableDevice,
  EscalationRule,
  StreamSubscription,
} from "../types";

export const LABORATORY_API_BASE = "/api/v1/medical-enterprise/laboratory";

export type ApiResponse<T> = { ok: boolean; data?: T; error?: string; meta?: Record<string, unknown> };

/** POST /import/init */
export type LabImportInitRequest = {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  patientId: string;
  format: LabImportJob["format"];
  panelKind?: LabReport["panelKind"];
  chunkSize?: number;
};

export type LabImportInitResponse = ApiResponse<{
  importJobId: string;
  chunksTotal?: number;
  chunkSize?: number;
}>;

/** PUT /import/chunk/:jobId/:index */
export type LabImportChunkResponse = ApiResponse<{ progress: number; chunksUploaded: number }>;

/** POST /import/complete/:jobId */
export type LabImportCompleteResponse = ApiResponse<{ reportId: string; processingJobId: string; duplicate: boolean }>;

/** POST /import/manual */
export type ManualLabEntryRequest = {
  patientId: string;
  panelKind: LabReport["panelKind"];
  collectedAt: string;
  values: LabResultValue[];
};

/** GET /reports */
export type ListLabReportsResponse = ApiResponse<LabReport[]>;

/** GET /reports/:id */
export type GetLabReportResponse = ApiResponse<LabReport>;

/** GET /trends/:patientId */
export type TrendAnalysisResponse = ApiResponse<AnalyteTrend[]>;

/** POST /vitals */
export type RecordVitalRequest = Omit<VitalReading, "id">;

/** GET /vitals/stream/:patientId */
export type VitalsStreamResponse = ApiResponse<{ subscriptionId: string; streamUrl: string }>;

/** POST /devices/sync */
export type WearableSyncRequest = { patientId: string; deviceId: string };

export type WearableSyncResponse = ApiResponse<{ session: DeviceSession; readings: VitalReading[] }>;

/** GET /monitoring/:patientId */
export type MonitoringStatusResponse = ApiResponse<MonitoringDashboardState>;

/** GET /alerts */
export type ListAlertsResponse = ApiResponse<MonitoringAlert[]>;

/** POST /alerts/:id/acknowledge */
export type AcknowledgeAlertResponse = ApiResponse<MonitoringAlert>;

/** POST /ai/analyze */
export type LabAIAnalyzeRequest = { reportId: string };

export type LabAIAnalyzeResponse = ApiResponse<LabAIObservation>;

/** GET /search */
export type LabSearchResponse = ApiResponse<LabReport[]>;

/** POST /export/:reportId */
export type LabExportResponse = ApiResponse<{ exportUrl: string; format: string }>;

export const LABORATORY_API_ROUTES = {
  importInit: `${LABORATORY_API_BASE}/import/init`,
  importChunk: (jobId: string, index: number) => `${LABORATORY_API_BASE}/import/chunk/${jobId}/${index}`,
  importComplete: (jobId: string) => `${LABORATORY_API_BASE}/import/complete/${jobId}`,
  manualEntry: `${LABORATORY_API_BASE}/import/manual`,
  reports: `${LABORATORY_API_BASE}/reports`,
  report: (id: string) => `${LABORATORY_API_BASE}/reports/${id}`,
  trends: (patientId: string) => `${LABORATORY_API_BASE}/trends/${patientId}`,
  vitals: `${LABORATORY_API_BASE}/vitals`,
  vitalsStream: (patientId: string) => `${LABORATORY_API_BASE}/vitals/stream/${patientId}`,
  deviceSync: `${LABORATORY_API_BASE}/devices/sync`,
  monitoring: (patientId: string) => `${LABORATORY_API_BASE}/monitoring/${patientId}`,
  alerts: `${LABORATORY_API_BASE}/alerts`,
  acknowledgeAlert: (id: string) => `${LABORATORY_API_BASE}/alerts/${id}/acknowledge`,
  aiAnalyze: `${LABORATORY_API_BASE}/ai/analyze`,
  search: `${LABORATORY_API_BASE}/search`,
  export: (reportId: string) => `${LABORATORY_API_BASE}/export/${reportId}`,
} as const;

export type {
  LabReport,
  LabSearchQuery,
  LabProcessingJob,
  LabImportJob,
  WearableDevice,
  EscalationRule,
  StreamSubscription,
};
