"use client";

import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { cn } from "../../lib/utils";
interface CoreToolsSidebarProps {
  userId: string;
  conversationId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat?: () => void;
  className?: string;
}

/**
 * Left column — chat history only (tools live in the global ☰ drawer).
 */
export function CoreToolsSidebar({
  userId,
  conversationId,
  onSelectSession,
  onNewChat,
  className,
}: CoreToolsSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[min(260px,88vw)] shrink-0 flex-col overflow-hidden",
        "border-r border-gray-800/60 bg-[#15171E]",
        className,
      )}
    >
      <div className="shrink-0 border-b border-gray-800/60 px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#10B981]">
          Chat History
        </p>
        <p className="mt-0.5 text-[10px] text-zinc-600">
          Agents · use ☰ menu
        </p>
      </div>
      <div className="history-scroll-hover min-h-0 flex-1 overflow-hidden">
        <ChatHistoryPanel
          userId={userId}
          activeSessionId={conversationId}
          onSelectSession={onSelectSession}
          onNewChat={onNewChat}
          embedded
        />
      </div>
    </aside>
  );
}
