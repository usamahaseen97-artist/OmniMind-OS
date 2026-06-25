import { omniPackageManager } from "./OmniPackageManager";
import { omniPluginLoader } from "./OmniPluginLoader";
import { omniPluginMarketplace } from "./OmniPluginMarketplace";
import { omniPluginSandbox } from "./OmniPluginSandbox";
import { omniPlatformPluginManager } from "./OmniPluginManager";

/** Plugin installer — marketplace install with dependency resolution. */
export class OmniPluginInstaller {
  async install(pluginId: string) {
    const resolution = omniPackageManager.resolve(pluginId);
    if (!resolution.ok) return { ok: false, resolution };

    for (const id of resolution.installOrder) {
      omniPluginMarketplace.install(id);
      omniPluginSandbox.create(id);
      await omniPluginLoader.load(id);
    }
    return { ok: true, resolution };
  }

  uninstall(pluginId: string) {
    omniPluginLoader.unload(pluginId);
    omniPluginSandbox.destroy(pluginId);
    omniPlatformPluginManager.disable(pluginId);
    return true;
  }
}

export const omniPluginInstaller = new OmniPluginInstaller();
