/**
 * Healthcare Security, Compliance & Governance — type contracts (Phase 7)
 * Architecture scaffolding — not legal certification claims.
 */

export const GOVERNANCE_DISCLAIMER =
  "Security and compliance architecture for qualified healthcare organizations. " +
  "Configurable frameworks require organizational legal review before production deployment.";

export type GovernanceRole =
  | "doctor"
  | "specialist"
  | "nurse"
  | "radiologist"
  | "lab-technician"
  | "pharmacist"
  | "receptionist"
  | "hospital-administrator"
  | "auditor"
  | "research-user"
  | "system-administrator";

export type AuthProtocol = "sso" | "oauth2" | "oidc" | "api-key" | "jwt" | "mfa" | "biometric";

export type MFAMethod = "totp" | "sms" | "email" | "hardware-key" | "biometric";

export type IdentitySession = {
  id: string;
  userId: string;
  role: GovernanceRole;
  clinicalRole: import("../../../../lib/medical-enterprise/types").ClinicalRole;
  protocol: AuthProtocol;
  mfaVerified: boolean;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  deviceId?: string;
  active: boolean;
};

export type SSOProvider = {
  id: string;
  name: string;
  protocol: "oauth2" | "oidc" | "saml";
  issuerUrl?: string;
  clientId?: string;
  enabled: boolean;
};

export type BiometricAuthHook = {
  id: string;
  type: "fingerprint" | "face" | "iris" | "voice";
  verify: (sample: ArrayBuffer) => Promise<{ verified: boolean; confidence: number }>;
};

export type GovernancePermission = string;

export type RoleDefinition = {
  id: GovernanceRole;
  label: string;
  clinicalRole: import("../../../../lib/medical-enterprise/types").ClinicalRole;
  permissions: GovernancePermission[];
  departmentScoped: boolean;
};

export type ABACPolicy = {
  id: string;
  name: string;
  effect: "allow" | "deny";
  attributes: { subject: Record<string, string>; resource: Record<string, string>; action: string; environment?: Record<string, string> };
  priority: number;
  enabled: boolean;
};

export type EncryptionConfig = {
  atRest: { algorithm: string; keyRotationDays: number };
  inTransit: { tlsMinVersion: string; certificatePinning: boolean };
  keyManagement: { provider: string; hsmReady: boolean };
};

export type SecureStoragePolicy = {
  id: string;
  resourceType: "file" | "image" | "report" | "emr" | "backup";
  encrypted: boolean;
  immutable: boolean;
  retentionDays?: number;
};

export type UnifiedAuditEvent = {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  action: string;
  category: "login" | "patient-access" | "ai-view" | "ai-decision" | "prescription" | "report-edit" | "imaging" | "laboratory" | "config" | "api" | "consent" | "security";
  resourceType: string;
  resourceId: string;
  patientId?: string;
  outcome: "success" | "failure" | "denied";
  source: "governance" | "his" | "imaging" | "laboratory" | "multi-agent" | "clinical-ai";
  metadata?: Record<string, unknown>;
  immutable: true;
};

export type AIDecisionAudit = {
  id: string;
  patientId: string;
  recommendationId: string;
  agentId?: string;
  viewedAt: string;
  decision?: "accepted" | "rejected" | "deferred";
  decidedAt?: string;
  decidedBy: string;
};

export type ConsentType =
  | "treatment"
  | "data-sharing"
  | "research"
  | "telemedicine"
  | "imaging"
  | "laboratory";

export type PatientConsent = {
  id: string;
  patientId: string;
  type: ConsentType;
  scope: string;
  grantedAt: string;
  expiresAt?: string;
  withdrawnAt?: string;
  status: "active" | "withdrawn" | "expired";
  grantedBy?: string;
  version: number;
};

export type ConsentHistoryEntry = {
  consentId: string;
  patientId: string;
  action: "granted" | "withdrawn" | "renewed" | "expired";
  timestamp: string;
  actorId: string;
};

export type ComplianceFramework = "hipaa" | "gdpr" | "iso-27001" | "soc-2" | "regional" | "custom";

export type CompliancePlugin = {
  id: string;
  framework: ComplianceFramework;
  name: string;
  version: string;
  region?: string;
  controls: { id: string; label: string; status: "configured" | "partial" | "not-configured" }[];
  enabled: boolean;
};

export type BackupPolicy = {
  id: string;
  name: string;
  schedule: "hourly" | "daily" | "weekly";
  incremental: boolean;
  geoRedundant: boolean;
  retentionDays: number;
  encrypted: boolean;
};

export type DisasterRecoveryPlan = {
  id: string;
  name: string;
  rtoMinutes: number;
  rpoMinutes: number;
  geoRegions: string[];
  lastTestedAt?: string;
  status: "active" | "draft";
};

export type SecurityAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  category: "failed-login" | "permission-violation" | "suspicious-activity" | "api-anomaly" | "data-access" | "integrity";
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
};

export type SecurityDashboardMetrics = {
  failedLogins24h: number;
  permissionViolations24h: number;
  suspiciousActivity: number;
  apiAnomalies: number;
  dataAccessAlerts: number;
  deviceStatus: "healthy" | "degraded" | "critical";
  systemIntegrity: "verified" | "warning" | "compromised";
  activeSessions: number;
  lastUpdated: string;
};

export type APIKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  rateLimitPerMinute: number;
  createdAt: string;
  expiresAt?: string;
  revoked: boolean;
};

export type RateLimitPolicy = {
  id: string;
  endpoint: string;
  requestsPerMinute: number;
  burst: number;
};

export type WebhookConfig = {
  id: string;
  url: string;
  events: string[];
  signingSecretRef: string;
  enabled: boolean;
};
