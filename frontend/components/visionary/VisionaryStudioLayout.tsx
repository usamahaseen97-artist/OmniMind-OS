"use client";

import { memo, type ReactNode } from "react";
import { Group, Panel } from "react-resizable-panels";
import { VIDEO_EDITOR_MODULES } from "../../lib/visionary/editor/constants";
import { VFX_MODULES } from "../../lib/visionary/vfx/constants";
import { MARKETING_MODULES } from "../../lib/visionary/marketing/constants";
import { STUDIO_3D_MODULES } from "../../lib/visionary/studio3d/constants";
import { AUTOMATION_MODULES } from "../../lib/visionary/automation/constants";
import { useVisionaryStudio } from "../../lib/visionary/context";
import { SplitResizeHandle, SplitWorkspace3Col } from "../ide/layouts/SplitWorkspace";
import {
  DynamicAutomationWorkspace,
  DynamicMarketingWorkspace,
  DynamicStudio3DWorkspace,
  DynamicVFXWorkspace,
  DynamicVideoEditorWorkspace,
  VisionaryWorkspaceSuspense,
} from "../ide/layouts/dynamic-visionary-workspaces";
import { VisionaryAICopilot } from "./VisionaryAICopilot";
import { VisionaryCenterWorkspace } from "./VisionaryCenterWorkspace";
import { VisionaryBottomWorkspace } from "./VisionaryBottomWorkspace";
import { VisionaryInspector } from "./VisionaryInspector";
import { VisionarySidebar } from "./VisionarySidebar";
import { VisionaryStatusBar } from "./VisionaryStatusBar";
import { VisionaryToolbar } from "./VisionaryToolbar";

const DefaultVisionaryShell = memo(function DefaultVisionaryShell() {
  return (
    <Group orientation="vertical" className="h-full min-h-0">
      <Panel defaultSize={72} minSize={40} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <SplitWorkspace3Col
          left={<VisionarySidebar />}
          center={<VisionaryCenterWorkspace />}
          right={<VisionaryInspector />}
          leftDefault={18}
          centerDefault={58}
          rightDefault={24}
        />
      </Panel>
      <SplitResizeHandle orientation="vertical" />
      <Panel defaultSize={28} minSize={12} maxSize={50} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <VisionaryBottomWorkspace />
      </Panel>
    </Group>
  );
});

/**
 * Visionary Studio — professional dockable layout.
 * Sub-workspaces load on demand per active module (code-split).
 */
export const VisionaryStudioLayout = memo(function VisionaryStudioLayout({
  toolSwitcher,
  embeddedInAppShell,
}: {
  toolSwitcher?: ReactNode;
  embeddedInAppShell?: boolean;
}) {
  const { activeModule } = useVisionaryStudio();
  const isAutomation = AUTOMATION_MODULES.has(activeModule);
  const isStudio3D = STUDIO_3D_MODULES.has(activeModule);
  const isMarketing = MARKETING_MODULES.has(activeModule);
  const isVFX = VFX_MODULES.has(activeModule);
  const isVideoEditor = VIDEO_EDITOR_MODULES.has(activeModule);

  return (
    <div className="visionary-studio-layout flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      {!embeddedInAppShell ? <VisionaryToolbar toolSwitcher={toolSwitcher} /> : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <VisionaryWorkspaceSuspense>
          {isAutomation ? (
            <DynamicAutomationWorkspace />
          ) : isStudio3D ? (
            <DynamicStudio3DWorkspace />
          ) : isMarketing ? (
            <DynamicMarketingWorkspace />
          ) : isVFX ? (
            <DynamicVFXWorkspace />
          ) : isVideoEditor ? (
            <DynamicVideoEditorWorkspace />
          ) : (
            <DefaultVisionaryShell />
          )}
        </VisionaryWorkspaceSuspense>
      </div>

      {!embeddedInAppShell ? <VisionaryStatusBar /> : null}
      {!embeddedInAppShell ? <VisionaryAICopilot /> : null}
    </div>
  );
});
