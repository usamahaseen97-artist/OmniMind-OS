import type {
  ActivityEvent,
  CollabNotification,
  Organization,
  OrgMember,
  OrgPermission,
  OrgRole,
  OrgWorkspace,
} from "../../core/collaboration/types";

export type OmniCoreCollaborationContextSlice = {
  collaborationReady: boolean;
  collaborationVersion: string;
  organizations: Organization[];
  activeOrgId: string | null;
  activeOrg: Organization | null;
  orgMembers: OrgMember[];
  orgWorkspaces: OrgWorkspace[];
  collabNotifications: CollabNotification[];
  activityEvents: ActivityEvent[];
  switchOrganization: (orgId: string) => void;
  inviteMember: (email: string, role: OrgRole) => Promise<{ ok: boolean }>;
  checkPermission: (userId: string, permission: OrgPermission) => boolean;
  collabSnapshot: ReturnType<typeof import("../../core/collaboration/OmniCollaboration").omniCollaboration.snapshot>;
};
