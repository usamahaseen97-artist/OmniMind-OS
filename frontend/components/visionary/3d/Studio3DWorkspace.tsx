"use client";

import { Group, Panel } from "react-resizable-panels";
import { cn } from "../../../lib/utils";
import { STUDIO_3D_WORKSPACE_MODES } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";
import type { Studio3DWorkspaceMode } from "../../../lib/visionary/studio3d/types";
import { SplitResizeHandle } from "../../ide/layouts/SplitWorkspace";
import { SceneExplorer } from "./SceneExplorer";
import { ObjectHierarchy } from "./ObjectHierarchy";
import { Viewport3D } from "./Viewport3D";
import { MaterialEditor } from "./MaterialEditor";
import { ShaderEditor } from "./ShaderEditor";
import { TexturePainter } from "./TexturePainter";
import { MeshEditor } from "./MeshEditor";
import { RiggingStudio } from "./RiggingStudio";
import { AnimationStudio } from "./AnimationStudio";
import { MotionCapture } from "./MotionCapture";
import { PhysicsStudio } from "./PhysicsStudio";
import { EnvironmentBuilder } from "./EnvironmentBuilder";
import { LightingStudio } from "./LightingStudio";
import { CameraStudio } from "./CameraStudio";
import { AssetBrowser } from "./AssetBrowser";
import { CharacterCreator } from "./CharacterCreator";
import { AvatarCreator } from "./AvatarCreator";
import { GameAssetStudio } from "./GameAssetStudio";
import { DigitalHumanStudio } from "./DigitalHumanStudio";
import { AI3DPanel } from "./AI3DPanel";

function CenterPanel({ mode }: { mode: Studio3DWorkspaceMode }) {
  switch (mode) {
    case "viewport": return <Viewport3D />;
    case "character": return <CharacterCreator />;
    case "avatar": return <AvatarCreator />;
    case "animation": return <AnimationStudio />;
    case "rigging": return <RiggingStudio />;
    case "environment": return <EnvironmentBuilder />;
    case "materials": return <MaterialsPanel />;
    case "game-assets": return <GameAssetStudio />;
    case "digital-human": return <DigitalHumanStudio />;
    case "physics": return <PhysicsStudio />;
    case "motion-capture": return <MotionCapture />;
    default: return <Viewport3D />;
  }
}

function MaterialsPanel() {
  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1"><MaterialEditor full /></div>
      <div className="w-56 border-l border-white/[0.06]"><ShaderEditor /><TexturePainter /></div>
    </div>
  );
}

export function Studio3DWorkspace() {
  const { workspaceMode, setWorkspaceMode, saveProject } = useVisionaryStudio3D();

  return (
    <div className="studio-3d-workspace flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0e16] px-2">
        <div className="flex gap-0.5 overflow-x-auto">
          {STUDIO_3D_WORKSPACE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setWorkspaceMode(m.id)}
              className={cn(
                "shrink-0 rounded px-2 py-1 text-[10px] transition-colors",
                workspaceMode === m.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500 hover:text-slate-300",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={saveProject}
          className="rounded border border-cyan-500/30 px-2 py-0.5 text-[9px] text-cyan-300 hover:bg-cyan-500/10"
        >
          Save Scene
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={18} minSize={14} maxSize={26} className="flex min-h-0 flex-col overflow-hidden border-r border-white/[0.06]">
            <SceneExplorer />
            <ObjectHierarchy />
            <AssetBrowser compact />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={56} minSize={40} className="flex min-h-0 flex-col overflow-hidden">
            <CenterPanel mode={workspaceMode} />
            <BottomBar />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={26} minSize={18} maxSize={32} className="flex min-h-0 flex-col overflow-hidden border-l border-white/[0.06]">
            <MeshEditor />
            <LightingStudio />
            <CameraStudio />
            <AI3DPanel />
          </Panel>
        </Group>
      </div>
    </div>
  );
}

function BottomBar() {
  const { workspaceMode } = useVisionaryStudio3D();
  if (workspaceMode !== "viewport" && workspaceMode !== "animation") return null;
  return (
    <div className="h-20 shrink-0 border-t border-white/[0.06]">
      {workspaceMode === "animation" ? <AnimationStudio timelineOnly /> : null}
    </div>
  );
}
