import type {
  ActivityEvent,
  AuditEntry,
  CollabNotification,
  Organization,
  OrgInvitation,
  OrgMember,
  OrgPermission,
  OrgRole,
  OrgWorkspace,
} from "./types";
import { apiGet, apiPost, apiPut } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore/collaboration";

export const omniCollaborationApiClient = {
  listOrganizations() {
    return apiGet<{ ok: boolean; organizations: Organization[] }>(`${BASE}/organizations`);
  },
  saveOrganizations(organizations: Organization[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/organizations`, { organizations });
  },
  listMembers(orgId: string) {
    return apiGet<{ ok: boolean; members: OrgMember[] }>(`${BASE}/organizations/${orgId}/members`);
  },
  listWorkspaces(orgId: string) {
    return apiGet<{ ok: boolean; workspaces: OrgWorkspace[] }>(`${BASE}/organizations/${orgId}/workspaces`);
  },
  invite(orgId: string, email: string, role: OrgRole) {
    return apiPost<{ ok: boolean; invitation: OrgInvitation }>(`${BASE}/invites`, { orgId, email, role });
  },
  listActivity(orgId: string) {
    return apiGet<{ ok: boolean; events: ActivityEvent[] }>(`${BASE}/activity/${orgId}`);
  },
  listAudit(orgId: string) {
    return apiGet<{ ok: boolean; entries: AuditEntry[] }>(`${BASE}/audit/${orgId}`);
  },
  checkPermission(userId: string, orgId: string, permission: OrgPermission) {
    return apiPost<{ ok: boolean; allowed: boolean }>(`${BASE}/permissions/check`, {
      userId,
      orgId,
      permission,
    });
  },
  listNotifications(userId: string) {
    return apiGet<{ ok: boolean; notifications: CollabNotification[] }>(`${BASE}/notifications/${userId}`);
  },
  adminDashboard(orgId: string) {
    return apiGet<{ ok: boolean; dashboard: unknown }>(`${BASE}/admin/${orgId}/dashboard`);
  },
};
