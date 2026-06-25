import type { OmniSetting, OmniToolSlug, SettingsScope } from "./types";

/** Global / per-tool / per-workspace settings — cloud sync ready. */
export class OmniSettings {
  private store: OmniSetting[] = [
    { key: "telemetry.enabled", scope: "global", toolSlug: null, value: false, cloudSync: true },
    { key: "editor.fontSize", scope: "global", toolSlug: null, value: 13, cloudSync: true },
    { key: "workspace.autoSave", scope: "workspace", toolSlug: null, value: true, cloudSync: true },
    { key: "workspace.autoRestore", scope: "workspace", toolSlug: null, value: true, cloudSync: true },
    { key: "ai.defaultAgent", scope: "global", toolSlug: null, value: "developer-agent", cloudSync: true },
    { key: "ai.rememberStyle", scope: "global", toolSlug: null, value: true, cloudSync: true },
    { key: "theme.id", scope: "global", toolSlug: null, value: "omnimind-dark", cloudSync: true },
    { key: "performance.lazyLoad", scope: "global", toolSlug: null, value: true, cloudSync: true },
    { key: "security.zeroTrust", scope: "global", toolSlug: null, value: true, cloudSync: false },
    { key: "notifications.enabled", scope: "global", toolSlug: null, value: true, cloudSync: true },
    { key: "cloud.syncEnabled", scope: "global", toolSlug: null, value: true, cloudSync: true },
    { key: "locale.id", scope: "global", toolSlug: null, value: "en", cloudSync: true },
  ];

  get(key: string, scope: SettingsScope = "global", toolSlug: OmniToolSlug | null = null) {
    return this.store.find(
      (s) => s.key === key && s.scope === scope && s.toolSlug === toolSlug,
    ) ?? null;
  }

  value<T>(key: string, fallback: T, scope: SettingsScope = "global", toolSlug: OmniToolSlug | null = null): T {
    const setting = this.get(key, scope, toolSlug);
    return (setting?.value as T | undefined) ?? fallback;
  }

  set(key: string, value: unknown, scope: SettingsScope = "global", toolSlug: OmniToolSlug | null = null, cloudSync = false) {
    const existing = this.get(key, scope, toolSlug);
    if (existing) {
      existing.value = value;
      existing.cloudSync = cloudSync;
      return existing;
    }
    const setting: OmniSetting = { key, scope, toolSlug, value, cloudSync };
    this.store.push(setting);
    return setting;
  }

  list(scope?: SettingsScope, toolSlug?: OmniToolSlug | null) {
    return this.store.filter((s) => {
      if (scope && s.scope !== scope) return false;
      if (toolSlug !== undefined && s.toolSlug !== toolSlug) return false;
      return true;
    });
  }

  export() {
    return JSON.stringify(this.store, null, 2);
  }

  import(json: string) {
    const parsed = JSON.parse(json) as OmniSetting[];
    this.store = parsed;
    return this.store;
  }

  reset(scope?: SettingsScope) {
    if (!scope) {
      this.store = [];
      return;
    }
    this.store = this.store.filter((s) => s.scope !== scope);
  }
}

export const omniSettings = new OmniSettings();
