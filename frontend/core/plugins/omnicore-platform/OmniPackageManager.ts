import type { PackageResolution } from "./types";
import { omniPluginRegistry } from "./OmniPluginRegistry";

/** Package manager — dependency resolution, compatibility, signatures. */
export class OmniPackageManager {
  resolve(pluginId: string): PackageResolution {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return { ok: false, installOrder: [], conflicts: [], missing: ["plugin"] };

    const installOrder: string[] = [pluginId];
    const missing: string[] = [];
    const conflicts: string[] = [];

    plugin.dependencies.forEach((depId) => {
      const dep = omniPluginRegistry.get(depId);
      if (!dep) missing.push(depId);
      else installOrder.unshift(depId);
    });

    if (plugin.signature === null && plugin.type === "enterprise") {
      conflicts.push("unsigned-enterprise");
    }

    return { ok: missing.length === 0 && conflicts.length === 0, installOrder, conflicts, missing };
  }

  compatible(pluginId: string, coreVersion: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return false;
    return coreVersion >= plugin.minCoreVersion;
  }

  verifySignature(pluginId: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    return Boolean(plugin?.signature);
  }
}

export const omniPackageManager = new OmniPackageManager();
