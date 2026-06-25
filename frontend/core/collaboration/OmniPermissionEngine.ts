import { omniOrganization } from "./OmniOrganization";
import { omniRoleManager } from "./OmniRoleManager";
import type { AccessLog, OrgPermission } from "./types";

/** OmniPermissionEngine — granular permission validation. */
export class OmniPermissionEngine {
  accessLogs: AccessLog[] = [];

  can(userId: string, orgId: string, permission: OrgPermission): boolean {
    const member = omniOrganization.members.find(
      (m) => m.userId === userId && m.orgId === orgId && m.status === "active",
    );
    if (!member) {
      this.log(userId, permission, orgId, false);
      return false;
    }
    const perms = omniRoleManager.permissionsFor(member.role, member.customRoleId);
    const allowed = perms.includes(permission);
    this.log(userId, permission, orgId, allowed);
    return allowed;
  }

  canAny(userId: string, orgId: string, permissions: OrgPermission[]) {
    return permissions.some((p) => this.can(userId, orgId, p));
  }

  canAll(userId: string, orgId: string, permissions: OrgPermission[]) {
    return permissions.every((p) => this.can(userId, orgId, p));
  }

  private log(userId: string, action: string, resource: string, allowed: boolean) {
    this.accessLogs.unshift({
      id: `acl-${Date.now()}`,
      userId,
      action,
      resource,
      allowed,
      timestamp: new Date().toISOString(),
    });
    if (this.accessLogs.length > 500) this.accessLogs.pop();
  }

  recentLogs(limit = 50) {
    return this.accessLogs.slice(0, limit);
  }
}

export const omniPermissionEngine = new OmniPermissionEngine();
