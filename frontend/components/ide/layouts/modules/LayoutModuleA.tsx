"use client";

import { useEffect } from "react";
import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { DynamicIDEBottomPanel } from "../../dynamic-workbench-widgets";
import { useIDE } from "../../IDEProvider";
import { IDEProjectFileTree } from "../../IDEProjectFileTree";
import { AgentChatHub } from "../../workspace/AgentChatHub";
import { StreamingCodeEngine } from "../../workspace/StreamingCodeEngine";
import { LiveInteractivePreview } from "../LiveInteractivePreview";
import { SplitPanelBody, SplitPanelHeader, SplitWorkspace3Col } from "../SplitWorkspace";
/** GROUP A — 25% Chat | 35% Code | 40% Live Device Canvas */
export function LayoutModuleA({ tool }: { tool: SovereignToolDef }) {
  const { setMainView, setTopTab, leftExplorerOpen } = useIDE();
  const routeId = tool.omniRouteId ?? tool.slug;

  useEffect(() => {
    setMainView("editor");
    setTopTab("review-code");
  }, [setMainView, setTopTab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <SplitWorkspace3Col
        leftDefault={25}
        centerDefault={35}
        rightDefault={40}
        footer={<DynamicIDEBottomPanel />}
        footerDefault={14}
        left={
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <SplitPanelHeader title="Conversational Agent Hub" subtitle="Natural language · feature chips" />
            <SplitPanelBody className="p-0">
              {leftExplorerOpen ? (
                <div className="max-h-[140px] shrink-0 overflow-hidden border-b" style={{ borderColor: "#1E293B" }}>
                  <IDEProjectFileTree />
                </div>
              ) : null}
              <AgentChatHub routeId={routeId} toolSlug={tool.slug} />
            </SplitPanelBody>
          </div>
        }
        center={
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <SplitPanelHeader
              title="Monospace Code Engine"
              subtitle="Live token stream · structural sync"
              badge={<span className="omni-state-ring rounded-full px-2 py-0.5 text-[8px] omni-accent-text">Monaco</span>}
            />
            <SplitPanelBody className="p-0">
              <StreamingCodeEngine />
            </SplitPanelBody>
          </div>
        }
        right={
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <SplitPanelHeader
              title="Live Execution Device"
              subtitle="Mobile / desktop emulator · WYSIWYG sync"
              badge={<span className="omni-live-badge omni-state-ring rounded-full px-2 py-0.5 text-[8px]">Live</span>}
            />
            <SplitPanelBody className="p-0">
              <LiveInteractivePreview tool={tool} useDeviceFrame />
            </SplitPanelBody>
          </div>
        }
      />
    </div>
  );
}
