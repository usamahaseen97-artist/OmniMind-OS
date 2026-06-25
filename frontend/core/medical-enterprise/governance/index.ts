/**
 * Healthcare Security, Compliance & Governance — Phase 7
 */
export { GOVERNANCE_DISCLAIMER } from "./types";
export type {
  GovernanceRole,
  IdentitySession,
  UnifiedAuditEvent,
  PatientConsent,
  ConsentType,
  CompliancePlugin,
  SecurityDashboardMetrics,
  SecurityAlert,
  ABACPolicy,
  RoleDefinition,
} from "./types";
export { GOVERNANCE_API_BASE, GOVERNANCE_API_ROUTES } from "./api/contracts";
export type { SecurityDashboardResponse, AuditLogResponse, ConsentResponse, ComplianceResponse } from "./api/contracts";
export * from "./models/schema";
export * from "./identity/IdentityProvider";
export * from "./rbac/RoleManagement";
export * from "./abac/AttributeBasedAccess";
export * from "./data-security/DataSecurityArchitecture";
export * from "./audit/AuditAggregationService";
export * from "./consent/ConsentManagement";
export * from "./compliance/ComplianceFramework";
export * from "./backup/DisasterRecoveryArchitecture";
export * from "./monitoring/SecurityMonitoring";
export * from "./api-security/APISecurityGateway";
export * from "./security/GovernanceAccessControl";
export * from "./bridge/GovernanceBrainBridge";
export * from "./services/GovernanceService";

import { getGovernanceService } from "./services/GovernanceService";

export const medicalGovernancePlatform = {
  service: getGovernanceService,
  dashboard: (...args: Parameters<ReturnType<typeof getGovernanceService>["getSecurityDashboard"]>) => getGovernanceService().getSecurityDashboard(...args),
  audit: (...args: Parameters<ReturnType<typeof getGovernanceService>["getUnifiedAudit"]>) => getGovernanceService().getUnifiedAudit(...args),
  compliance: (...args: Parameters<ReturnType<typeof getGovernanceService>["listCompliance"]>) => getGovernanceService().listCompliance(...args),
  consent: (...args: Parameters<ReturnType<typeof getGovernanceService>["checkConsent"]>) => getGovernanceService().checkConsent(...args),
};
