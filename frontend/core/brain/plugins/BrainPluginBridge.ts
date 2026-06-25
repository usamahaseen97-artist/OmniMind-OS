import type { OmniMindPlugin } from "../../agent/types";
import type { PluginManager } from "../../agent/PluginManager";
import type { ActionExecutionContext, ActionExecutionResult, CapabilityMatch } from "../../plugins/types";

/** Bridges Universal Plugin System into Brain orchestration. */
export class BrainPluginBridge {
  constructor(private plugins: PluginManager) {}

  list() {
    return this.plugins.listRegistered();
  }

  install(plugin: OmniMindPlugin) {
    return this.plugins.install(plugin);
  }

  installManifest(manifest: Parameters<PluginManager["installManifest"]>[0]) {
    return this.plugins.installManifest(manifest);
  }

  discoverCapabilities(text: string): CapabilityMatch[] {
    return this.plugins.manager.matchCapabilities(text);
  }

  bestCapabilityMatch(text: string): CapabilityMatch | null {
    return this.plugins.manager.bestCapabilityMatch(text);
  }

  async executeAction(ctx: ActionExecutionContext): Promise<ActionExecutionResult> {
    return this.plugins.manager.executeAction(ctx);
  }

  getPluginForTool(toolId: string) {
    return this.plugins.manager.getByToolId(toolId);
  }
}
