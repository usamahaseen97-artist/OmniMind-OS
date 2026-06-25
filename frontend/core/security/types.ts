/** OmniCore Security Platform — enterprise types (Sprint 3). */

export type AuthProvider =
  | "email"
  | "passkey"
  | "google"
  | "microsoft"
  | "github"
  | "apple"
  | "saml"
  | "oidc";

export type AuthSession = {
  id: string;
  userId: string;
  provider: AuthProvider;
  deviceId: string;
  trusted: boolean;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
};

export type TrustedDevice = {
  id: string;
  userId: string;
  name: string;
  fingerprint: string;
  trustedAt: string;
  lastSeenAt: string;
};

export type SecurityRole =
  | "platform:owner"
  | "platform:admin"
  | "org:owner"
  | "org:admin"
  | "workspace:manager"
  | "project:editor"
  | "tool:operator"
  | "api:integrator"
  | "plugin:developer"
  | "viewer"
  | "guest";

export type SecurityPermission =
  | "auth:session:read"
  | "auth:session:revoke"
  | "org:read"
  | "org:write"
  | "workspace:read"
  | "workspace:write"
  | "project:read"
  | "project:write"
  | "tool:execute"
  | "api:key:manage"
  | "plugin:install"
  | "plugin:execute"
  | "audit:read"
  | "security:admin";

export type ABACContext = {
  userId: string;
  orgId?: string;
  workspaceId?: string;
  projectId?: string;
  toolSlug?: string;
  ip?: string;
  deviceTrusted?: boolean;
  mfaVerified?: boolean;
  attributes?: Record<string, string | boolean | number>;
};

export type ZeroTrustDecision = {
  allowed: boolean;
  reason: string;
  checks: Array<{ check: string; passed: boolean }>;
};

export type SecurityEvent = {
  id: string;
  kind: "login" | "logout" | "failed_login" | "permission_denied" | "api_abuse" | "anomaly" | "plugin" | "secret";
  severity: "low" | "medium" | "high" | "critical";
  actorId: string | null;
  resource: string;
  detail: string;
  ip: string | null;
  timestamp: string;
};

export type PIClassification = "public" | "internal" | "confidential" | "pii" | "phi" | "secret";

export type DataRetentionPolicy = {
  id: string;
  classification: PIClassification;
  retentionDays: number;
  encryptAtRest: boolean;
};

export type PluginSecurityManifest = {
  pluginId: string;
  signed: boolean;
  publisher: string;
  capabilities: string[];
  sandboxLevel: "strict" | "standard" | "trusted";
};

export type ComplianceFramework = "soc2" | "iso27001" | "hipaa" | "gdpr" | "ccpa";

export type ComplianceControl = {
  framework: ComplianceFramework;
  controlId: string;
  name: string;
  status: "implemented" | "partial" | "planned" | "n/a";
  evidence: string;
};

export type IdempotencyRecord = {
  key: string;
  method: string;
  path: string;
  responseHash: string;
  createdAt: string;
  expiresAt: string;
};

export type OAuthProviderConfig = {
  provider: Exclude<AuthProvider, "email" | "passkey" | "saml" | "oidc">;
  enabled: boolean;
  clientIdPlaceholder: string;
  scopes: string[];
};

export type SSOConfig = {
  orgId: string;
  protocol: "saml" | "oidc";
  enabled: boolean;
  issuerUrl: string | null;
  metadataUrl: string | null;
};
