import type { ComplianceFramework, CompliancePlugin } from "../types";

const DEFAULT_PLUGINS: Omit<CompliancePlugin, "id">[] = [
  {
    framework: "hipaa",
    name: "HIPAA Security & Privacy Controls",
    version: "2024-arch",
    controls: [
      { id: "hipaa-access", label: "Access controls", status: "configured" },
      { id: "hipaa-audit", label: "Audit controls", status: "configured" },
      { id: "hipaa-encrypt", label: "Encryption", status: "configured" },
      { id: "hipaa-baa", label: "Business associate agreements", status: "not-configured" },
    ],
    enabled: true,
  },
  {
    framework: "gdpr",
    name: "GDPR Data Protection",
    version: "2024-arch",
    region: "EU",
    controls: [
      { id: "gdpr-consent", label: "Consent management", status: "configured" },
      { id: "gdpr-erasure", label: "Right to erasure", status: "partial" },
      { id: "gdpr-portability", label: "Data portability", status: "partial" },
    ],
    enabled: true,
  },
  {
    framework: "iso-27001",
    name: "ISO 27001 ISMS",
    version: "2022-arch",
    controls: [
      { id: "iso-risk", label: "Risk assessment", status: "configured" },
      { id: "iso-incident", label: "Incident management", status: "partial" },
    ],
    enabled: true,
  },
  {
    framework: "soc-2",
    name: "SOC 2 Trust Principles",
    version: "2024-arch",
    controls: [
      { id: "soc-security", label: "Security", status: "configured" },
      { id: "soc-availability", label: "Availability", status: "partial" },
    ],
    enabled: false,
  },
];

/** Configurable compliance framework — not certification claims */
export class ComplianceFrameworkEngine {
  private plugins = new Map<string, CompliancePlugin>();

  constructor() {
    for (const p of DEFAULT_PLUGINS) {
      const plugin: CompliancePlugin = { ...p, id: `compliance-${p.framework}` };
      this.plugins.set(plugin.id, plugin);
    }
  }

  list() {
    return [...this.plugins.values()];
  }

  get(framework: ComplianceFramework) {
    return [...this.plugins.values()].find((p) => p.framework === framework);
  }

  registerRegionalPlugin(plugin: CompliancePlugin) {
    this.plugins.set(plugin.id, plugin);
    return plugin;
  }

  updateControlStatus(pluginId: string, controlId: string, status: "configured" | "partial" | "not-configured") {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error("Plugin not found");
    const control = plugin.controls.find((c) => c.id === controlId);
    if (!control) throw new Error("Control not found");
    control.status = status;
    return plugin;
  }

  getComplianceSummary() {
    const plugins = this.list().filter((p) => p.enabled);
    const total = plugins.reduce((s, p) => s + p.controls.length, 0);
    const configured = plugins.reduce((s, p) => s + p.controls.filter((c) => c.status === "configured").length, 0);
    return { frameworks: plugins.length, controlsTotal: total, controlsConfigured: configured, percent: total ? Math.round((configured / total) * 100) : 0 };
  }
}

let engine: ComplianceFrameworkEngine | null = null;

export function getComplianceFrameworkEngine() {
  if (!engine) engine = new ComplianceFrameworkEngine();
  return engine;
}
