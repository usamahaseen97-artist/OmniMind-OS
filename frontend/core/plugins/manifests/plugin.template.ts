import { Hammer } from "lucide-react";
import type { OmniPluginManifest } from "../types";

/**
 * Copy this template to add a new OmniMind tool as a plugin.
 * No new routes or layout shells required when extending an existing sovereign workspace.
 */
export const OMNI_PLUGIN_TEMPLATE: OmniPluginManifest = {
  id: "my-tool-plugin",
  name: "My Tool",
  description: "Describe what this plugin does.",
  icon: Hammer,
  category: "utility",
  version: "1.0.0",
  author: "Your Name",
  route: "/my-tool",
  workspace: "native",
  toolId: "my-tool",
  permissions: ["filesystem", "network"],
  capabilities: ["generate-code"],
  actions: [
    { id: "createProject", label: "Create Project", capability: "generate-code", permission: "filesystem" },
  ],
  dependencies: [{ pluginId: "sovereign-omniforge-engine", versionRange: ">=12.0.0" }],
  featureFlags: { "generate-code": "beta" },
  keyboardShortcuts: [{ keys: "Ctrl+Enter", actionId: "createProject", label: "Run" }],
  supportedInputs: ["prompt", "file"],
  supportedOutputs: ["code", "report"],
  keywords: ["my", "tool"],
  minOmniVersion: "12.0.0",
  marketplace: {
    compatibility: "12.x",
    signature: "optional-future-ed25519-signature",
  },
};
