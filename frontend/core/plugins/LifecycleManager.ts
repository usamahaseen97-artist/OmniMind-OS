import type { OmniPluginManifest, PluginLifecycleState, RegisteredPlugin } from "./types";
import type { PluginRegistry } from "./PluginRegistry";
import { getPluginEventBus } from "./EventBus";

export type LifecycleHooks = {
  onInstall?: (manifest: OmniPluginManifest) => void | Promise<void>;
  onLoad?: (manifest: OmniPluginManifest) => void | Promise<void>;
  onActivate?: (manifest: OmniPluginManifest) => void | Promise<void>;
  onSuspend?: (manifest: OmniPluginManifest) => void | Promise<void>;
  onResume?: (manifest: OmniPluginManifest) => void | Promise<void>;
  onUnload?: (manifest: OmniPluginManifest) => void | Promise<void>;
  onUpgrade?: (prev: RegisteredPlugin, next: OmniPluginManifest) => void | Promise<void>;
  onRemove?: (manifest: OmniPluginManifest) => void | Promise<void>;
};

/** Install → Load → Activate → Suspend/Resume → Unload → Upgrade → Remove */
export class LifecycleManager {
  private hooks: LifecycleHooks = {};

  constructor(private registry: PluginRegistry) {}

  setHooks(hooks: LifecycleHooks) {
    this.hooks = { ...this.hooks, ...hooks };
  }

  private setState(pluginId: string, lifecycle: PluginLifecycleState) {
    const activatedAt = lifecycle === "active" ? new Date().toISOString() : undefined;
    this.registry.updateLifecycle(pluginId, lifecycle, activatedAt);
  }

  async install(manifest: OmniPluginManifest) {
    const existing = this.registry.get(manifest.id);
    if (existing) {
      await this.upgrade(existing, manifest);
      return;
    }
    this.registry.register(manifest, "installed");
    await this.hooks.onInstall?.(manifest);
    this.setState(manifest.id, "installed");
    getPluginEventBus().publish("PluginInstalled", { pluginId: manifest.id, version: manifest.version });
  }

  async load(manifest: OmniPluginManifest) {
    await this.hooks.onLoad?.(manifest);
    this.setState(manifest.id, "loaded");
  }

  async activate(manifest: OmniPluginManifest) {
    await this.hooks.onActivate?.(manifest);
    this.setState(manifest.id, "active");
    getPluginEventBus().publish("PluginActivated", { pluginId: manifest.id });
  }

  async suspend(pluginId: string) {
    const entry = this.registry.get(pluginId);
    if (!entry) return;
    await this.hooks.onSuspend?.(entry);
    this.setState(pluginId, "suspended");
  }

  async resume(pluginId: string) {
    const entry = this.registry.get(pluginId);
    if (!entry) return;
    await this.hooks.onResume?.(entry);
    this.setState(pluginId, "active");
  }

  async unload(pluginId: string) {
    const entry = this.registry.get(pluginId);
    if (!entry) return;
    await this.hooks.onUnload?.(entry);
    this.setState(pluginId, "unloaded");
  }

  async upgrade(prev: RegisteredPlugin, next: OmniPluginManifest) {
    await this.hooks.onUpgrade?.(prev, next);
    this.registry.register(next, prev.lifecycle === "active" ? "active" : "installed");
  }

  async remove(pluginId: string) {
    const entry = this.registry.get(pluginId);
    if (!entry) return;
    await this.hooks.onUnload?.(entry);
    await this.hooks.onRemove?.(entry);
    this.registry.remove(pluginId);
    getPluginEventBus().publish("PluginRemoved", { pluginId });
  }
}
