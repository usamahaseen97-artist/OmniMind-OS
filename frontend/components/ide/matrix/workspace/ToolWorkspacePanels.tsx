"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { ArchitectBottomChat } from "../../../architect/ArchitectBottomChat";
import { OmniChatShell } from "../../../chat/OmniChatShell";
import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { OmniTranslatorPanel } from "../../../tools/panels/OmniTranslatorPanel";

const GUEST = "guest-founder";
const ASSETS = ["🚪", "🪴", "🛋️", "🏊", "🪟", "🧱"];

export function ToolWorkspaceDesign({ mode }: { mode: "exterior" | "interior" }) {
  const [suggestion, setSuggestion] = useState("Add courtyard · accent walls");

  return (
    <div className="flex h-full flex-col">
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <section className="omni-card mb-3 rounded-xl border p-4" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider omni-accent-text">STEP 1 — ANALYZE</p>
          <p className="text-[11px]" style={{ color: "var(--omni-text-muted)" }}>
            Describe your {mode === "exterior" ? "exterior" : "interior"} vision. Drag assets onto the live canvas.
          </p>
        </section>
        <section className="omni-card mb-3 rounded-xl border p-4" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider omni-accent-text">Asset dock</p>
          <div className="flex flex-wrap gap-2">
            {ASSETS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setSuggestion(`Placed ${a} on canvas`)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border text-base transition hover:scale-105"
                style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel-alt)" }}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px]" style={{ color: "var(--omni-text-muted)" }}>{suggestion}</p>
        </section>
      </div>
      <WorkspaceFooter routeId="architectural-designer" />
    </div>
  );
}

function WorkspaceFooter({ routeId }: { routeId: string }) {
  return (
    <footer className="shrink-0 border-t px-4 py-3" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
      <button
        type="button"
        className="omni-deploy-btn mb-3 flex w-full items-center justify-center gap-3 rounded-lg py-3.5 text-xs font-bold uppercase tracking-[0.12em]"
      >
        <Rocket className="h-5 w-5" />
        Deploy to Staging
      </button>
      <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}>
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--omni-text-muted)" }}>
          OmniMind V11 · General Chatbot
        </p>
        <ArchitectBottomChat routeId={routeId} userId={GUEST} onUserMessage={() => {}} onAssistantComplete={() => {}} />
      </div>
    </footer>
  );
}

export function ToolWorkspaceMedical() {
  return (
    <div className="flex h-full flex-col">
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {["STEP 1 — ANALYZE", "STEP 2 — FRONTEND SETUP", "STEP 3 — PRODUCTION READY"].map((step, i) => (
          <section
            key={step}
            className="omni-card mb-3 rounded-xl border p-4"
            style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider omni-accent-text">{step}</p>
            <p className="text-[11px]" style={{ color: "var(--omni-text-muted)" }}>
              {i === 0 && "Upload labs, PDF reports, or camera capture for AI vision analysis."}
              {i === 1 && "Map vitals: WBC, glucose, calcium, fracture indicators."}
              {i === 2 && "Generate diagnostic summary with clinical norm comparisons."}
            </p>
          </section>
        ))}
      </div>
      <WorkspaceFooter routeId="medical-diagnostic" />
    </div>
  );
}

export function ToolWorkspaceTrading() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 p-2">
        <OmniChatShell routeId="quantum-trading" userId={GUEST} showDashboardTools />
      </div>
      <WorkspaceFooter routeId="quantum-trading" />
    </div>
  );
}

export function ToolWorkspaceVideo() {
  return (
    <div className="flex h-full flex-col">
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <section className="omni-card rounded-xl border p-4" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
          <p className="mb-2 text-[10px] font-bold uppercase omni-accent-text">Voice tone · script sliders</p>
          <input type="range" className="mb-2 w-full accent-[var(--omni-accent)]" />
          <input type="range" className="w-full accent-[var(--omni-accent)]" />
        </section>
      </div>
      <WorkspaceFooter routeId="creative-visionary" />
    </div>
  );
}

export function ToolWorkspaceAnalytics() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 p-2">
        <OmniChatShell routeId="business-analytics" userId={GUEST} showDashboardTools />
      </div>
      <div className="flex gap-2 border-t px-4 py-2" style={{ borderColor: "var(--omni-border)" }}>
        {["Export to Excel", "Export Word Summary"].map((l) => (
          <button key={l} type="button" className="rounded border px-2 py-1 text-[9px] omni-accent-text" style={{ borderColor: "var(--omni-border)" }}>
            {l}
          </button>
        ))}
      </div>
      <WorkspaceFooter routeId="business-analytics" />
    </div>
  );
}

export function ToolWorkspaceVfx() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 p-2">
        <OmniChatShell routeId="vfx-master" userId={GUEST} showDashboardTools />
      </div>
      <WorkspaceFooter routeId="vfx-master" />
    </div>
  );
}

export function ToolWorkspaceScience() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 p-2">
        <OmniChatShell routeId="nasa-science-solver" userId={GUEST} showDashboardTools />
      </div>
      <WorkspaceFooter routeId="nasa-science-solver" />
    </div>
  );
}

export function ToolWorkspaceGeneric({ tool }: { tool: SovereignToolDef }) {
  if (tool.slug === "omnitranslator") {
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <OmniTranslatorPanel tool={tool} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {tool.omniRouteId ? (
        <div className="min-h-0 flex-1 p-2">
          <OmniChatShell routeId={tool.omniRouteId} userId={GUEST} showDashboardTools />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-[11px]" style={{ color: "var(--omni-text-muted)" }}>
          {tool.name} workspace
        </div>
      )}
      <WorkspaceFooter routeId={tool.omniRouteId ?? "app-and-develop"} />
    </div>
  );
}
