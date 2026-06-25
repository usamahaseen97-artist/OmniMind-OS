/** OmniCore Collaboration — enterprise types (Phase 5). */

export type OrgRole =
  | "owner"
  | "administrator"
  | "manager"
  | "editor"
  | "reviewer"
  | "viewer"
  | "guest"
  | "custom";

export type OrgPermission =
  | "org:read"
  | "org:write"
  | "org:admin"
  | "workspace:read"
  | "workspace:write"
  | "project:read"
  | "project:write"
  | "asset:read"
  | "asset:write"
  | "comment:write"
  | "review:approve"
  | "billing:read"
  | "api-key:manage";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "team" | "enterprise";
  memberCount: number;
  settings: Record<string, string>;
  createdAt: string;
};

export type Department = {
  id: string;
  orgId: string;
  name: string;
  parentId: string | null;
};

export type Team = {
  id: string;
  orgId: string;
  departmentId: string | null;
  name: string;
  memberIds: string[];
};

export type OrgMember = {
  id: string;
  orgId: string;
  userId: string;
  email: string;
  name: string;
  role: OrgRole;
  customRoleId: string | null;
  status: "active" | "invited" | "suspended";
};

export type OrgInvitation = {
  id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  status: "pending" | "accepted" | "expired";
  invitedAt: string;
};

export type OrgWorkspace = {
  id: string;
  orgId: string;
  name: string;
  projectIds: string[];
  storageUsedBytes: number;
  memberIds: string[];
};

export type CustomRole = {
  id: string;
  orgId: string;
  name: string;
  permissions: OrgPermission[];
};

export type PresenceState = {
  userId: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeenAt: string;
  typingIn: string | null;
  cursor: { x: number; y: number; resourceId: string } | null;
};

export type SharedSession = {
  id: string;
  resourceId: string;
  resourceType: "project" | "asset" | "file";
  participantIds: string[];
  startedAt: string;
};

export type CommentThread = {
  id: string;
  resourceType: "inline" | "file" | "asset" | "timeline";
  resourceId: string;
  resolved: boolean;
  messages: CommentMessage[];
};

export type CommentMessage = {
  id: string;
  authorId: string;
  body: string;
  mentions: string[];
  attachments: string[];
  createdAt: string;
};

export type ReviewRequest = {
  id: string;
  resourceId: string;
  requesterId: string;
  reviewerIds: string[];
  status: "pending" | "approved" | "changes-requested";
};

export type ActivityEvent = {
  id: string;
  orgId: string;
  kind: "project" | "asset" | "system" | "ai" | "member" | "security";
  action: string;
  actorId: string;
  targetId: string;
  summary: string;
  timestamp: string;
};

export type CollabNotification = {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  resource: string;
  ip: string | null;
  timestamp: string;
  metadata: Record<string, string>;
};

export type ApiKey = {
  id: string;
  orgId: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

export type SecurityPolicy = {
  id: string;
  orgId: string;
  mfaRequired: boolean;
  ipAllowlist: string[];
  sessionTimeoutMin: number;
  deviceTrustRequired: boolean;
};

export type EnterpriseSettings = {
  orgId: string;
  ssoEnabled: boolean;
  ssoProvider: string | null;
  dataRetentionDays: number;
  encryptionAtRest: boolean;
  auditRetentionDays: number;
};

export type BillingPlan = {
  orgId: string;
  plan: Organization["plan"];
  seats: number;
  storageQuotaBytes: number;
  usedStorageBytes: number;
  renewalAt: string;
};

export type AccessLog = {
  id: string;
  userId: string;
  action: string;
  resource: string;
  allowed: boolean;
  timestamp: string;
};
