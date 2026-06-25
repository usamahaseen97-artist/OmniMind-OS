import type {
  IdentitySession,
  UnifiedAuditEvent,
  PatientConsent,
  CompliancePlugin,
  BackupPolicy,
  SecurityAlert,
  APIKeyRecord,
} from "../types";

export type DbIdentitySession = IdentitySession & { encrypted: boolean };
export type DbUnifiedAuditEvent = UnifiedAuditEvent;
export type DbPatientConsent = PatientConsent & { encryptedAtRest: boolean };
export type DbCompliancePlugin = CompliancePlugin;
export type DbBackupPolicy = BackupPolicy;
export type DbSecurityAlert = SecurityAlert;
export type DbAPIKeyRecord = APIKeyRecord & { hashedKey: string };

export type DbGovernanceAuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};
