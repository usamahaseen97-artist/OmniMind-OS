"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { DynamicToolLiveSimMatrix } from "../../dynamic-workbench-widgets";
import { AgentChatHub } from "../../workspace/AgentChatHub";
import { SplitPanelBody, SplitPanelHeader, SplitWorkspace2Col } from "../SplitWorkspace";

/** GROUP F — data parser console + streaming analytics canvas */
export function LayoutModuleF({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "business-analytics";

  return (
    <SplitWorkspace2Col
      sidebarDefault={32}
      sidebar={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader title="Analytical Data Parser" subtitle="Documents · structures · customer lists" />
          <SplitPanelBody padded className="gap-2">
            <div className="mb-2 flex shrink-0 flex-wrap gap-1">
              {["Attach CSV", "Attach PDF", "Raw JSON", "Customer DB"].map((l) => (
                <button
                  key={l}
                  type="button"
                  className="omni-state-ring rounded-full border px-2 py-1 text-[8px]"
                  style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <AgentChatHub routeId={routeId} toolSlug={tool.slug} />
            </div>
            <button type="button" className="omni-deploy-btn omni-state-ring shrink-0 rounded py-2 text-[10px] font-bold">
              Export Excel .xlsx
            </button>
          </SplitPanelBody>
        </div>
      }
      main={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="Streaming Visual Analytics Canvas"
            subtitle="Bar · pie · conditional grids · KPI cards"
            badge={<span className="animate-pulse omni-state-ring rounded-full px-2 py-0.5 text-[8px] omni-accent-text">Live</span>}
          />
          <SplitPanelBody className="p-0">
            <DynamicToolLiveSimMatrix tool={tool} />
          </SplitPanelBody>
        </div>
      }
    />
  );
}
