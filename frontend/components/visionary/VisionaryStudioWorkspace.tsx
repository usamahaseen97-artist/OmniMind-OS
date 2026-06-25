"use client";

import { useEffect } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { ToolSwitcher } from "../ide/ToolSwitcher";
import { ThemeHub } from "../theme/ThemeHub";
import { VisionaryStudioProvider, VisionaryAIProvider, VisionaryEditorProvider, VisionaryVFXProvider, VisionaryMarketingProvider, VisionaryStudio3DProvider, VisionaryAutomationProvider } from "../../lib/visionary";
import { VisionaryStudioLayout } from "./VisionaryStudioLayout";

/**
 * OmniMind Visionary Studio — unified AI Creative Operating System (Phase 1).
 * Production workspace architecture; generative models connect in future phases.
 */
export function VisionaryStudioWorkspace({
  tool,
  embeddedInAppShell,
}: {
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}) {
  useEffect(() => {
    document.title = `${tool.name} · OmniMind`;
  }, [tool.name]);

  return (
    <VisionaryStudioProvider>
      <VisionaryAIProvider>
        <VisionaryEditorProvider>
          <VisionaryVFXProvider>
          <VisionaryMarketingProvider>
          <VisionaryStudio3DProvider>
          <VisionaryAutomationProvider>
          <VisionaryStudioLayout
        embeddedInAppShell={embeddedInAppShell}
        toolSwitcher={
          embeddedInAppShell ? undefined : (
          <div className="flex items-center gap-2">
            <ToolSwitcher tool={tool} />
            <ThemeHub />
          </div>
          )
        }
        />
          </VisionaryAutomationProvider>
          </VisionaryStudio3DProvider>
          </VisionaryMarketingProvider>
          </VisionaryVFXProvider>
        </VisionaryEditorProvider>
      </VisionaryAIProvider>
    </VisionaryStudioProvider>
  );
}
