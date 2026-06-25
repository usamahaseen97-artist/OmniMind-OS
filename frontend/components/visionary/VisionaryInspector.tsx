"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { INSPECTOR_TABS } from "../../lib/visionary/constants";
import { useVisionaryStudio } from "../../lib/visionary";
import type { InspectorTab } from "../../lib/visionary/types";
import { PromptOptimizer } from "./ai/PromptOptimizer";
import { InferenceManager } from "./ai/InferenceManager";
import { CloudAssetSync } from "./ai/CloudAssetSync";
import { ModelRouter } from "./ai/ModelRouter";
import { JobScheduler } from "./ai/JobScheduler";
import { PromptTemplates } from "./ai/PromptTemplates";

export function VisionaryInspector() {
  const {
    inspectorTab,
    setInspectorTab,
    dock,
    toggleRightPanel,
    layers,
    selectedLayerIds,
    undoStack,
    versions,
    project,
    activeModule,
  } = useVisionaryStudio();

  if (dock.rightCollapsed) {
    return (
      <div className="flex h-full w-8 shrink-0 flex-col items-center border-l border-white/[0.06] bg-[#080c14] py-2">
        <button
          type="button"
          onClick={toggleRightPanel}
          className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-cyan-300"
          aria-label="Expand inspector"
        >
          <ChevronLeft size={14} />
        </button>
      </div>
    );
  }

  const selectedLayer = layers.find((l) => l.id === selectedLayerIds[0]);

  return (
    <aside
      className="visionary-inspector flex h-full min-h-0 w-full flex-col overflow-hidden border-l border-white/[0.06] bg-[#080c14]"
      aria-label="Properties inspector"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-2 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Inspector</p>
        <button
          type="button"
          onClick={toggleRightPanel}
          className="rounded p-1 text-slate-500 hover:bg-white/[0.06]"
          aria-label="Collapse inspector"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/[0.04] p-1">
        {INSPECTOR_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setInspectorTab(tab.id as InspectorTab)}
            className={cn(
              "shrink-0 rounded px-2 py-1 text-[8px] transition-colors",
              inspectorTab === tab.id
                ? "bg-white/10 text-slate-200"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 text-[10px]">
        {inspectorTab === "properties" && selectedLayer ? (
          <div className="space-y-3">
            <Field label="Name" value={selectedLayer.name} />
            <Field label="Type" value={selectedLayer.type} />
            <Field label="Opacity" value={`${selectedLayer.opacity}%`} />
            <Field label="Module" value={activeModule.replace(/-/g, " ")} />
            <Field label="Resolution" value={`${project.resolution.width}×${project.resolution.height}`} />
          </div>
        ) : null}

        {inspectorTab === "materials" ? (
          <div className="space-y-2">
            {["Diffuse", "Specular", "Roughness", "Emission"].map((m) => (
              <div key={m} className="flex items-center justify-between rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                <span className="text-slate-400">{m}</span>
                <div className="h-4 w-8 rounded bg-gradient-to-r from-slate-600 to-slate-400" />
              </div>
            ))}
          </div>
        ) : null}

        {inspectorTab === "animation" ? (
          <div className="space-y-2 text-slate-500">
            <p>Keyframe lanes bind to timeline tracks in Phase 2.</p>
            <Field label="Easing" value="Cubic Bezier (0.4, 0, 0.2, 1)" />
            <Field label="Duration" value={`${project.durationFrames / project.fps}s`} />
          </div>
        ) : null}

        {inspectorTab === "effects" ? (
          <ul className="space-y-1">
            {["Bloom", "Chromatic Aberration", "Film Grain", "Vignette"].map((fx) => (
              <li key={fx} className="flex items-center justify-between rounded bg-white/[0.02] px-2 py-1.5">
                <span className="text-slate-300">{fx}</span>
                <input type="checkbox" defaultChecked={fx === "Bloom"} className="accent-cyan-400" />
              </li>
            ))}
          </ul>
        ) : null}

        {inspectorTab === "ai-suggestions" ? (
          <div className="space-y-3">
            <PromptOptimizer />
            <ModelRouter compact />
            <InferenceManager />
            <JobScheduler />
            <CloudAssetSync />
            {[
              "Align title to rule-of-thirds intersection",
              "Add motion blur on hero layer at frame 120",
              "Match brand palette to Marketing Studio preset",
            ].map((s) => (
              <button
                key={s}
                type="button"
                className="w-full rounded border border-cyan-500/20 bg-cyan-500/5 px-2 py-2 text-left text-[10px] text-slate-300 hover:bg-cyan-500/10"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {inspectorTab === "history" ? (
          <ul className="space-y-1 font-mono text-[9px]">
            {undoStack.slice(0, 12).map((h) => (
              <li key={h.id} className="border-b border-white/[0.03] py-1 text-slate-500">
                {h.timestamp.slice(11, 19)} · {h.label}
              </li>
            ))}
          </ul>
        ) : null}

        {inspectorTab === "assets" ? (
          <PromptTemplates />
        ) : null}

        {inspectorTab === "export-settings" ? (
          <div className="space-y-2">
            <Field label="Format" value="H.264 / MP4" />
            <Field label="Bitrate" value="50 Mbps" />
            <Field label="Color space" value="Rec. 709" />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-wider text-slate-600">{label}</p>
      <p className="mt-0.5 text-slate-300">{value}</p>
    </div>
  );
}
