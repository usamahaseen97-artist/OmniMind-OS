"use client";

import { OmniMindOS } from "../layout/OmniMindOS";
import type { AppViewId } from "../../lib/app-views";
import type { OmniRouteId } from "../../lib/omni-tools";

interface GeminiCoreChatProps {
  routeId: OmniRouteId | string;
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
  onSelectRoute?: (id: OmniRouteId) => void;
  onSelectView?: (id: AppViewId) => void;
}

/** Full-screen OmniMind OS — glass layout + chat workspace */
export function GeminiCoreChat({
  routeId,
  userId,
  conversationId,
  onConversationId,
  displayName = "Usama",
  onNewChat,
  onMenuToggle,
  secureNodeActive,
  onSelectRoute,
  onSelectView,
}: GeminiCoreChatProps) {
  return (
    <OmniMindOS
      routeId={routeId}
      userId={userId}
      conversationId={conversationId}
      onConversationId={onConversationId}
      displayName={displayName}
      onNewChat={onNewChat}
      onMenuToggle={onMenuToggle}
      secureNodeActive={secureNodeActive}
      onSelectRoute={onSelectRoute}
      onSelectView={onSelectView}
    />
  );
}
