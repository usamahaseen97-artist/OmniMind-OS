import type { WorkspaceToolContext } from "../types";

const TOOL_CONTEXT_HINTS: Record<string, WorkspaceToolContext> = {
  "omniforge-engine": {
    toolId: "omniforge-engine",
    summary: "Software engineering workspace with live scaffold, database, and deploy.",
    hints: ["Current database schema", "Target stack selection", "Recent generated files", "Architect plan approval state"],
  },
  "app-website-builder": {
    toolId: "app-website-builder",
    summary: "Full-stack web application builder.",
    hints: ["Frontend framework", "API routes", "Preview device"],
  },
  "business-website-builder": {
    toolId: "business-website-builder",
    summary: "E-commerce and business landing pages.",
    hints: ["Brand context", "Product catalog", "Checkout flow"],
  },
  "business-analytics": {
    toolId: "business-analytics",
    summary: "BI dashboards and spreadsheet analytics.",
    hints: ["Current project metrics", "Uploaded datasets", "Pinned KPIs", "Enterprise ingestion report", "AI insights & forecasts"],
  },
  "medical-diagnostic": {
    toolId: "medical-diagnostic",
    summary: "Medical imaging and report analysis.",
    hints: ["Uploaded scans", "Patient report context", "Prior triage results"],
  },
  "vfx-master": {
    toolId: "vfx-master",
    summary: "Video editing and VFX timeline.",
    hints: ["Uploaded assets", "Timeline state", "Export format"],
  },
  "creative-visionary": {
    toolId: "creative-visionary",
    summary: "Image and video generation.",
    hints: ["Style references", "Brand palette", "Aspect ratio"],
  },
  "architectural-designer": {
    toolId: "architectural-designer",
    summary: "Architectural visualization and floor plans.",
    hints: ["Site dimensions", "Room count", "Style preferences"],
  },
  omnimusic: {
    toolId: "omnimusic",
    summary: "Music composition and audio production.",
    hints: ["Genre", "Tempo", "Instrument selection"],
  },
  omnitranslator: {
    toolId: "omnitranslator",
    summary: "Translation and bilingual meetings.",
    hints: ["Source language", "Target language", "Meeting transcript"],
  },
  "nasa-solver": {
    toolId: "nasa-solver",
    summary: "Science and aerospace problem solving.",
    hints: ["Equation context", "Units", "Reference data"],
  },
  "quantum-trading": {
    toolId: "quantum-trading",
    summary: "Trading signals and market analysis.",
    hints: ["Asset pair", "Risk profile", "Timeframe"],
  },
  "digital-marketing-hub": {
    toolId: "digital-marketing-hub",
    summary: "Campaigns, copy, and social content.",
    hints: ["Brand voice", "Campaign goal", "Audience"],
  },
};

/** Injects per-tool workspace context automatically. */
export class WorkspaceIntelligence {
  resolve(toolId: string, globalContext: string): WorkspaceToolContext {
    const base = TOOL_CONTEXT_HINTS[toolId] ?? {
      toolId,
      summary: `Sovereign tool: ${toolId}`,
      hints: ["User prompt", "Pinned notes", "Recent tasks"],
    };

    return {
      ...base,
      summary: `${base.summary}\n\n${globalContext}`.trim(),
    };
  }

  injectEvent(toolId: string, context: WorkspaceToolContext) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("omnimind:brain-workspace-context", {
        detail: { toolId, context },
      }),
    );
  }
}
