import { omniPluginPermissions } from "../plugins/omnicore-platform/OmniPluginPermissions";
import type { PluginSecurityManifest } from "./types";

/** OmniPluginSecurityGate — sandbox, signing, capability-based plugin access. */
export class OmniPluginSecurityGate {
  manifests = new Map<string, PluginSecurityManifest>();

  registerManifest(manifest: PluginSecurityManifest) {
    this.manifests.set(manifest.pluginId, manifest);
    return manifest;
  }

  verifySignature(pluginId: string) {
    const m = this.manifests.get(pluginId);
    return m?.signed ?? false;
  }

  canLoad(pluginId: string) {
    const m = this.manifests.get(pluginId);
    if (!m) return { allowed: false, reason: "manifest_missing" };
    if (!m.signed) return { allowed: false, reason: "unsigned_plugin" };
    return { allowed: true, reason: "verified", sandboxLevel: m.sandboxLevel };
  }

  requestCapability(pluginId: string, capability: string) {
    const m = this.manifests.get(pluginId);
    if (!m?.capabilities.includes(capability)) {
      return { granted: false, reason: "capability_not_declared" };
    }
    const granted = omniPluginPermissions.check(
      pluginId,
      capability as import("../plugins/omnicore-platform/types").OmniPluginPermission,
    );
    return { granted, reason: granted ? "user_granted" : "permission_denied" };
  }

  sandboxPolicy(level: PluginSecurityManifest["sandboxLevel"]) {
    return {
      strict: { network: false, filesystem: "read-only", ai: false },
      standard: { network: "allowlist", filesystem: "scoped", ai: "scoped" },
      trusted: { network: true, filesystem: "scoped", ai: true },
    }[level];
  }
}

export const omniPluginSecurityGate = new OmniPluginSecurityGate();
