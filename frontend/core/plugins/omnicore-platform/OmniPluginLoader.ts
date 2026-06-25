import { omniPluginRegistry } from "./OmniPluginRegistry";
import { omniPlatformPluginManager } from "./OmniPluginManager";
import { omniPluginPermissions } from "./OmniPluginPermissions";

/** Plugin loader — resolves and activates extensions in sandbox. */
export class OmniPluginLoader {
  loaded = new Set<string>();

  async load(pluginId: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return { ok: false, error: "Plugin not found" };
    const pending = omniPluginPermissions.request(pluginId, plugin.permissions);
    const denied = pending.filter((p) => !p.granted && plugin.permissions.includes(p.permission));
    if (denied.length > 0 && plugin.permissions.length > 0) {
      return { ok: false, error: "Permissions required", pending };
    }
    this.loaded.add(pluginId);
    omniPlatformPluginManager.enable(pluginId);
    return { ok: true, plugin };
  }

  unload(pluginId: string) {
    this.loaded.delete(pluginId);
    omniPlatformPluginManager.disable(pluginId);
    return true;
  }

  isLoaded(pluginId: string) {
    return this.loaded.has(pluginId);
  }
}

export const omniPluginLoader = new OmniPluginLoader();
