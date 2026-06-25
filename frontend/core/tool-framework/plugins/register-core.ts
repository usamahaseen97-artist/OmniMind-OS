import { BarChart3 } from "lucide-react";
import type { ToolPluginManifest } from "../types";
import { installToolPlugin } from "../plugin-loader";

/** Example: future tools register via a single manifest file. */
const enterpriseAnalyticsPlugin: ToolPluginManifest = {
  id: "enterprise-analytics-extension",
  name: "Enterprise Analytics Extension",
  version: "1.0.0",
  description: "Extends business-analytics with enterprise capabilities metadata.",
  register: (api) => {
    api.registerTool({
      toolId: "business-analytics",
      title: "Business Analytics",
      description: "Enterprise ingestion, NL analytics, forecasting, and advisor.",
      icon: BarChart3,
      category: "analytics",
      capabilities: ["ingestion", "cleaning", "forecast", "nl-query", "dashboard", "export"],
      acceptedInputs: ["csv", "xlsx", "json", "prompt", "api-feed"],
      generatedOutputs: ["dashboard", "report", "forecast", "insight"],
      supportedActions: [
        { id: "ingest", label: "Ingest dataset", permission: "write" },
        { id: "forecast", label: "Run forecast", permission: "execute" },
        { id: "export", label: "Export report", permission: "write" },
      ],
      permissions: ["read", "write", "execute"],
      keyboardShortcuts: [
        { keys: "Ctrl+I", actionId: "ingest", label: "Ingest" },
        { keys: "Ctrl+E", actionId: "export", label: "Export" },
      ],
      aiPrompts: [
        { id: "nl-query", label: "Ask data", template: "Answer this question using the current dataset:" },
        { id: "forecast", label: "Forecast", template: "Forecast the next 90 days from current metrics." },
      ],
      href: "/tools/business-analytics",
      routeId: "business-analytics",
      pluginId: "enterprise-analytics-extension",
    });
  },
};

let registered = false;

export function registerCoreToolPlugins() {
  if (registered) return;
  installToolPlugin(enterpriseAnalyticsPlugin);
  registered = true;
}
