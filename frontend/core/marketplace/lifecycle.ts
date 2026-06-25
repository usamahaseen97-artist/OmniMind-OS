import { getOmniPluginManager } from "../plugins/PluginManager";
import { getVersionManager } from "../plugins/VersionManager";
import type { OmniPluginManifest } from "../plugins/types";
import type { PluginHealthReport } from "./types";

const VERSION_HISTORY_KEY = "omnimind_plugin_versions_v1";

/** Extended plugin lifecycle — enable, disable, update, rollback, repair, health, migration. */
export class MarketplaceLifecycle {
  private disabled = new Set<string>();
  private versionHistory = new Map<string, OmniPluginManifest[]>();

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(VERSION_HISTORY_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, OmniPluginManifest[]>;
        this.versionHistory = new Map(Object.entries(obj));
      }
    } catch {
      /* ignore */
    }
  }

  private saveHistory() {
    if (typeof window === "undefined") return;
    const obj = Object.fromEntries(this.versionHistory);
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(obj));
  }

  private pushVersion(manifest: OmniPluginManifest) {
    const hist = this.versionHistory.get(manifest.id) ?? [];
    if (!hist.find((h) => h.version === manifest.version)) {
      hist.unshift(manifest);
      this.versionHistory.set(manifest.id, hist.slice(0, 10));
      this.saveHistory();
    }
  }

  async install(manifest: OmniPluginManifest) {
    const pm = getOmniPluginManager();
    const result = await pm.install(manifest);
    if (result.ok) this.pushVersion(manifest);
    return result;
  }

  async enable(pluginId: string) {
    this.disabled.delete(pluginId);
    const entry = getOmniPluginManager().registry.get(pluginId);
    if (entry) await getOmniPluginManager().lifecycle.resume(pluginId);
    this.emit("enabled", pluginId);
  }

  async disable(pluginId: string) {
    this.disabled.add(pluginId);
    await getOmniPluginManager().suspend(pluginId);
    this.emit("disabled", pluginId);
  }

  isEnabled(pluginId: string) {
    return !this.disabled.has(pluginId);
  }

  async update(manifest: OmniPluginManifest) {
    const prev = getOmniPluginManager().registry.get(manifest.id);
    if (prev) this.pushVersion(prev);
    await getOmniPluginManager().uninstall(manifest.id);
    return this.install(manifest);
  }

  async rollback(pluginId: string) {
    const hist = this.versionHistory.get(pluginId);
    const prev = hist?.[1];
    if (!prev) return { ok: false, error: "No previous version" };
    return this.update(prev);
  }

  async repair(pluginId: string) {
    const entry = getOmniPluginManager().registry.get(pluginId);
    if (!entry) return { ok: false, error: "Plugin not found" };
    await getOmniPluginManager().uninstall(pluginId);
    return this.install(entry);
  }

  async remove(pluginId: string) {
    this.disabled.delete(pluginId);
    await getOmniPluginManager().uninstall(pluginId);
    this.emit("removed", pluginId);
  }

  healthCheck(pluginId: string): PluginHealthReport {
    const entry = getOmniPluginManager().registry.get(pluginId);
    const issues: string[] = [];
    if (!entry) issues.push("Plugin not registered");
    if (this.disabled.has(pluginId)) issues.push("Plugin disabled");
    const vm = getVersionManager();
    if (entry?.minOmniVersion && vm.compare("12.0.0", entry.minOmniVersion) < 0) {
      issues.push(`Requires platform ${entry.minOmniVersion}`);
    }
    return {
      pluginId,
      healthy: issues.length === 0,
      issues,
      lastCheck: new Date().toISOString(),
    };
  }

  async migrate(pluginId: string, targetVersion: string) {
    const hist = this.versionHistory.get(pluginId)?.find((h) => h.version === targetVersion);
    if (!hist) return { ok: false, error: "Target version not in history" };
    return this.update(hist);
  }

  private emit(event: string, pluginId: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`omnimind:marketplace-${event}`, { detail: { pluginId } }));
    }
  }
}

let lifecycle: MarketplaceLifecycle | null = null;

export function getMarketplaceLifecycle(): MarketplaceLifecycle {
  if (!lifecycle) lifecycle = new MarketplaceLifecycle();
  return lifecycle;
}
