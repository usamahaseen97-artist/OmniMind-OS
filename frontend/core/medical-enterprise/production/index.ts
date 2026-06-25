/**
 * Medical Production Readiness — Phase 8
 */
export { PRODUCTION_DISCLAIMER } from "./types";
export type {
  HealthDashboard,
  ObservabilitySnapshot,
  ServiceStatus,
  ExportFormat,
  ExportJob,
  AIFeedbackRecord,
  AIFeedbackAction,
  AIQualityMetrics,
  AdminDashboardState,
  SupportedLocale,
  AccessibilityPreferences,
  TestCategory,
  TestSuiteDefinition,
  DeploymentTier,
} from "./types";
export { PRODUCTION_API_BASE, PRODUCTION_API_ROUTES } from "./api/contracts";
export type { HealthDashboard as HealthDashboardResponse } from "./api/contracts";
export * from "./models/schema";
export * from "./performance/PerformanceLayer";
export * from "./scalability/ScalabilityArchitecture";
export * from "./observability/ObservabilityHub";
export * from "./testing/TestingFramework";
export * from "./qa/QualityAssurance";
export * from "./errors/ErrorHandlingArchitecture";
export * from "./exports/EnterpriseExportService";
export * from "./ai-quality/AIQualityControl";
export * from "./i18n/LocalizationArchitecture";
export * from "./accessibility/AccessibilityArchitecture";
export * from "./admin/AdministrationService";
export * from "./bridge/ProductionBrainBridge";
export * from "./services/ProductionService";

import { getProductionService } from "./services/ProductionService";

export const medicalProductionPlatform = {
  service: getProductionService,
  health: (...args: Parameters<ReturnType<typeof getProductionService>["getHealth"]>) => getProductionService().getHealth(...args),
  observability: (...args: Parameters<ReturnType<typeof getProductionService>["getObservability"]>) => getProductionService().getObservability(...args),
  admin: (...args: Parameters<ReturnType<typeof getProductionService>["getAdminDashboard"]>) => getProductionService().getAdminDashboard(...args),
  qa: (...args: Parameters<ReturnType<typeof getProductionService>["runQA"]>) => getProductionService().runQA(...args),
  export: (...args: Parameters<ReturnType<typeof getProductionService>["export"]>) => getProductionService().export(...args),
  aiQuality: (...args: Parameters<ReturnType<typeof getProductionService>["getAIQualityMetrics"]>) => getProductionService().getAIQualityMetrics(...args),
};
