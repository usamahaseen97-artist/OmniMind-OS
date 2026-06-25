import type { GovernanceRole, ConsentType, PatientConsent, UnifiedAuditEvent } from "../types";
import { getIdentityProvider } from "../identity/IdentityProvider";
import { getRoleManagement } from "../rbac/RoleManagement";
import { getAttributeBasedAccess } from "../abac/AttributeBasedAccess";
import { getAuditAggregationService } from "../audit/AuditAggregationService";
import { getConsentManagement } from "../consent/ConsentManagement";
import { getComplianceFrameworkEngine } from "../compliance/ComplianceFramework";
import { getDisasterRecoveryArchitecture } from "../backup/DisasterRecoveryArchitecture";
import { getSecurityMonitoring } from "../monitoring/SecurityMonitoring";
import { getAPISecurityGateway } from "../api-security/APISecurityGateway";
import { getDataSecurityArchitecture } from "../data-security/DataSecurityArchitecture";
import { getGovernanceAccessControl } from "../security/GovernanceAccessControl";
import { getGovernanceBrainBridge } from "../bridge/GovernanceBrainBridge";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";

/** Unified governance service facade */
export class GovernanceService {
  private ac = getGovernanceAccessControl();
  private brain = getGovernanceBrainBridge();

  login(userId: string, role: GovernanceRole, protocol: import("../types").AuthProtocol = "jwt") {
    const session = getIdentityProvider().createSession(userId, role, protocol);
    getAuditAggregationService().recordLogin(userId, role, "success");
    void this.brain.pinSecurityEvent(`Login ${userId} as ${role}`);
    return session;
  }

  getSecurityDashboard(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "governance:read");
    return getSecurityMonitoring().getDashboard();
  }

  async getUnifiedAudit(role: ClinicalRole | GovernanceRole, filters?: Parameters<ReturnType<typeof getAuditAggregationService>["query"]>[0]) {
    this.ac.assert(role, "audit:read");
    const aggregated = await getAuditAggregationService().aggregateFromPhases();
    if (!filters) return aggregated;
    return aggregated.filter((e) => {
      if (filters.patientId && e.patientId !== filters.patientId) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.since && e.timestamp < filters.since) return false;
      return true;
    });
  }

  grantConsent(input: Parameters<ReturnType<typeof getConsentManagement>["grant"]>[0], role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "consent:manage");
    const consent = getConsentManagement().grant(input);
    void this.brain.rememberConsent(consent.patientId, consent.type, true);
    return consent;
  }

  withdrawConsent(consentId: string, actorId: string, role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "consent:manage");
    const consent = getConsentManagement().withdraw(consentId, actorId);
    void this.brain.rememberConsent(consent.patientId, consent.type, false);
    return consent;
  }

  checkConsent(patientId: string, type: ConsentType) {
    return getConsentManagement().checkAccess(patientId, type, "access");
  }

  getConsentHistory(patientId: string, role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "governance:read");
    return getConsentManagement().getHistory(patientId);
  }

  listCompliance(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "compliance:read");
    return getComplianceFrameworkEngine().list();
  }

  getPermissionMatrix(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "governance:read");
    return getRoleManagement().getPermissionMatrix();
  }

  evaluateABAC(context: Parameters<ReturnType<typeof getAttributeBasedAccess>["evaluate"]>[0], role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "governance:read");
    return getAttributeBasedAccess().evaluate(context);
  }

  listSessions(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "sessions:manage");
    return getIdentityProvider().getActiveSessions();
  }

  revokeSession(sessionId: string, role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "sessions:manage");
    return getIdentityProvider().revokeSession(sessionId);
  }

  listBackupPolicies(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "backup:manage");
    return getDisasterRecoveryArchitecture().listPolicies();
  }

  getDataSecurityConfig(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "security:admin");
    return getDataSecurityArchitecture().config;
  }

  issueAPIKey(name: string, scopes: string[], role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "api:manage");
    return getAPISecurityGateway().issueAPIKey(name, scopes);
  }

  recordAIDecision(audit: Parameters<ReturnType<typeof getAuditAggregationService>["recordAIDecision"]>[0]) {
    return getAuditAggregationService().recordAIDecision(audit);
  }

  getSecurityAlerts(role: ClinicalRole | GovernanceRole) {
    this.ac.assert(role, "governance:read");
    return getSecurityMonitoring().getActiveAlerts();
  }
}

let service: GovernanceService | null = null;

export function getGovernanceService() {
  if (!service) service = new GovernanceService();
  return service;
}
