import { omniPluginRegistry } from "./OmniPluginRegistry";
import { omniPluginLoader } from "./OmniPluginLoader";

/** Plugin updater — version bumps and rollback placeholders. */
export class OmniPluginUpdater {
  check(pluginId: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return null;
    return { current: plugin.version, latest: plugin.version, updateAvailable: false };
  }

  async update(pluginId: string, newVersion: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return null;
    const prev = plugin.version;
    plugin.version = newVersion;
    if (omniPluginLoader.isLoaded(pluginId)) {
      await omniPluginLoader.unload(pluginId);
      await omniPluginLoader.load(pluginId);
    }
    return { pluginId, from: prev, to: newVersion };
  }

  rollback(pluginId: string, version: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return null;
    plugin.version = version;
    return plugin;
  }
}

export const omniPluginUpdater = new OmniPluginUpdater();
