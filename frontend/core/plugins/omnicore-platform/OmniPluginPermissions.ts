import type { OmniPluginPermission, PermissionGrant } from "./types";

/** Granular permission architecture for extensions. */
export class OmniPluginPermissions {
  grants = new Map<string, PermissionGrant[]>();

  request(pluginId: string, permissions: OmniPluginPermission[]): PermissionGrant[] {
    const existing = this.grants.get(pluginId) ?? [];
    const next = permissions.map((permission) => {
      const found = existing.find((g) => g.permission === permission);
      return found ?? { permission, granted: false, scope: "session" as const };
    });
    this.grants.set(pluginId, next);
    return next;
  }

  grant(pluginId: string, permission: OmniPluginPermission, scope: PermissionGrant["scope"] = "session") {
    const list = this.grants.get(pluginId) ?? [];
    const g = list.find((x) => x.permission === permission);
    if (g) g.granted = true;
    else list.push({ permission, granted: true, scope });
    this.grants.set(pluginId, list);
    return list;
  }

  check(pluginId: string, permission: OmniPluginPermission) {
    return this.grants.get(pluginId)?.find((g) => g.permission === permission)?.granted ?? false;
  }

  revoke(pluginId: string) {
    this.grants.delete(pluginId);
  }
}

export const omniPluginPermissions = new OmniPluginPermissions();
