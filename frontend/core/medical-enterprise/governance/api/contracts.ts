import type { SecurityDashboardMetrics, UnifiedAuditEvent, PatientConsent, CompliancePlugin } from "../types";

export const GOVERNANCE_API_BASE = "/api/v1/medical-enterprise/governance";

export type ApiResponse<T> = { ok: boolean; data?: T; error?: string };

export type SecurityDashboardResponse = ApiResponse<SecurityDashboardMetrics>;
export type AuditLogResponse = ApiResponse<UnifiedAuditEvent[]>;
export type ConsentResponse = ApiResponse<PatientConsent>;
export type ComplianceResponse = ApiResponse<CompliancePlugin[]>;

export const GOVERNANCE_API_ROUTES = {
  dashboard: `${GOVERNANCE_API_BASE}/dashboard`,
  audit: `${GOVERNANCE_API_BASE}/audit`,
  auditExport: `${GOVERNANCE_API_BASE}/audit/export`,
  consent: `${GOVERNANCE_API_BASE}/consent`,
  consentWithdraw: (id: string) => `${GOVERNANCE_API_BASE}/consent/${id}/withdraw`,
  consentHistory: (patientId: string) => `${GOVERNANCE_API_BASE}/consent/${patientId}/history`,
  roles: `${GOVERNANCE_API_BASE}/roles`,
  sessions: `${GOVERNANCE_API_BASE}/sessions`,
  sessionRevoke: (id: string) => `${GOVERNANCE_API_BASE}/sessions/${id}/revoke`,
  compliance: `${GOVERNANCE_API_BASE}/compliance`,
  backup: `${GOVERNANCE_API_BASE}/backup/policies`,
  apiKeys: `${GOVERNANCE_API_BASE}/api-keys`,
  ssoProviders: `${GOVERNANCE_API_BASE}/sso/providers`,
} as const;
