import { getOmniPluginManager } from "./PluginManager";
import { buildOmniForgeAliasManifests, buildSovereignPluginManifests } from "./manifests/sovereign-plugins";

let registered = false;

/** Boot all core sovereign tools as plugins — called once at app start. */
export async function registerCorePlugins() {
  if (registered) return;
  const manager = getOmniPluginManager();
  if (manager.isBooted()) return;

  const manifests = [...buildSovereignPluginManifests(), ...buildOmniForgeAliasManifests()];
  for (const manifest of manifests) {
    await manager.install(manifest);
  }

  manager.markBooted();
  registered = true;
}

export function isCorePluginsRegistered() {
  return registered;
}
