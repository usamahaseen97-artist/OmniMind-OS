import type { DeveloperProfile } from "./types";
import { omniPluginMarketplace } from "./OmniPluginMarketplace";
import { omniPluginRegistry } from "./OmniPluginRegistry";

/** Developer portal — profiles, published plugins, analytics stubs. */
export class OmniDeveloperPortal {
  getProfile(id: string) {
    return omniPluginMarketplace.developers.find((d) => d.id === id) ?? null;
  }

  registerDeveloper(name: string): DeveloperProfile {
    const profile: DeveloperProfile = {
      id: `dev-${Date.now()}`,
      name,
      verified: false,
      pluginIds: [],
    };
    omniPluginMarketplace.developers.push(profile);
    return profile;
  }

  publish(pluginId: string, developerId: string) {
    const dev = this.getProfile(developerId);
    const plugin = omniPluginRegistry.get(pluginId);
    if (!dev || !plugin) return null;
    dev.pluginIds.push(pluginId);
    return plugin;
  }

  myPlugins(developerId: string) {
    const dev = this.getProfile(developerId);
    if (!dev) return [];
    return dev.pluginIds.map((id) => omniPluginRegistry.get(id)).filter(Boolean);
  }
}

export const omniDeveloperPortal = new OmniDeveloperPortal();
