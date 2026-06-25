import type { OmniPlatformPlugin } from "./types";
import { omniPluginPermissions } from "./OmniPluginPermissions";
import { omniPluginRegistry } from "./OmniPluginRegistry";

/** Installed plugin lifecycle — enable, disable, configure. */
export class OmniPlatformPluginManager {
  enable(id: string) {
    const p = omniPluginRegistry.get(id);
    if (p) p.enabled = true;
    return p;
  }

  disable(id: string) {
    const p = omniPluginRegistry.get(id);
    if (p) p.enabled = false;
    return p;
  }

  installed() {
    return omniPluginRegistry.list();
  }

  active() {
    return omniPluginRegistry.list({ enabled: true });
  }

  configure(id: string, patch: Partial<OmniPlatformPlugin>) {
    const p = omniPluginRegistry.get(id);
    if (!p) return null;
    Object.assign(p, patch);
    return p;
  }

  requestPermissions(id: string) {
    const p = omniPluginRegistry.get(id);
    if (!p) return [];
    return omniPluginPermissions.request(id, p.permissions);
  }
}

export const omniPlatformPluginManager = new OmniPlatformPluginManager();
