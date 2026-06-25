import type { AutomationPlugin } from "./types";

export class PluginRegistryEngine {
  install(plugins: AutomationPlugin[], id: string): AutomationPlugin[] {
    return plugins.map((p) => (p.id === id ? { ...p, installed: true } : p));
  }

  listMarketplace(): AutomationPlugin[] {
    return [
      { id: "plug-zap", name: "Zapier Bridge", version: "1.0", category: "official", installed: false, sdkReady: true },
      { id: "plug-social", name: "Social Auto-Pack", version: "2.1", category: "premium", installed: false, sdkReady: true },
      { id: "plug-community", name: "Community Workflow Pack", version: "0.9", category: "community", installed: false, sdkReady: true },
    ];
  }
}

export const pluginRegistryEngine = new PluginRegistryEngine();
