import type { ToolPluginManifest } from "./types";
import type { OmniPluginManifest } from "../plugins/types";
import { getOmniPluginManager } from "../plugins";
import { getUniversalToolRegistry } from "./registry";

const installed = new Map<string, ToolPluginManifest>();

/** Install a tool plugin — syncs Universal Tool Framework + Plugin System. */
export async function installToolPlugin(manifest: ToolPluginManifest) {
  const registry = getUniversalToolRegistry();
  if (installed.has(manifest.id)) {
    installed.get(manifest.id)?.onUnload?.();
  }
  manifest.register({
    registerTool: (tool) => registry.register(tool),
  });
  manifest.onInstall?.();
  installed.set(manifest.id, manifest);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omnimind:tool-plugin-installed", { detail: { id: manifest.id, name: manifest.name } }),
    );
  }
}

export async function installOmniPlugin(manifest: OmniPluginManifest) {
  return getOmniPluginManager().install(manifest);
}

export function uninstallToolPlugin(pluginId: string) {
  const plugin = installed.get(pluginId);
  plugin?.onUnload?.();
  installed.delete(pluginId);
  void getOmniPluginManager().uninstall(pluginId);
}

export function listInstalledPlugins(): ToolPluginManifest[] {
  return [...installed.values()];
}
