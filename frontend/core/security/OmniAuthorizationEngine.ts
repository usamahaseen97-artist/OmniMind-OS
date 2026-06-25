import { ROLE_PERMISSIONS } from "./constants";
import type { SecurityPermission, SecurityRole } from "./types";

/** OmniAuthorizationEngine — RBAC for org, workspace, project, tool, API, plugin. */
export class OmniAuthorizationEngine {
  userRoles = new Map<string, SecurityRole[]>();

  assignRole(userId: string, role: SecurityRole) {
    const roles = this.userRoles.get(userId) ?? [];
    if (!roles.includes(role)) roles.push(role);
    this.userRoles.set(userId, roles);
    return roles;
  }

  rolesFor(userId: string): SecurityRole[] {
    return this.userRoles.get(userId) ?? ["guest"];
  }

  permissionsFor(userId: string): SecurityPermission[] {
    const perms = new Set<SecurityPermission>();
    this.rolesFor(userId).forEach((role) => {
      ROLE_PERMISSIONS[role]?.forEach((p) => perms.add(p));
    });
    return Array.from(perms);
  }

  can(userId: string, permission: SecurityPermission): boolean {
    return this.permissionsFor(userId).includes(permission);
  }

  canAny(userId: string, permissions: SecurityPermission[]) {
    return permissions.some((p) => this.can(userId, p));
  }

  canAll(userId: string, permissions: SecurityPermission[]) {
    return permissions.every((p) => this.can(userId, p));
  }
}

export const omniAuthorizationEngine = new OmniAuthorizationEngine();
