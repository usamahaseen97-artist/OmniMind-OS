"use client";

import { Suspense } from "react";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { OmniForgeLayoutProvider } from "../../../lib/omniforge-layout-context";
import { OmniForgeShellProvider } from "../../../lib/omniforge-shell-context";
import { OmniForgeConnectionBar } from "./omniforge/OmniForgeConnectionBar";
import { OmniForgeStackBootstrap } from "./omniforge/OmniForgeStackBootstrap";
import { OmniForgeWorkspaceBoot } from "./omniforge/OmniForgeWorkspaceBoot";
import { OmniMindEcosystemShell } from "../../ecosystem/OmniMindEcosystemShell";
import { OmniWebDevelopmentWorkbench } from "../../workbench/OmniWebDevelopmentWorkbench";

/**
 * OMNI WEB DEVELOPMENT — 4-panel live workbench wired to OmniForge backend.
 */
export function ThreePanelDevShell({ tool }: { tool: SovereignToolDef }) {
  return (
    <OmniForgeLayoutProvider>
      <OmniForgeShellProvider>
        <OmniMindEcosystemShell>
          <Suspense fallback={null}>
            <OmniForgeStackBootstrap legacySlug={tool.slug} />
          </Suspense>
          <OmniForgeWorkspaceBoot />
          <OmniForgeConnectionBar />
          <div className="min-h-0 flex-1 overflow-hidden">
            <OmniWebDevelopmentWorkbench />
          </div>
        </OmniMindEcosystemShell>
      </OmniForgeShellProvider>
    </OmniForgeLayoutProvider>
  );
}
