import { getActionRegistry } from "./ActionRegistry";
import { syncPluginToRegistries } from "./adapters";
import { getCapabilityRegistry } from "./CapabilityRegistry";
import { DependencyResolver } from "./DependencyResolver";
import { getPluginEventBus } from "./EventBus";
import { getFeatureFlags } from "./FeatureFlags";
import { LifecycleManager } from "./LifecycleManager";
import { getPermissionRegistry } from "./PermissionRegistry";
import { getPluginRegistry } from "./PluginRegistry";
import type {
  ActionExecutionContext,
  ActionExecutionResult,
  CapabilityMatch,
  OmniPluginManifest,
  RegisteredPlugin,
} from "./types";
import { getVersionManager, OMNI_MIND_PLATFORM_VERSION } from "./VersionManager";

/**
 * Universal Plugin Manager — single entry for install, discovery, and execution.
 * Bridges Agent ToolRegistry, Universal Tool Framework, and OmniMind Brain.
 */
export class OmniPluginManager {
  readonly registry = getPluginRegistry();
  readonly capabilities = getCapabilityRegistry();
  readonly actions = getActionRegistry();
  readonly permissions = getPermissionRegistry();
  readonly features = getFeatureFlags();
  readonly events = getPluginEventBus();
  readonly lifecycle: LifecycleManager;
  private dependencyResolver: DependencyResolver;
  private booted = false;

  constructor() {
    this.lifecycle = new LifecycleManager(this.registry);
    this.dependencyResolver = new DependencyResolver((id) => this.registry.get(id)?.version);
    this.lifecycle.setHooks({
      onLoad: (m) => this.registerSubsystems(m),
      onActivate: (m) => syncPluginToRegistries(m),
      onUnload: (m) => this.unregisterSubsystems(m),
      onRemove: (m) => this.unregisterSubsystems(m),
    });
  }

  private registerSubsystems(manifest: OmniPluginManifest) {
    this.capabilities.register(manifest.id, manifest.toolId, manifest.capabilities);
    this.actions.register(manifest.id, manifest.toolId, manifest.actions);
    this.permissions.declare(manifest.id, manifest.permissions);
    if (manifest.featureFlags) this.features.register(manifest.id, manifest.featureFlags);
  }

  private unregisterSubsystems(manifest: OmniPluginManifest) {
    this.capabilities.unregister(manifest.id);
    this.actions.unregister(manifest.id);
    this.permissions.unregister(manifest.id);
    this.features.unregister(manifest.id);
  }

  async install(manifest: OmniPluginManifest): Promise<{ ok: boolean; error?: string }> {
    const vm = getVersionManager();
    if (manifest.minOmniVersion && vm.compare(OMNI_MIND_PLATFORM_VERSION, manifest.minOmniVersion) < 0) {
      return { ok: false, error: `Requires OmniMind ${manifest.minOmniVersion}+` };
    }

    const installedIds = new Set(this.registry.list().map((p) => p.id));
    const deps = this.dependencyResolver.resolve(manifest, installedIds);
    if (!deps.ok) {
      return { ok: false, error: `Missing dependencies: ${deps.missing.map((d) => d.pluginId).join(", ")}` };
    }

    await this.lifecycle.install(manifest);
    await this.lifecycle.load(manifest);
    await this.lifecycle.activate(manifest);
    return { ok: true };
  }

  async uninstall(pluginId: string) {
    await this.lifecycle.remove(pluginId);
  }

  async suspend(pluginId: string) {
    await this.lifecycle.suspend(pluginId);
  }

  async resume(pluginId: string) {
    await this.lifecycle.resume(pluginId);
  }

  get(pluginId: string): RegisteredPlugin | undefined {
    return this.registry.get(pluginId);
  }

  getByToolId(toolId: string): RegisteredPlugin | undefined {
    return this.registry.getByToolId(toolId);
  }

  list(): RegisteredPlugin[] {
    return this.registry.list();
  }

  listActive(): RegisteredPlugin[] {
    return this.registry.listActive();
  }

  /** Capability-first discovery for Brain intent resolution. */
  matchCapabilities(text: string): CapabilityMatch[] {
    return this.capabilities.matchIntent(text);
  }

  bestCapabilityMatch(text: string): CapabilityMatch | null {
    return this.capabilities.bestMatch(text);
  }

  async executeAction(ctx: ActionExecutionContext): Promise<ActionExecutionResult> {
    const plugin = this.registry.get(ctx.pluginId);
    if (!plugin) return { ok: false, error: "Plugin not found", events: [] };

    const action = this.actions.get(ctx.pluginId, ctx.actionId);
    if (action?.permission) {
      const granted = await this.permissions.request(
        ctx.pluginId,
        action.permission,
        `Action "${action.label}" requires ${action.permission}`,
      );
      if (!granted) return { ok: false, error: "Permission denied", events: [] };
    }

    if (action?.capability && !this.features.isEnabled(ctx.pluginId, action.capability)) {
      return { ok: false, error: `Capability ${action.capability} is disabled`, events: [] };
    }

    return this.actions.execute(ctx);
  }

  markBooted() {
    this.booted = true;
  }

  isBooted() {
    return this.booted;
  }
}

let manager: OmniPluginManager | null = null;

export function getOmniPluginManager(): OmniPluginManager {
  if (!manager) manager = new OmniPluginManager();
  return manager;
}
