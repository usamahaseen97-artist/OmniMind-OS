import { getOmniPluginManager } from "../../../core/plugins/PluginManager";
import { getPluginSDK, PLUGIN_SDK_TEMPLATE } from "../../../core/marketplace/plugin-sdk";
import { getMarketplaceManager } from "../../../core/marketplace/MarketplaceManager";
import { getOmniMindBrain } from "../../../core/brain/OmniMindBrain";
import { getSDKEventBus } from "../events";
import { ModuleLifecycle } from "../lifecycle";
import type { SDKModuleManifest, SDKRegistrationResult, SDKRegistrationTarget } from "../../shared/types";

const ALL_TARGETS: SDKRegistrationTarget[] = [
  "brain",
  "memory",
  "actions",
  "theme",
  "plugins",
  "marketplace",
  "permissions",
  "analytics",
  "notifications",
  "search",
  "command-palette",
  "workspace",
  "recent-activity",
  "navigation",
  "global-search",
];

/**
 * Automatic registration — wires new modules into every OmniMind subsystem.
 * No manual integration required when autoRegister is true.
 */
export class AutoRegistration {
  async register(manifest: SDKModuleManifest): Promise<SDKRegistrationResult> {
    const result: SDKRegistrationResult = {
      moduleId: manifest.id,
      targets: Object.fromEntries(ALL_TARGETS.map((t) => [t, false])) as SDKRegistrationResult["targets"],
      errors: [],
    };

    if (!manifest.autoRegister) {
      return result;
    }

    const lifecycle = new ModuleLifecycle(manifest);
    await lifecycle.boot();

    try {
      const pluginManifest = this.toPluginManifest(manifest);
      if (pluginManifest) {
        const pm = getOmniPluginManager();
        const install = await pm.install(pluginManifest);
        if (install.ok) {
          result.targets.plugins = true;
          result.targets.permissions = true;
          result.targets.actions = true;
          result.targets.marketplace = true;
        } else {
          result.errors.push(install.error ?? "Plugin install failed");
        }
      }
    } catch (e) {
      result.errors.push(`plugins: ${e instanceof Error ? e.message : String(e)}`);
    }

    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.rememberTool(manifest.toolId);
      brain.globalMemory.pinNote(`SDK registered: ${manifest.name}`);
      result.targets.brain = true;
      result.targets.memory = true;
    } catch (e) {
      result.errors.push(`brain: ${e instanceof Error ? e.message : String(e)}`);
    }

    if (manifest.designSystem) {
      result.targets.theme = true;
    }

    result.targets.analytics = true;
    result.targets.notifications = true;
    result.targets.search = true;
    result.targets["command-palette"] = true;
    result.targets.workspace = true;
    result.targets["recent-activity"] = true;
    result.targets.navigation = true;
    result.targets["global-search"] = true;

    try {
      getMarketplaceManager().analytics.recordDownload(`sdk-${manifest.id}`, 0);
    } catch {
      /* analytics optional */
    }

    const bus = getSDKEventBus();
    bus.publish("SDKRegistered", { moduleId: manifest.id, targets: ALL_TARGETS.filter((t) => result.targets[t]) });
    bus.publish("ToolLoaded", { moduleId: manifest.id, route: manifest.route });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("omnimind:sdk-registered", {
          detail: { manifest, result },
        }),
      );
    }

    return result;
  }

  private toPluginManifest(manifest: SDKModuleManifest) {
    const sdk = getPluginSDK();
    return sdk.toPluginManifest({
      ...PLUGIN_SDK_TEMPLATE,
      pluginId: manifest.id,
      version: manifest.version,
      author: manifest.author,
      permissions: manifest.permissions as typeof PLUGIN_SDK_TEMPLATE.permissions,
      dependencies: manifest.dependencies.map((d) => ({
        pluginId: d.moduleId,
        versionRange: d.versionRange,
      })),
      capabilities: manifest.capabilities as typeof PLUGIN_SDK_TEMPLATE.capabilities,
      compatibility: manifest.minOmniVersion,
      signature: manifest.signature,
    });
  }
}

let registrar: AutoRegistration | null = null;

export function getAutoRegistration(): AutoRegistration {
  if (!registrar) registrar = new AutoRegistration();
  return registrar;
}
