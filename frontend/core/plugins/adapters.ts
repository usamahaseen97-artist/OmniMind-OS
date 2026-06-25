import type { AgentToolDefinition } from "../agent/types";
import { globalToolRegistry } from "../agent/ToolRegistry";
import type { UniversalToolDefinition } from "../tool-framework/types";
import { getUniversalToolRegistry } from "../tool-framework/registry";
import type { OmniPluginManifest } from "./types";

export function pluginToAgentTool(manifest: OmniPluginManifest): AgentToolDefinition {
  return {
    id: manifest.toolId,
    slug: manifest.toolId,
    name: manifest.name,
    description: manifest.description,
    href: manifest.route,
    capabilities: manifest.capabilities,
    actions: manifest.actions.map((a) => ({
      id: a.id,
      label: a.label,
      description: a.description,
      command: a.command,
    })),
    permissions: manifest.permissions.includes("deployment")
      ? ["read", "write", "deploy", "execute"]
      : ["read", "write", "execute"],
    supportedInputs: manifest.supportedInputs,
    supportedOutputs: manifest.supportedOutputs,
    keywords: manifest.keywords ?? [
      manifest.toolId.replace(/-/g, " "),
      manifest.name.toLowerCase(),
      ...manifest.capabilities,
    ],
    routeId: manifest.routeId ?? manifest.toolId,
    pluginId: manifest.id,
  };
}

const VALID_CATEGORIES = new Set<UniversalToolDefinition["category"]>([
  "development",
  "analytics",
  "creative",
  "medical",
  "finance",
  "science",
  "marketing",
  "entertainment",
  "utility",
]);

export function pluginToUniversalTool(manifest: OmniPluginManifest): UniversalToolDefinition {
  const category = VALID_CATEGORIES.has(manifest.category as UniversalToolDefinition["category"])
    ? (manifest.category as UniversalToolDefinition["category"])
    : "utility";

  return {
    toolId: manifest.toolId,
    title: manifest.name,
    description: manifest.description,
    icon: manifest.icon,
    category,
    capabilities: manifest.capabilities,
    acceptedInputs: manifest.supportedInputs,
    generatedOutputs: manifest.supportedOutputs,
    supportedActions: manifest.actions.map((a) => ({
      id: a.id,
      label: a.label,
      command: a.command,
      permission: a.permission === "deployment" ? "deploy" : "execute",
    })),
    permissions: manifest.permissions.includes("deployment")
      ? ["read", "write", "deploy", "execute"]
      : ["read", "write", "execute"],
    keyboardShortcuts: manifest.keyboardShortcuts ?? [],
    aiPrompts: manifest.actions
      .filter((a) => a.command)
      .map((a) => ({ id: a.id, label: a.label, template: a.command! })),
    href: manifest.route,
    routeId: manifest.routeId ?? manifest.toolId,
    pluginId: manifest.id,
  };
}

export function syncPluginToRegistries(manifest: OmniPluginManifest) {
  globalToolRegistry.register(pluginToAgentTool(manifest));
  getUniversalToolRegistry().register(pluginToUniversalTool(manifest));
}

export function unsyncPluginFromRegistries(manifest: OmniPluginManifest) {
  // Sovereign tools remain in base registry; plugins override on reinstall only.
  void manifest;
}
