import type { HealthDashboard, ObservabilitySnapshot, ExportFormat, TestRunResult } from "../types";

export const PRODUCTION_API_BASE = "/api/v1/medical-enterprise/production";

export type ApiResponse<T> = { ok: boolean; data?: T; error?: string };

export const PRODUCTION_API_ROUTES = {
  health: `${PRODUCTION_API_BASE}/health`,
  observability: `${PRODUCTION_API_BASE}/observability`,
  tests: `${PRODUCTION_API_BASE}/tests`,
  testsRun: `${PRODUCTION_API_BASE}/tests/run`,
  qa: `${PRODUCTION_API_BASE}/qa/validate`,
  export: `${PRODUCTION_API_BASE}/export`,
  exportJob: (id: string) => `${PRODUCTION_API_BASE}/export/${id}`,
  aiFeedback: `${PRODUCTION_API_BASE}/ai/feedback`,
  aiQuality: `${PRODUCTION_API_BASE}/ai/quality`,
  admin: `${PRODUCTION_API_BASE}/admin/dashboard`,
  locales: `${PRODUCTION_API_BASE}/i18n/locales`,
} as const;

export type { HealthDashboard, ObservabilitySnapshot, ExportFormat, TestRunResult };
