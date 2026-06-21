"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { assertDevTrioSlug } from "../../../../lib/dev-trio";
import { OmniForgeLayoutProvider } from "../../../../lib/omniforge-layout-context";
import { OmniForgeShellProvider } from "../../../../lib/omniforge-shell-context";
import { useIDE } from "../../IDEProvider";
import { useDevEngineWorkbench } from "../../../../lib/use-dev-engine-workbench";
import { OmniForgeAgentSection } from "./OmniForgeAgentPane";
import { OmniForgeCodingWorkspaceSection } from "./OmniForgeCodingWorkspaceSection";
import { OmniForgeTriPaneGrid } from "./OmniForgeResizableShell";
import { OmniForgeThemeRoot } from "./OmniForgeThemeRoot";
import { OmniForgeVisualPreviewSection } from "./OmniForgeVisualPreviewSection";
import { OmniForgeConnectionBar } from "./OmniForgeConnectionBar";
import { OmniForgeWorkspaceBoot } from "./OmniForgeWorkspaceBoot";
import { OmniForgeStackBootstrap } from "./OmniForgeStackBootstrap";
import { OmniForgeTopNav } from "./shell/OmniForgeTopNav";

/**
 * OmniForge Engine — unified 3-pane workbench (merged app / game / business):
 * AI Agent · Monaco + Terminal · Live Preview
 */
export function OmniForgeFourGridShell({
  tool,
  legacySlug,
}: {
  tool: SovereignToolDef;
  legacySlug?: string;
}) {
  const devSlug = assertDevTrioSlug(tool.slug);
  const { setMainView, setTopTab, appendTerminal } = useIDE();
  useDevEngineWorkbench(devSlug);

  const [mode, setMode] = useState<"coding" | "terminal" | "vibe">("vibe");
  const [providerKey, setProviderKey] = useState("");
  const [modelLayer, setModelLayer] = useState("Open Source");
  const [githubRepo, setGithubRepo] = useState("");

  const modeHint = useMemo(() => {
    if (mode === "vibe") return "Vibe · natural-language scaffold blocks";
    if (mode === "terminal") return "Terminal · command execution first";
    return "Coding · granular multi-file structure";
  }, [mode]);

  const forgeControls = useMemo(
    () => ({ mode, modelLayer, githubRepo, providerKey }),
    [githubRepo, mode, modelLayer, providerKey],
  );

  const previewProps = useMemo(
    () => ({
      ...forgeControls,
      modeHint,
      onModeChange: setMode,
      onModelLayerChange: setModelLayer,
      onGithubRepoChange: setGithubRepo,
      onProviderKeyChange: setProviderKey,
    }),
    [forgeControls, modeHint],
  );

  const agentProps = useMemo(
    () => ({
      toolSlug: devSlug,
      ...forgeControls,
      modeHint,
      onModeChange: setMode,
      onModelLayerChange: setModelLayer,
      onGithubRepoChange: setGithubRepo,
      onProviderKeyChange: setProviderKey,
    }),
    [devSlug, forgeControls, modeHint],
  );

  const runPreview = () => {
    window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
    appendTerminal("▸ Run · live preview sync");
  };

  useEffect(() => {
    setMainView("editor");
    setTopTab("review-code");
  }, [setMainView, setTopTab]);

  return (
    <OmniForgeLayoutProvider>
      <OmniForgeShellProvider>
        <Suspense fallback={null}>
          <OmniForgeStackBootstrap legacySlug={legacySlug} />
        </Suspense>
        <OmniForgeWorkspaceBoot />
        <OmniForgeThemeRoot>
          <div className="omniforge-ai-ide flex h-full min-h-0 flex-col overflow-hidden">
            <OmniForgeTopNav tool={tool} onRun={runPreview} />
            <OmniForgeConnectionBar />
            <div className="min-h-0 flex-1 overflow-hidden">
              <OmniForgeTriPaneGrid
                agent={<OmniForgeAgentSection {...agentProps} />}
                codingWorkspace={<OmniForgeCodingWorkspaceSection />}
                visualPreview={<OmniForgeVisualPreviewSection {...previewProps} />}
              />
            </div>
          </div>
        </OmniForgeThemeRoot>
      </OmniForgeShellProvider>
    </OmniForgeLayoutProvider>
  );
}

export const omniforgeShellClass = "omniforge-production-shell h-full min-h-0 w-full overflow-hidden";
