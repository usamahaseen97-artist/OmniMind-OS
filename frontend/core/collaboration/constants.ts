import type { CustomRole, Organization, OrgMember, OrgWorkspace } from "./types";

export const OMNICORE_COLLAB_VERSION = "5.0.0-phase5";

export const ROLE_PERMISSIONS: Record<string, import("./types").OrgPermission[]> = {
  owner: ["org:read", "org:write", "org:admin", "workspace:read", "workspace:write", "project:read", "project:write", "asset:read", "asset:write", "comment:write", "review:approve", "billing:read", "api-key:manage"],
  administrator: ["org:read", "org:write", "org:admin", "workspace:read", "workspace:write", "project:read", "project:write", "asset:read", "asset:write", "comment:write", "review:approve", "api-key:manage"],
  manager: ["org:read", "workspace:read", "workspace:write", "project:read", "project:write", "asset:read", "asset:write", "comment:write", "review:approve"],
  editor: ["workspace:read", "project:read", "project:write", "asset:read", "asset:write", "comment:write"],
  reviewer: ["workspace:read", "project:read", "asset:read", "comment:write", "review:approve"],
  viewer: ["workspace:read", "project:read", "asset:read"],
  guest: ["project:read"],
};

export const ORG_SEED: Organization[] = [
  { id: "org-1", name: "OmniMind Labs", slug: "omnimind-labs", plan: "enterprise", memberCount: 12, settings: { timezone: "UTC" }, createdAt: new Date().toISOString() },
];

export const MEMBER_SEED: OrgMember[] = [
  { id: "mem-1", orgId: "org-1", userId: "user-1", email: "admin@omnimind.io", name: "Admin User", role: "owner", customRoleId: null, status: "active" },
  { id: "mem-2", orgId: "org-1", userId: "user-2", email: "editor@omnimind.io", name: "Editor User", role: "editor", customRoleId: null, status: "active" },
];

export const WORKSPACE_SEED: OrgWorkspace[] = [
  { id: "ows-1", orgId: "org-1", name: "Product Team", projectIds: ["uproj-001"], storageUsedBytes: 2_400_000_000, memberIds: ["mem-1", "mem-2"] },
];
