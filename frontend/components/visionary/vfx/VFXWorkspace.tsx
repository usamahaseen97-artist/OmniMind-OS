"use client";

import type { ReactNode } from "react";
import { Group, Panel } from "react-resizable-panels";
import { cn } from "../../../lib/utils";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";
import type { VFXWorkspaceMode } from "../../../lib/visionary/vfx/types";
import { SplitResizeHandle } from "../../ide/layouts/SplitWorkspace";
import { SceneHierarchy } from "./SceneHierarchy";
import { CompositionManager } from "./CompositionManager";
import { Compositor } from "./Compositor";
import { NodeEditor } from "./NodeEditor";
import { ThreeDViewport } from "./3DViewport";
import { MotionGraphicsStudio } from "./MotionGraphicsStudio";
import { InspectorPanel, VFXExportPanel } from "./InspectorPanel";
import { AnimationGraph } from "./AnimationGraph";
import { ParticleSystem } from "./ParticleSystem";
import { GreenScreenEditor } from "./GreenScreenEditor";
import { MotionTracker } from "./MotionTracker";

const MODES: { id: VFXWorkspaceMode; label: string }[] = [
  { id: "compositor", label: "Compositor" },
  { id: "node-graph", label: "Node Graph" },
  { id: "motion-graphics", label: "Motion Graphics" },
  { id: "3d", label: "3D" },
  { id: "particles", label: "Particles" },
  { id: "green-screen", label: "Green Screen" },
  { id: "tracking", label: "Tracking" },
];

export function VFXWorkspace() {
  const { workspaceMode, setWorkspaceMode, saveProject } = useVisionaryVFX();

  return (
    <div className="vfx-workspace flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0e16] px-2">
        <div className="flex gap-0.5 overflow-x-auto">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setWorkspaceMode(m.id)}
              className={cn(
                "shrink-0 rounded px-2.5 py-1 text-[10px] transition-colors",
                workspaceMode === m.id ? "bg-fuchsia-500/15 text-fuchsia-200" : "text-slate-500 hover:text-slate-300",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={saveProject}
          className="rounded border border-fuchsia-500/30 px-2 py-0.5 text-[9px] text-fuchsia-300 hover:bg-fuchsia-500/10"
        >
          Save Comp
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={14} maxSize={30} className="flex min-h-0 flex-col overflow-hidden">
            <SceneHierarchy />
            <CompositionManager />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={58} minSize={40} className="flex min-h-0 flex-col overflow-hidden">
            <CenterViewport mode={workspaceMode} />
            <AnimationGraph />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={22} minSize={16} maxSize={32} className="flex min-h-0 flex-col overflow-hidden">
            <InspectorPanel />
          </Panel>
        </Group>
      </div>

      <VFXExportPanel compact />
    </div>
  );
}

function CenterViewport({ mode }: { mode: VFXWorkspaceMode }) {
  if (mode === "node-graph") return <NodeEditor full />;
  if (mode === "motion-graphics") return <MotionGraphicsStudio />;
  if (mode === "3d") return <ThreeDViewport />;
  if (mode === "particles") return <ParticleCompositorLayout bottom={<ParticleSystem />} />;
  if (mode === "green-screen") return <SidePanelLayout side={<GreenScreenEditor />} />;
  if (mode === "tracking") return <SidePanelLayout side={<MotionTracker />} />;
  return <Compositor />;
}

function ParticleCompositorLayout({ bottom }: { bottom: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Compositor />
      <div className="max-h-48 shrink-0 border-t border-white/[0.06]">{bottom}</div>
    </div>
  );
}

function SidePanelLayout({ side }: { side: ReactNode }) {
  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1"><Compositor /></div>
      <div className="w-72 shrink-0 border-l border-white/[0.06]">{side}</div>
    </div>
  );
}
