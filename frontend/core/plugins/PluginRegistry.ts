import type { OmniPluginManifest, RegisteredPlugin } from "./types";

/** Central store of all plugin manifests and lifecycle metadata. */
export class PluginRegistry {
  private plugins = new Map<string, RegisteredPlugin>();

  register(manifest: OmniPluginManifest, lifecycle: RegisteredPlugin["lifecycle"] = "registered"): RegisteredPlugin {
    const entry: RegisteredPlugin = {
      ...manifest,
      lifecycle,
      installedAt: new Date().toISOString(),
    };
    this.plugins.set(manifest.id, entry);
    return entry;
  }

  updateLifecycle(pluginId: string, lifecycle: RegisteredPlugin["lifecycle"], activatedAt?: string) {
    const entry = this.plugins.get(pluginId);
    if (!entry) return;
    this.plugins.set(pluginId, { ...entry, lifecycle, activatedAt: activatedAt ?? entry.activatedAt });
  }

  get(pluginId: string): RegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getByToolId(toolId: string): RegisteredPlugin | undefined {
    return [...this.plugins.values()].find((p) => p.toolId === toolId);
  }

  list(): RegisteredPlugin[] {
    return [...this.plugins.values()];
  }

  listActive(): RegisteredPlugin[] {
    return this.list().filter((p) => p.lifecycle === "active");
  }

  remove(pluginId: string) {
    this.plugins.delete(pluginId);
  }

  has(pluginId: string) {
    return this.plugins.has(pluginId);
  }
}

let registry: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!registry) registry = new PluginRegistry();
  return registry;
}
