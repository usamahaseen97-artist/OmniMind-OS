"use client";

import { useState, useEffect, type ReactNode } from "react";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { getSovereignTool, type SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { useWorkbenchLive, type WorkbenchMarketingSlot, pushWorkbenchDesignPrompt } from "../../../lib/workbench-live-store";
import { useHorizontalResize } from "../../../hooks/useHorizontalResize";
import { PanelResizeHandle } from "../../architect/PanelResizeHandle";
import {
  DynamicIDEBottomPanel,
  DynamicIDEMonacoWorkspace,
  DynamicIDERightPanel,
  DynamicToolLiveSimMatrix,
  DynamicToolWorkspaceMatrix,
} from "../dynamic-workbench-widgets";
import { AgentChatConsole } from "../workspace/AgentChatConsole";
import { useIDE } from "../IDEProvider";
import { IDEProjectFileTree } from "../IDEProjectFileTree";
import { DevicePreviewWrapper } from "../workspace/DevicePreviewWrapper";
import { IDEPane } from "../IDEPane";
import { isDevTrioSlug } from "../../../lib/dev-trio";
import { cn } from "../../../lib/utils";

const GUEST = "guest-founder";

function MarketingLiveSlots() {
  const live = useWorkbenchLive();
  const defaults: WorkbenchMarketingSlot[] = [
    { title: "Image Ad Layout" },
    { title: "Promo Video Clip" },
    { title: "Social Captions" },
  ];
  const slots = live.marketingSlots.length >= 3 ? live.marketingSlots : defaults;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-4 md:grid-cols-3">
      {slots.map((slot, i) => (
        <div
          key={slot.title}
          className="flex min-h-[140px] flex-col rounded-xl border p-3 omni-glow-sm"
          style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}
        >
          <p className="mb-2 text-[10px] font-semibold omni-accent-text">{slot.title}</p>
          <div
            className="min-h-0 flex-1 overflow-hidden rounded-lg border border-dashed"
            style={{ borderColor: "var(--omni-border)" }}
          >
            {slot.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : slot.videoUrl ? (
              <video src={slot.videoUrl} className="h-full w-full object-cover" controls muted />
            ) : slot.content ? (
              <p className="p-2 text-[9px] leading-relaxed" style={{ color: "var(--omni-text-muted)" }}>
                {slot.content}
              </p>
            ) : live.streaming ? (
              <div className="flex h-full items-center justify-center text-[9px] omni-accent-text animate-pulse">
                Generating asset {i + 1}/3…
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatPanel({ routeId, toolSlug }: { routeId: string; toolSlug?: string }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2">
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}
      >
        <AgentChatConsole routeId={routeId} toolSlug={(toolSlug ?? routeId) as SovereignToolSlug} />
      </div>
    </div>
  );
}

function PaneShell({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col border-r", className)} style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel-alt)" }}>
      <header className="shrink-0 border-b px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider omni-accent-text" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
        {title}
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

/** GROUP A — Full Cursor IDE (3 core dev tools) */
export function LayoutModuleA({ tool }: { tool: SovereignToolDef }) {
  const { mainView, setMainView, topTab, leftExplorerOpen, rightExplorerOpen } = useIDE();
  const codePanel = useHorizontalResize(280, 220, 520);
  const showEditor = mainView === "editor" || topTab === "review-code";
  const showCodeBot = rightExplorerOpen || topTab === "llm";

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {leftExplorerOpen ? (
        <aside className="flex w-48 shrink-0 flex-col border-r" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
          <IDEProjectFileTree />
        </aside>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 min-w-0 flex-[1.1]">
            <IDEPane title="Live Simulation & Output" subtitle="Hot reload preview" bodyClassName="p-0" badge={<span className="omni-live-badge rounded border px-2 py-0.5 text-[9px]">Live</span>}>
              {isDevTrioSlug(tool.slug) ? (
                <DevicePreviewWrapper className="h-full min-h-0">
                  <DynamicToolLiveSimMatrix tool={tool} />
                </DevicePreviewWrapper>
              ) : (
                <DynamicToolLiveSimMatrix tool={tool} />
              )}
            </IDEPane>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider omni-accent-text">
                {showEditor ? "Manual Editor" : "Architect Workspace · Step 1–3"}
              </p>
              {showEditor ? (
                <button type="button" onClick={() => setMainView("architect")} className="omni-accent-border rounded border px-2 py-0.5 text-[9px] omni-accent-text">
                  ← Workspace
                </button>
              ) : null}
            </header>
            <div className="min-h-0 flex-1 overflow-hidden">
              {showEditor ? <DynamicIDEMonacoWorkspace /> : <DynamicToolWorkspaceMatrix tool={tool} />}
            </div>
          </div>
          {showCodeBot ? (
            <>
              <PanelResizeHandle active={codePanel.isDragging} onPointerDown={codePanel.onPointerDown} onPointerMove={codePanel.onPointerMove} onPointerUp={codePanel.onPointerUp} />
              <div className="min-h-0 shrink-0 overflow-hidden" style={{ width: codePanel.width }}>
                <IDEPane title="Code Bot Agent" subtitle="Compact conversational drawer" bodyClassName="p-0">
                  <DynamicIDERightPanel />
                </IDEPane>
              </div>
            </>
          ) : null}
        </div>
        <DynamicIDEBottomPanel />
      </div>
    </div>
  );
}

/** GROUP B — Architectural / Interior 3D suite */
export function LayoutModuleB({ tool }: { tool: SovereignToolDef }) {
  const [prompt, setPrompt] = useState(
    "Design a 500yd dual-front luxury villa with 6 bedrooms and a central swimming pool",
  );
  const routeId = tool.omniRouteId ?? "architectural-designer";

  useEffect(() => {
    pushWorkbenchDesignPrompt(prompt);
  }, [prompt]);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PaneShell title="Design Prompt · NLP" className="w-[38%] max-w-md">
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            pushWorkbenchDesignPrompt(e.target.value);
          }}
          className="mb-3 h-28 w-full resize-none rounded-lg border bg-black/30 p-3 text-[11px] leading-relaxed"
          style={{ borderColor: "var(--omni-border)", color: "var(--omni-text)" }}
          placeholder="Describe structure, rooms, pool, landscape…"
        />
        <ChatPanel routeId={routeId} />
        <button type="button" className="omni-deploy-btn mt-3 w-full rounded-lg py-2 text-[10px] font-bold uppercase">
          Save Project Portfolio Configuration Storage
        </button>
      </PaneShell>
      <div className="relative min-h-0 min-w-0 flex-1">
        <IDEPane title="3D Simulation Engine · @react-three/fiber" subtitle="Real-time structural viewport" bodyClassName="p-0">
          <DynamicToolLiveSimMatrix tool={tool} />
        </IDEPane>
      </div>
    </div>
  );
}

/** GROUP C — NASA Science Solver */
export function LayoutModuleC({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "nasa-science-solver";
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PaneShell title="Scientific Live Canvas" className="flex-1">
        <DynamicToolLiveSimMatrix tool={tool} />
      </PaneShell>
      <PaneShell title="Science Agent · Prompt" className="w-[40%] max-w-lg">
        <ChatPanel routeId={routeId} />
        <div className="flex gap-2 p-2">
          <button type="button" className="omni-accent-border flex-1 rounded border py-2 text-[10px]">Attach files</button>
          <button type="button" className="omni-accent-border flex-1 rounded border py-2 text-[10px] omni-accent-text">🎤 Voice</button>
        </div>
      </PaneShell>
    </div>
  );
}

/** GROUP D — Medical Diagnostic */
export function LayoutModuleD({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "medical-diagnostic";
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden">
      <PaneShell title="Medical AI Agent">
        <ChatPanel routeId={routeId} />
        <div className="flex flex-wrap gap-2 p-2">
          {["Live Camera Scan", "Attach PDF", "Video Feed"].map((l) => (
            <button key={l} type="button" className="omni-accent-border rounded border px-2 py-1 text-[9px] omni-accent-text">{l}</button>
          ))}
        </div>
      </PaneShell>
      <PaneShell title="Clinical Diagnostic Dashboard">
        <DynamicToolLiveSimMatrix tool={tool} />
      </PaneShell>
    </div>
  );
}

/** GROUP E — Quantum Trading */
export function LayoutModuleE({ tool }: { tool: SovereignToolDef }) {
  const [autoMode, setAutoMode] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 gap-2 border-b p-2" style={{ borderColor: "var(--omni-border)" }}>
          {["NYSE", "Binance", "KSE-100"].map((ex) => (
            <button key={ex} type="button" className="omni-accent-border rounded border px-3 py-1 text-[10px] omni-accent-text">{ex} Connect</button>
          ))}
        </header>
        <div className="min-h-0 flex-1">
          <DynamicToolLiveSimMatrix tool={tool} />
        </div>
      </div>
      <PaneShell title="Trading Agent" className="w-80 shrink-0">
        <label className="mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-[10px]" style={{ borderColor: "var(--omni-border)" }}>
          <span>{autoMode ? "AUTONOMOUS ROBOT TRADING" : "MANUAL ADVISORY"}</span>
          <input type="checkbox" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} className="accent-[var(--omni-accent)]" />
        </label>
        <ChatPanel routeId={tool.omniRouteId ?? "quantum-trading"} />
      </PaneShell>
    </div>
  );
}

