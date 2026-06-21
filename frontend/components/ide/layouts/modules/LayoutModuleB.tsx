"use client";

import { useEffect, useState } from "react";
import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { pushWorkbenchDesignPrompt } from "../../../../lib/workbench-live-store";
import { DynamicToolLiveSimMatrix } from "../../dynamic-workbench-widgets";
import { IDEProjectFileTree } from "../../IDEProjectFileTree";
import { AgentChatHub } from "../../workspace/AgentChatHub";
import { SplitPanelBody, SplitPanelHeader, SplitWorkspace2Col } from "../SplitWorkspace";

/** GROUP B — dual chat + portfolio file tree + massive 3D viewport */
export function LayoutModuleB({ tool }: { tool: SovereignToolDef }) {
  const [prompt, setPrompt] = useState(
    "Design a 500yd dual-front luxury villa with 6 bedrooms and a central swimming pool",
  );
  const [showTree, setShowTree] = useState(true);
  const routeId = tool.omniRouteId ?? "architectural-designer";

  useEffect(() => {
    pushWorkbenchDesignPrompt(prompt);
  }, [prompt]);

  return (
    <SplitWorkspace2Col
      sidebarDefault={36}
      sidebar={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="Spatial Planner Console"
            subtitle="Dual agent · NLP layout mutations"
            actions={
              <button
                type="button"
                onClick={() => setShowTree((v) => !v)}
                className="omni-state-ring rounded-full border px-2 py-0.5 text-[8px] omni-accent-text"
                style={{ borderColor: "#1E293B" }}
              >
                📁 Portfolio
              </button>
            }
          />
          <SplitPanelBody padded className="gap-2">
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                pushWorkbenchDesignPrompt(e.target.value);
              }}
              className="h-20 shrink-0 resize-none rounded-lg border bg-black/30 p-3 text-[11px] leading-relaxed"
              style={{ borderColor: "#1E293B", color: "var(--omni-text)" }}
              placeholder='e.g. "Add a central marble fountain structure"'
            />
            {showTree ? (
              <div className="max-h-[160px] shrink-0 overflow-hidden rounded-lg border" style={{ borderColor: "#1E293B" }}>
                <div className="p-1">
                  <p className="mb-1 px-2 text-[9px] font-bold omni-accent-text">Save Project Portfolio Configuration Storage 📁</p>
                  <IDEProjectFileTree />
                </div>
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-hidden">
              <AgentChatHub routeId={routeId} toolSlug={tool.slug} />
            </div>
            <button type="button" className="omni-deploy-btn omni-state-ring shrink-0 rounded-lg py-2 text-[10px] font-bold uppercase">
              Save Portfolio Configuration
            </button>
          </SplitPanelBody>
        </div>
      }
      main={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="3D Spatial Matrix"
            subtitle="@react-three/fiber · drag assets from drawer"
            badge={<span className="omni-state-ring rounded-full px-2 py-0.5 text-[8px] omni-accent-text">R3F</span>}
          />
          <SplitPanelBody className="p-0">
            <DynamicToolLiveSimMatrix tool={tool} />
          </SplitPanelBody>
        </div>
      }
    />
  );
}
