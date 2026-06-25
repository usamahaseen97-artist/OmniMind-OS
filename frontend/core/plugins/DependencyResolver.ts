import type { OmniPluginManifest, PluginDependency } from "./types";
import { getVersionManager } from "./VersionManager";

export type DependencyResolution = {
  ok: boolean;
  missing: PluginDependency[];
  incompatible: { dep: PluginDependency; installedVersion?: string }[];
};

/** Resolves plugin dependency graph before activation. */
export class DependencyResolver {
  constructor(private getInstalledVersion: (pluginId: string) => string | undefined) {}

  resolve(manifest: OmniPluginManifest, installedIds: Set<string>): DependencyResolution {
    const missing: PluginDependency[] = [];
    const incompatible: DependencyResolution["incompatible"] = [];

    for (const dep of manifest.dependencies ?? []) {
      if (!installedIds.has(dep.pluginId)) {
        missing.push(dep);
        continue;
      }
      const version = this.getInstalledVersion(dep.pluginId);
      if (version && !getVersionManager().satisfies(version, dep.versionRange)) {
        incompatible.push({ dep, installedVersion: version });
      }
    }

    return { ok: missing.length === 0 && incompatible.length === 0, missing, incompatible };
  }
}