/** GROUP F — Business Analytics */
export function LayoutModuleF({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "business-analytics";
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PaneShell title="Analytical Live Worksheet" className="flex-1">
        <DynamicToolLiveSimMatrix tool={tool} />
      </PaneShell>
      <PaneShell title="Data Agent" className="w-[36%] max-w-md">
        <ChatPanel routeId={routeId} />
        <div className="flex flex-col gap-2 p-2">
          <button type="button" className="omni-deploy-btn rounded py-2 text-[10px] font-bold">Export to Excel .xlsx</button>
          <button type="button" className="omni-accent-border rounded border py-2 text-[10px] omni-accent-text">Export Word Executive Summary</button>
        </div>
      </PaneShell>
    </div>
  );
}

/** GROUP G — Creative Visionary Video */
export function LayoutModuleG({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "creative-visionary";
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-2" style={{ borderColor: "var(--omni-border)" }}>
        <select className="rounded border bg-black/40 px-2 py-1 text-[10px]" style={{ borderColor: "var(--omni-border)", color: "var(--omni-text)" }}>
          <option>Video Timeline: 50 Seconds</option>
          <option>Video Timeline: 1 Minute</option>
        </select>
        {[1, 2, 3, 5].map((n) => (
          <button key={n} type="button" className="omni-accent-border rounded border px-2 py-1 text-[9px] omni-accent-text">
            {n} Frame{n > 1 ? "s" : ""}
          </button>
        ))}
        <select className="ml-auto rounded border bg-black/40 px-2 py-1 text-[10px]" style={{ borderColor: "var(--omni-border)", color: "var(--omni-text-muted)" }}>
          <option>Audio: Cinematic synth</option>
          <option>Audio: Corporate neutral</option>
        </select>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <DynamicToolLiveSimMatrix tool={tool} />
      </div>
      <div
        className="shrink-0 border-t"
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)", maxHeight: "min(28vh, 220px)" }}
      >
        <p className="border-b px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider omni-accent-text" style={{ borderColor: "var(--omni-border)" }}>
          Creative Visionary · Horizontal Dialogue Dock
        </p>
        <div className="h-[min(22vh,180px)] min-h-[100px] overflow-hidden">
          <ChatPanel routeId={routeId} />
        </div>
      </div>
    </div>
  );
}

