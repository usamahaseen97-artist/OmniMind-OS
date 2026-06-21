"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { AgentChatHub } from "../../workspace/AgentChatHub";
import { MarketingCompositionCanvas } from "../../workspace/MarketingCompositionCanvas";
import { SplitPanelBody, SplitPanelHeader, SplitWorkspace2Col } from "../SplitWorkspace";

/** GROUP I — RunwayML / Sora premium marketing studio */
export function LayoutModuleI({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "marketing-ad-king";

  return (
    <SplitWorkspace2Col
      sidebarDefault={34}
      sidebar={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader title="Multi-Modal Brief Parser" subtitle="Scripts · assets · campaign specs" />
          <SplitPanelBody padded className="gap-2">
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {["16:9 Cinematic", "9:16 Social", "1:1 Square", "4:5 Story"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  className="omni-state-ring rounded-lg border py-1.5 text-[9px] omni-accent-text"
                  style={{ borderColor: "#1E293B" }}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <AgentChatHub routeId={routeId} toolSlug={tool.slug} />
            </div>
            <button
              type="button"
              className="omni-state-ring shrink-0 rounded-lg border border-dashed py-2.5 text-[10px]"
              style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}
            >
              Attach brand assets · product images
            </button>
          </SplitPanelBody>
        </div>
      }
      main={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="Runway / Sora Canvas"
            subtitle="AI generation · manual product composition"
          />
          <SplitPanelBody className="p-0">
            <MarketingCompositionCanvas />
          </SplitPanelBody>
        </div>
      }
    />
  );
}
