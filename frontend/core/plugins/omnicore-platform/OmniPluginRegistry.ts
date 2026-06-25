import type { OmniPlatformPlugin } from "./types";
import { PLUGIN_SEED } from "./constants";

/** Extension plugin registry — marketplace + installed plugins. */
export class OmniPluginRegistry {
  plugins: OmniPlatformPlugin[] = PLUGIN_SEED.map((p) => ({ ...p }));

  list(filter?: { type?: OmniPlatformPlugin["type"]; enabled?: boolean }) {
    return this.plugins.filter((p) => {
      if (filter?.type && p.type !== filter.type) return false;
      if (filter?.enabled !== undefined && p.enabled !== filter.enabled) return false;
      return true;
    });
  }

  get(id: string) {
    return this.plugins.find((p) => p.id === id) ?? null;
  }

  register(plugin: OmniPlatformPlugin) {
    const idx = this.plugins.findIndex((p) => p.id === plugin.id);
    if (idx >= 0) this.plugins[idx] = plugin;
    else this.plugins.push(plugin);
    return plugin;
  }

  unregister(id: string) {
    this.plugins = this.plugins.filter((p) => p.id !== id);
  }
}

export const omniPluginRegistry = new OmniPluginRegistry();
