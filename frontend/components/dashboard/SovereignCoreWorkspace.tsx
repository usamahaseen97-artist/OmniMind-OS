"use client";

import { useEffect, useState, type ReactNode } from "react";
import { GeminiCoreChat } from "./GeminiCoreChat";
import { OmniMindMultiAgentChassis } from "./OmniMindMultiAgentChassis";
import { AgentSandboxSplit } from "../layout/AgentSandboxSplit";
import { SuperToolWorkspace } from "../superapp/SuperToolWorkspace";
import { DynamicSovereignWorkbenchShell } from "../ide/dynamic-sovereign-shell";
import { getAgentArchitectureOption } from "../../lib/agent-architecture-options";
import type { AppViewId } from "../../lib/app-views";
import { getOmniTool, isWorkbenchTool, type OmniRouteId } from "../../lib/omni-tools";
import { sovereignToolByOmniRoute } from "../../lib/sovereign-tool-registry";
import { setCodePanelOpen, setChatPanelOpen } from "../../lib/workbench-zone-store";
import { OmniMindHomeDashboard } from "../ecosystem/os/OmniMindHomeDashboard";
import { useEcosystemOSOptional } from "../../lib/ecosystem-os-context";

interface SovereignCoreWorkspaceProps {
  routeId: OmniRouteId | string;
  onSelectRoute: (id: OmniRouteId) => void;
  userId: string;
  conversationId?: string;
  onConversationId?: (id: string) => void;
  displayName?: string;
  onNewChat?: () => void;
  onMenuToggle?: () => void;
  secureNodeActive?: boolean;
  onSearchChats?: () => void;
  onImagesShortcut?: () => void;
  onLibrary?: () => void;
  onSelectView?: (id: AppViewId) => void;
}

/** Standalone Gemini paradigm — zones 3 & 4 slide out, chat fills viewport */
export function SovereignCoreWorkspace({
  routeId,
  onSelectRoute,
  userId,
  conversationId,
  onConversationId,
  displayName,
  onNewChat,
  onMenuToggle,
  secureNodeActive,
  onSearchChats,
  onImagesShortcut,
  onLibrary,
  onSelectView,
}: SovereignCoreWorkspaceProps) {
  const tool = getOmniTool(routeId);
  const activeAgent = getAgentArchitectureOption(routeId);
  const isPureChat = routeId === "dashboard" || tool.kind === "dashboard";
  const sovereignTool = sovereignToolByOmniRoute(routeId);
  const [homeMode, setHomeMode] = useState(true);
  const ecosystemOS = useEcosystemOSOptional();

  useEffect(() => {
    if (routeId === "dashboard") setHomeMode(true);
  }, [routeId]);

  useEffect(() => {
    if (isPureChat) {
      setChatPanelOpen(true);
      setCodePanelOpen(false);
    }
  }, [isPureChat]);

  const renderMain = (): ReactNode => {
    if (routeId === "meta-agent") {
      return (
        <div className="scrollbar-thin h-full min-h-0 overflow-y-auto p-2 md:p-4">
          <OmniMindMultiAgentChassis userIdentity={userId} />
        </div>
      );
    }

    if (isPureChat) {
      if (homeMode) {
        return (
          <OmniMindHomeDashboard
            onContinueChat={() => setHomeMode(false)}
            onOpenHub={() => ecosystemOS?.openPanel("hub")}
            className="h-full"
          />
        );
      }
      return (
        <GeminiCoreChat
          routeId={routeId}
          userId={userId}
          conversationId={conversationId}
          onConversationId={onConversationId}
          displayName={displayName}
          onNewChat={onNewChat}
          onMenuToggle={onMenuToggle}
          secureNodeActive={secureNodeActive}
          onSearchChats={onSearchChats}
          onImagesShortcut={onImagesShortcut}
          onLibrary={onLibrary}
          onSelectRoute={onSelectRoute}
          onSelectView={onSelectView}
        />
      );
    }

    if (tool.kind === "custom-split") {
      return (
        <AgentSandboxSplit activeAgent={activeAgent} activeAgentSlot={routeId} showLiveDeck={false}>
          <SuperToolWorkspace toolId={routeId} />
        </AgentSandboxSplit>
      );
    }

    if (isWorkbenchTool(routeId) && sovereignTool) {
      return (
        <div className="h-full min-h-0 w-full overflow-hidden">
          <DynamicSovereignWorkbenchShell tool={sovereignTool} />
        </div>
      );
    }

    return (
      <GeminiCoreChat
        routeId={routeId}
        userId={userId}
        conversationId={conversationId}
        onConversationId={onConversationId}
        displayName={displayName}
        onNewChat={onNewChat}
        onMenuToggle={onMenuToggle}
        secureNodeActive={secureNodeActive}
        onSearchChats={onSearchChats}
        onImagesShortcut={onImagesShortcut}
        onLibrary={onLibrary}
        onSelectRoute={onSelectRoute}
        onSelectView={onSelectView}
      />
    );
  };

  return (
    <div className="omni-workbench-shell flex h-screen max-h-screen w-full max-w-[100vw] min-h-0 overflow-hidden">
      {renderMain()}
    </div>
  );
}
