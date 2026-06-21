"use client";

import { useCallback, useState } from "react";
import { useAppNavigationOptional } from "../../lib/app-navigation-context";
import type { AppViewId } from "../../lib/app-views";
import type { OmniRouteId } from "../../lib/omni-tools";
import { getAgentArchitectureOption } from "../../lib/agent-architecture-options";
import {
  routeIdToUnifiedTool,
  unifiedToolNavigationHref,
  unifiedToolToRouteId,
  unifiedToolUsesHomeShell,
  type UnifiedToolId,
  type UtilityTab,
} from "../../lib/unified-navigation";
import { OmniChatShell } from "../chat/OmniChatShell";
import { OmniMindCoreLayout } from "./OmniMindCoreLayout";
import { OmniMindWorkspacePanels } from "./OmniMindWorkspacePanels";
import type { OmniMindTab } from "./GeminiSidebar";

interface OmniMindOSProps {
  routeId: OmniRouteId | string;
  userId: string;
  conversationId?: string;
  onConversationId?: (id: string) => void;
  displayName?: string;
  onNewChat?: () => void;
  onMenuToggle?: () => void;
  secureNodeActive?: boolean;
  onSelectRoute?: (id: OmniRouteId) => void;
  onSelectView?: (id: AppViewId) => void;
}

function utilityToOmniTab(tab: UtilityTab): OmniMindTab {
  switch (tab) {
    case "chat":
      return "new-chat";
    case "search":
      return "history";
    case "media":
      return "images";
    case "docs":
      return "library";
  }
}

function omniTabToUtility(tab: OmniMindTab): UtilityTab {
  switch (tab) {
    case "new-chat":
      return "chat";
    case "history":
      return "search";
    case "images":
      return "media";
    case "library":
      return "docs";
  }
}

/**
 * OmniMind Complete System — sliding tree + neural chat on dashboard;
 * all other tools mount their dedicated full-screen dashboards.
 */
export function OmniMindOS({
  routeId,
  userId,
  conversationId,
  onConversationId,
  displayName = "Usama",
  onNewChat,
  onMenuToggle,
  secureNodeActive = true,
  onSelectRoute,
  onSelectView,
}: OmniMindOSProps) {
  const appNav = useAppNavigationOptional();
  const [activeTab, setActiveTab] = useState<OmniMindTab>("new-chat");
  const [chatEpoch, setChatEpoch] = useState(0);

  const routeTool = routeIdToUnifiedTool(routeId);
  const currentTool = routeTool;
  const agent = getAgentArchitectureOption(routeId);
  const resolvedRoute = routeId === "dashboard" ? "dashboard" : routeId;
  const isLiveChat =
    activeTab === "new-chat" && currentTool === "neural-chat" && resolvedRoute === "dashboard";

  const handleNewChat = useCallback(() => {
    setActiveTab("new-chat");
    onNewChat?.();
    setChatEpoch((n) => n + 1);
  }, [onNewChat]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      onConversationId?.(sessionId);
      setActiveTab("new-chat");
    },
    [onConversationId],
  );

  const handleImageTemplate = useCallback((prompt: string) => {
    setActiveTab("new-chat");
    window.dispatchEvent(
      new CustomEvent("omnimind:fill-prompt", { detail: { text: prompt, mode: "replace" } }),
    );
  }, []);

  const handleToolChange = useCallback(
    (tool: UnifiedToolId) => {
      setActiveTab("new-chat");

      if (appNav) {
        appNav.selectUnifiedTool(tool);
        return;
      }

      if (tool === "neural-chat") {
        onSelectRoute?.("dashboard");
        onSelectView?.("sovereign-core");
        return;
      }

      if (unifiedToolUsesHomeShell(tool)) {
        onSelectView?.("omnicharge");
        return;
      }

      const href = unifiedToolNavigationHref(tool);
      if (href) {
        window.location.assign(href);
        return;
      }

      const nextRoute = unifiedToolToRouteId(tool);
      if (nextRoute) {
        onSelectRoute?.(nextRoute);
        onSelectView?.("sovereign-core");
      }
    },
    [appNav, onSelectRoute, onSelectView],
  );

  const handleTabChange = useCallback(
    (tab: UtilityTab) => {
      const omniTab = utilityToOmniTab(tab);
      setActiveTab(omniTab);
      if (omniTab === "new-chat") {
        handleNewChat();
      }
    },
    [handleNewChat],
  );

  const renderWorkspace = () => {
    if (activeTab !== "new-chat") {
      return (
        <OmniMindWorkspacePanels
          activeTab={activeTab}
          userId={userId}
          activeSessionId={conversationId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onImageTemplateSelect={handleImageTemplate}
        />
      );
    }

    if (isLiveChat) {
      return (
        <OmniChatShell
          key={`omni-chat-${chatEpoch}-${conversationId ?? "fresh"}`}
          routeId={resolvedRoute}
          userId={userId}
          conversationId={conversationId}
          onConversationId={onConversationId}
          showDashboardTools
          hideLiveDeck
          geminiLayout
          geminiDisplayName={displayName}
          activeAgent={agent}
          workspaceRouteId={routeId}
        />
      );
    }

    return null;
  };

  return (
    <OmniMindCoreLayout
      currentTool={currentTool}
      onToolChange={handleToolChange}
      activeTab={omniTabToUtility(activeTab)}
      onTabChange={handleTabChange}
      secureNodeActive={secureNodeActive}
      onGlobalMenuToggle={onMenuToggle}
      displayName={displayName}
      defaultMenuOpen
    >
      {renderWorkspace()}
    </OmniMindCoreLayout>
  );
}

/** Alias for standalone / demo imports */
export { OmniMindOS as OmniMindCompleteSystem };
