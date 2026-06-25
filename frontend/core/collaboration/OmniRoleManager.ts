import { ROLE_PERMISSIONS } from "./constants";
import type { CustomRole, OrgPermission, OrgRole } from "./types";

/** OmniRoleManager — built-in and custom enterprise roles. */
export class OmniRoleManager {
  customRoles: CustomRole[] = [];

  permissionsFor(role: OrgRole, customRoleId?: string | null): OrgPermission[] {
    if (role === "custom" && customRoleId) {
      return this.customRoles.find((r) => r.id === customRoleId)?.permissions ?? [];
    }
    return ROLE_PERMISSIONS[role] ?? [];
  }

  listCustom(orgId: string) {
    return this.customRoles.filter((r) => r.orgId === orgId);
  }

  createCustom(orgId: string, name: string, permissions: OrgPermission[]) {
    const role: CustomRole = {
      id: `role-${Date.now()}`,
      orgId,
      name,
      permissions,
    };
    this.customRoles.push(role);
    return role;
  }

  updateCustom(roleId: string, permissions: OrgPermission[]) {
    const role = this.customRoles.find((r) => r.id === roleId);
    if (!role) return null;
    role.permissions = permissions;
    return role;
  }

  deleteCustom(roleId: string) {
    const idx = this.customRoles.findIndex((r) => r.id === roleId);
    if (idx < 0) return false;
    this.customRoles.splice(idx, 1);
    return true;
  }

  builtInRoles(): OrgRole[] {
    return ["owner", "administrator", "manager", "editor", "reviewer", "viewer", "guest"];
  }
}

export const omniRoleManager = new OmniRoleManager();