/** GROUP H — VFX Master Editor */
export function LayoutModuleH({ tool }: { tool: SovereignToolDef }) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DynamicToolLiveSimMatrix tool={tool} />
        <div className="shrink-0 border-t p-2" style={{ borderColor: "var(--omni-border)" }}>
          <p className="mb-1 text-[9px] font-bold uppercase omni-accent-text">AI VFX Effects Library</p>
          <div className="flex gap-1">
            {["Lighting", "3D Track", "CGI Filter"].map((fx) => (
              <button key={fx} type="button" className="omni-accent-border rounded border px-2 py-1 text-[9px]">{fx}</button>
            ))}
          </div>
        </div>
      </div>
      <PaneShell title="AI Edit Agent" className="w-72 shrink-0">
        <ChatPanel routeId={tool.omniRouteId ?? "vfx-master"} />
        <div className="flex flex-wrap gap-1 p-2">
          {["YouTube", "TikTok", "LinkedIn", "Facebook", "Save Local"].map((t) => (
            <button key={t} type="button" className="omni-accent-border rounded border px-2 py-1 text-[8px]">{t}</button>
          ))}
        </div>
      </PaneShell>
    </div>
  );
}

/** GROUP I — Digital Marketing Hub */
export function LayoutModuleI({ tool }: { tool: SovereignToolDef }) {
  const [manual3d, setManual3d] = useState(false);
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(340px,42%)_1fr]">
      <PaneShell title="Campaign Prompt Workspace">
        <ChatPanel routeId={tool.omniRouteId ?? "marketing-ad-king"} />
        <button
          type="button"
          className="mx-3 mb-3 shrink-0 rounded-lg border border-dashed py-2.5 text-[10px] transition hover:brightness-110"
          style={{ borderColor: "var(--omni-border)", color: "var(--omni-text-muted)" }}
        >
          Drop brand assets · images · product files
        </button>
      </PaneShell>
      <PaneShell title={manual3d ? "Manual Blender-Style 3D Sandbox" : "Multi-Device Marketing Billboard"} className="border-r-0">
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--omni-border)" }}>
          <span className="text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
            3 parallel assets · Image Ad · Promo Video · Social Captions
          </span>
          <button
            type="button"
            onClick={() => setManual3d((v) => !v)}
            className="omni-accent-border rounded-md border px-2.5 py-1 text-[9px] font-semibold omni-accent-text"
          >
            {manual3d ? "Auto Agent" : "Manual 3D"}
          </button>
        </div>
        {manual3d ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <DynamicToolLiveSimMatrix tool={getSovereignTool("architectural-designer")!} />
          </div>
        ) : (
          <MarketingLiveSlots />
        )}
      </PaneShell>
    </div>
  );
}

/** Generic fallback — entertainment / maps (no IDE chrome) */
export function LayoutModuleGeneric({ tool }: { tool: SovereignToolDef }) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <DynamicToolLiveSimMatrix tool={tool} />
    </div>
  );
}
