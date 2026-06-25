import type { PluginAnalytics, PluginDiagnostic } from "./types";

/** Plugin diagnostics and analytics. */
export class OmniPluginDiagnostics {
  logs: PluginDiagnostic[] = [];
  analytics = new Map<string, PluginAnalytics>();

  log(pluginId: string, level: PluginDiagnostic["level"], message: string) {
    const entry: PluginDiagnostic = {
      pluginId,
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(entry);
    if (this.logs.length > 300) this.logs.length = 300;
    return entry;
  }

  track(pluginId: string, event: "activation" | "error", latencyMs = 0) {
    const cur = this.analytics.get(pluginId) ?? { pluginId, activations: 0, errors: 0, avgLatencyMs: 0 };
    if (event === "activation") {
      cur.activations += 1;
      cur.avgLatencyMs = (cur.avgLatencyMs + latencyMs) / 2;
    } else cur.errors += 1;
    this.analytics.set(pluginId, cur);
    return cur;
  }

  forPlugin(pluginId: string) {
    return {
      logs: this.logs.filter((l) => l.pluginId === pluginId),
      analytics: this.analytics.get(pluginId) ?? null,
    };
  }
}

export const omniPluginDiagnostics = new OmniPluginDiagnostics();
