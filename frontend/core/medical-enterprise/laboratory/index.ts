/**
 * Laboratory Intelligence & Patient Monitoring Platform — Phase 4
 */
export type * from "./types";
export { LABORATORY_API_BASE, LABORATORY_API_ROUTES } from "./api/contracts";
export type {
  LabImportInitRequest,
  LabImportInitResponse,
  LabImportChunkResponse,
  LabImportCompleteResponse,
  ManualLabEntryRequest,
  ListLabReportsResponse,
  GetLabReportResponse,
  TrendAnalysisResponse,
  RecordVitalRequest,
  VitalsStreamResponse,
  WearableSyncRequest,
  WearableSyncResponse,
  MonitoringStatusResponse,
  ListAlertsResponse,
  AcknowledgeAlertResponse,
  LabAIAnalyzeRequest,
  LabAIAnalyzeResponse,
  LabSearchResponse,
  LabExportResponse,
  LabSearchQuery,
  LabProcessingJob,
  LabImportJob,
  WearableDevice,
  EscalationRule,
  StreamSubscription,
} from "./api/contracts";
export * from "./panels/registry";
export * from "./models/schema";
export * from "./pipeline/LabImportPipeline";
export * from "./pipeline/ProcessingPipeline";
export * from "./ai-engine/LabAIEngine";
export * from "./trends/TrendAnalysisEngine";
export * from "./monitoring/VitalsStreamEngine";
export * from "./monitoring/PatientMonitoringService";
export * from "./devices/DeviceRegistry";
export * from "./alerts/AlertEngine";
export * from "./performance/AnalysisCache";
export * from "./security/LaboratoryAccessControl";
export * from "./bridge/LaboratoryBrainBridge";
export * from "./services/LaboratoryService";

import { getLaboratoryService } from "./services/LaboratoryService";

export const medicalLaboratoryPlatform = {
  service: getLaboratoryService,
  import: (...args: Parameters<ReturnType<typeof getLaboratoryService>["importFile"]>) => getLaboratoryService().importFile(...args),
  search: (...args: Parameters<ReturnType<typeof getLaboratoryService>["search"]>) => getLaboratoryService().search(...args),
  analyze: (...args: Parameters<ReturnType<typeof getLaboratoryService>["runAIAnalysis"]>) => getLaboratoryService().runAIAnalysis(...args),
  dashboard: (...args: Parameters<ReturnType<typeof getLaboratoryService>["getMonitoringDashboard"]>) => getLaboratoryService().getMonitoringDashboard(...args),
  recordVital: (...args: Parameters<ReturnType<typeof getLaboratoryService>["recordVital"]>) => getLaboratoryService().recordVital(...args),
};
