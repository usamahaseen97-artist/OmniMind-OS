import type { OmniPluginManifest } from "../plugins";
import { getOmniPluginManager } from "../plugins";
import type { OmniMindPlugin } from "./types";
import type { ToolRegistry } from "./ToolRegistry";

/** Agent-facing plugin layer — delegates to Universal Plugin System. */
export class PluginManager {
  private omni = getOmniPluginManager();

  constructor(private registry: ToolRegistry) {}

  /** Install a full OmniPluginManifest (preferred). */
  async installManifest(manifest: OmniPluginManifest) {
    return this.omni.install(manifest);
  }

  /** Legacy OmniMindPlugin adapter — registers tools in agent registry. */
  install(plugin: OmniMindPlugin) {
    if (this.omni.registry.has(plugin.id)) {
      void this.omni.uninstall(plugin.id);
    }
    this.registry.registerPlugin(plugin);
  }

  async uninstall(pluginId: string) {
    await this.omni.uninstall(pluginId);
  }

  list(): OmniMindPlugin[] {
    return this.omni.list().map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      description: p.description,
      registerTools: () => {},
    }));
  }

  listRegistered() {
    return this.omni.list();
  }

  get manager() {
    return this.omni;
  }
}
