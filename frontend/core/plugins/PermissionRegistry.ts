import type { PermissionRequestRecord, PluginPermissionScope, PluginPermissionState } from "./types";
import { getPluginEventBus } from "./EventBus";

/** Plugin-declared permissions with user approval flow. */
export class PermissionRegistry {
  private grants = new Map<string, PluginPermissionState>();
  private pending: PermissionRequestRecord[] = [];
  private listeners = new Set<(req: PermissionRequestRecord) => void>();

  private key(pluginId: string, scope: PluginPermissionScope) {
    return `${pluginId}:${scope}`;
  }

  declare(pluginId: string, scopes: PluginPermissionScope[]) {
    for (const scope of scopes) {
      if (!this.grants.has(this.key(pluginId, scope))) {
        this.grants.set(this.key(pluginId, scope), "pending");
      }
    }
  }

  unregister(pluginId: string) {
    for (const key of [...this.grants.keys()]) {
      if (key.startsWith(`${pluginId}:`)) this.grants.delete(key);
    }
  }

  getState(pluginId: string, scope: PluginPermissionScope): PluginPermissionState {
    return this.grants.get(this.key(pluginId, scope)) ?? "pending";
  }

  subscribe(listener: (req: PermissionRequestRecord) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async request(pluginId: string, scope: PluginPermissionScope, reason: string): Promise<boolean> {
    const existing = this.getState(pluginId, scope);
    if (existing === "granted") return true;
    if (existing === "denied") return false;

    return new Promise((resolve) => {
      const record: PermissionRequestRecord = {
        id: `pperm-${Date.now()}`,
        pluginId,
        scope,
        reason,
        state: "pending",
        createdAt: new Date().toISOString(),
        resolve,
      };
      this.pending.push(record);
      getPluginEventBus().publish("PermissionRequested", { pluginId, scope });
      for (const l of this.listeners) l(record);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("omnimind:plugin-permission", { detail: record }));
      }
    });
  }

  respond(requestId: string, granted: boolean) {
    const req = this.pending.find((p) => p.id === requestId);
    if (!req) return;
    const state: PluginPermissionState = granted ? "granted" : "denied";
    this.grants.set(this.key(req.pluginId, req.scope), state);
    req.resolve?.(granted);
    this.pending = this.pending.filter((p) => p.id !== requestId);
    getPluginEventBus().publish("PermissionResolved", {
      pluginId: req.pluginId,
      scope: req.scope,
      granted,
    });
  }

  listPending(): PermissionRequestRecord[] {
    return [...this.pending];
  }
}

let registry: PermissionRegistry | null = null;

export function getPermissionRegistry(): PermissionRegistry {
  if (!registry) registry = new PermissionRegistry();
  return registry;
}
