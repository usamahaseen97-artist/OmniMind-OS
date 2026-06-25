import type { OAuthProviderConfig, SecurityPermission, SecurityRole } from "./types";

export const OMNICORE_SECURITY_VERSION = "3.0.0-sprint3";

export const ROLE_PERMISSIONS: Record<SecurityRole, SecurityPermission[]> = {
  "platform:owner": [
    "auth:session:read", "auth:session:revoke", "org:read", "org:write",
    "workspace:read", "workspace:write", "project:read", "project:write",
    "tool:execute", "api:key:manage", "plugin:install", "plugin:execute",
    "audit:read", "security:admin",
  ],
  "platform:admin": [
    "auth:session:read", "auth:session:revoke", "org:read", "org:write",
    "workspace:read", "workspace:write", "project:read", "project:write",
    "tool:execute", "api:key:manage", "plugin:install", "audit:read", "security:admin",
  ],
  "org:owner": [
    "org:read", "org:write", "workspace:read", "workspace:write",
    "project:read", "project:write", "tool:execute", "api:key:manage",
    "plugin:install", "audit:read",
  ],
  "org:admin": [
    "org:read", "org:write", "workspace:read", "workspace:write",
    "project:read", "project:write", "tool:execute", "audit:read",
  ],
  "workspace:manager": ["workspace:read", "workspace:write", "project:read", "project:write", "tool:execute"],
  "project:editor": ["project:read", "project:write", "tool:execute"],
  "tool:operator": ["tool:execute", "project:read"],
  "api:integrator": ["api:key:manage", "tool:execute"],
  "plugin:developer": ["plugin:install", "plugin:execute"],
  viewer: ["project:read", "workspace:read", "org:read"],
  guest: ["project:read"],
};

export const OAUTH_PROVIDERS: OAuthProviderConfig[] = [
  { provider: "google", enabled: true, clientIdPlaceholder: "GOOGLE_OAUTH_CLIENT_ID", scopes: ["openid", "email", "profile"] },
  { provider: "microsoft", enabled: false, clientIdPlaceholder: "MICROSOFT_OAUTH_CLIENT_ID", scopes: ["openid", "email", "profile"] },
  { provider: "github", enabled: false, clientIdPlaceholder: "GITHUB_OAUTH_CLIENT_ID", scopes: ["read:user", "user:email"] },
  { provider: "apple", enabled: false, clientIdPlaceholder: "APPLE_OAUTH_CLIENT_ID", scopes: ["name", "email"] },
];

export const RETENTION_POLICIES = [
  { id: "ret-public", classification: "public" as const, retentionDays: 365, encryptAtRest: false },
  { id: "ret-pii", classification: "pii" as const, retentionDays: 90, encryptAtRest: true },
  { id: "ret-phi", classification: "phi" as const, retentionDays: 2555, encryptAtRest: true },
  { id: "ret-secret", classification: "secret" as const, retentionDays: 30, encryptAtRest: true },
];
