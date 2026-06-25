import { OMNICORE_PLUGINS_VERSION } from "./constants";
import { omniAutomationSDK } from "./OmniAutomationSDK";
import { omniDeveloperPortal } from "./OmniDeveloperPortal";
import { omniExtensionAPI } from "./OmniExtensionAPI";
import { omniPackageManager } from "./OmniPackageManager";
import { omniPlatformPluginManager } from "./OmniPluginManager";
import { omniPluginDiagnostics } from "./OmniPluginDiagnostics";
import { omniPluginInstaller } from "./OmniPluginInstaller";
import { omniPluginLoader } from "./OmniPluginLoader";
import { omniPluginMarketplace } from "./OmniPluginMarketplace";
import { omniPluginPermissions } from "./OmniPluginPermissions";
import { omniPluginRegistry } from "./OmniPluginRegistry";
import { omniPluginSandbox } from "./OmniPluginSandbox";
import { omniPluginUpdater } from "./OmniPluginUpdater";
import { omniThemeSDK } from "./OmniThemeSDK";

/** OmniPluginEngine — extension platform orchestrator. */
export class OmniPluginEngine {
  readonly version = OMNICORE_PLUGINS_VERSION;

  readonly registry = omniPluginRegistry;
  readonly manager = omniPlatformPluginManager;
  readonly loader = omniPluginLoader;
  readonly sandbox = omniPluginSandbox;
  readonly permissions = omniPluginPermissions;
  readonly marketplace = omniPluginMarketplace;
  readonly api = omniExtensionAPI;
  readonly theme = omniThemeSDK;
  readonly automation = omniAutomationSDK;
  readonly developer = omniDeveloperPortal;
  readonly packages = omniPackageManager;
  readonly installer = omniPluginInstaller;
  readonly updater = omniPluginUpdater;
  readonly diagnostics = omniPluginDiagnostics;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    return this;
  }

  async installAndLoad(pluginId: string) {
    const result = await this.installer.install(pluginId);
    if (result.ok) this.diagnostics.track(pluginId, "activation", 50);
    return result;
  }

  snapshot() {
    return {
      version: this.version,
      installed: this.registry.list().length,
      active: this.manager.active().length,
      marketplace: this.marketplace.listings.length,
    };
  }
}

export const omniPluginEngine = new OmniPluginEngine();
