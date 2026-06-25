import { Hammer } from "lucide-react";
import type { PluginSDKManifest } from "./types";

/** OmniMind Plugin SDK — contract for third-party extensions. */
export class OmniMindPluginSDK {
  validate(manifest: PluginSDKManifest): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!manifest.pluginId) errors.push("pluginId required");
    if (!manifest.version) errors.push("version required");
    if (!manifest.author) errors.push("author required");
    if (!manifest.capabilities.length) errors.push("at least one capability required");
    if (!manifest.compatibility) errors.push("compatibility required");
    return { ok: errors.length === 0, errors };
  }

  toPluginManifest(sdk: PluginSDKManifest): import("../plugins/types").OmniPluginManifest | null {
    const v = this.validate(sdk);
    if (!v.ok) return null;
    return {
      id: sdk.pluginId,
      name: sdk.pluginId.replace(/-/g, " "),
      description: `SDK plugin ${sdk.pluginId}`,
      icon: Hammer,
      category: "utility",
      version: sdk.version,
      author: sdk.author,
      route: `/marketplace/${sdk.pluginId}`,
      toolId: sdk.pluginId,
      permissions: sdk.permissions,
      capabilities: sdk.capabilities,
      actions: sdk.actions.map((a) => ({ id: a.id, label: a.label, capability: a.capability })),
      dependencies: sdk.dependencies,
      supportedInputs: sdk.requiredApis,
      supportedOutputs: ["result"],
      marketplace: { compatibility: sdk.compatibility, signature: sdk.signature },
      minOmniVersion: "12.0.0",
    };
  }
}

let sdk: OmniMindPluginSDK | null = null;

export function getPluginSDK(): OmniMindPluginSDK {
  if (!sdk) sdk = new OmniMindPluginSDK();
  return sdk;
}

export const PLUGIN_SDK_TEMPLATE: PluginSDKManifest = {
  pluginId: "my-omnimind-plugin",
  version: "1.0.0",
  author: "Your Company",
  permissions: ["filesystem", "network"],
  dependencies: [],
  requiredApis: ["brain.processRequest", "tool-framework.execute"],
  uiComponents: ["MyPluginPanel"],
  actions: [{ id: "run", label: "Run Action", capability: "generate-code" }],
  commands: [{ id: "open", label: "Open Plugin" }],
  capabilities: ["generate-code"],
  lifecycleHooks: ["install", "enable", "disable", "update", "remove"],
  securityRequirements: ["sandbox", "permission-gate"],
  compatibility: "12.x",
};
