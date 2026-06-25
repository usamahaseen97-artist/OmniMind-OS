import type { DawPlugin, PluginFormat } from "./types";

export class PluginManagerEngine {
  scan(plugins: DawPlugin[]): DawPlugin[] {
    return plugins.map((p) => ({ ...p, scanned: true }));
  }

  install(plugins: DawPlugin[], id: string): DawPlugin[] {
    return plugins.map((p) => (p.id === id ? { ...p, installed: true, scanned: true } : p));
  }

  seedInternal(): DawPlugin[] {
    return [
      { id: "pl-eq", name: "Omni EQ", vendor: "OmniMind", format: "internal", category: "EQ", installed: true, scanned: true },
      { id: "pl-comp", name: "Omni Compressor", vendor: "OmniMind", format: "internal", category: "Dynamics", installed: true, scanned: true },
      { id: "pl-rev", name: "Omni Reverb", vendor: "OmniMind", format: "internal", category: "Reverb", installed: true, scanned: true },
      { id: "pl-vst-placeholder", name: "VST Plugin (placeholder)", vendor: "External", format: "vst", category: "FX", installed: false, scanned: false },
      { id: "pl-au-placeholder", name: "AU Plugin (placeholder)", vendor: "External", format: "au", category: "FX", installed: false, scanned: false },
    ];
  }
}

export const pluginManagerEngine = new PluginManagerEngine();
