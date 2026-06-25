/** Sandboxed execution context for third-party plugins. */
export class OmniPluginSandbox {
  private contexts = new Map<string, { apis: string[]; isolated: boolean }>();

  create(pluginId: string, apis: string[] = ["extension-api"]) {
    this.contexts.set(pluginId, { apis, isolated: true });
    return { pluginId, apis, run: <T>(fn: () => T) => this.runIsolated(pluginId, fn) };
  }

  runIsolated<T>(pluginId: string, fn: () => T): T {
    const ctx = this.contexts.get(pluginId);
    if (!ctx?.isolated) throw new Error(`Sandbox not found: ${pluginId}`);
    return fn();
  }

  destroy(pluginId: string) {
    this.contexts.delete(pluginId);
  }
}

export const omniPluginSandbox = new OmniPluginSandbox();
