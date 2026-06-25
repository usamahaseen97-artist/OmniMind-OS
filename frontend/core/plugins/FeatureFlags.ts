import type { PluginFeatureFlagMode, PluginFeatureFlags } from "./types";

const GLOBAL_MODE_KEY = "omnimind_plugin_feature_mode";

export type OmniMindRuntimeMode = "standard" | "developer" | "enterprise" | "beta";

/** Feature flags for experimental and enterprise capabilities. */
export class FeatureFlags {
  private pluginFlags = new Map<string, PluginFeatureFlags>();
  private runtimeMode: OmniMindRuntimeMode = "standard";

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(GLOBAL_MODE_KEY) as OmniMindRuntimeMode | null;
      if (stored) this.runtimeMode = stored;
    }
  }

  setRuntimeMode(mode: OmniMindRuntimeMode) {
    this.runtimeMode = mode;
    if (typeof window !== "undefined") localStorage.setItem(GLOBAL_MODE_KEY, mode);
  }

  getRuntimeMode() {
    return this.runtimeMode;
  }

  register(pluginId: string, flags: PluginFeatureFlags = {}) {
    this.pluginFlags.set(pluginId, flags);
  }

  unregister(pluginId: string) {
    this.pluginFlags.delete(pluginId);
  }

  isEnabled(pluginId: string, feature: string): boolean {
    const flags = this.pluginFlags.get(pluginId);
    const mode = flags?.[feature] ?? "enabled";

    if (mode === "disabled") return false;
    if (mode === "beta" && this.runtimeMode === "standard") return false;
    if (mode === "developer" && this.runtimeMode !== "developer") return false;
    if (mode === "enterprise" && this.runtimeMode !== "enterprise") return false;
    return true;
  }

  setFlag(pluginId: string, feature: string, mode: PluginFeatureFlagMode) {
    const current = this.pluginFlags.get(pluginId) ?? {};
    this.pluginFlags.set(pluginId, { ...current, [feature]: mode });
  }
}

let flags: FeatureFlags | null = null;

export function getFeatureFlags(): FeatureFlags {
  if (!flags) flags = new FeatureFlags();
  return flags;
}
