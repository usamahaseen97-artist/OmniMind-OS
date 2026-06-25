"use client";

import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { memo, useCallback } from "react";
import { VirtualList } from "../../lib/shared/virtual-list";

export type Conversation = { id: string; title: string };

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

const ConversationRow = memo(function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
        active
          ? "bg-neon-green/10 text-neon-green ring-1 ring-neon-green/25"
          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
      }`}
    >
      <MessagesSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{conversation.title}</span>
    </button>
  );
});

export const ConversationList = memo(function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationListProps) {
  const renderItem = useCallback(
    (c: Conversation) => (
      <ConversationRow conversation={c} active={activeId === c.id} onSelect={onSelect} />
    ),
    [activeId, onSelect],
  );

  return (
    <div className="flex flex-col gap-2 p-3">
      <button
        type="button"
        onClick={onNew}
        className="flex items-center gap-2 rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2.5 text-xs font-semibold text-neon-green transition hover:bg-neon-green/20"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </button>
      <p className="px-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        Conversations
      </p>
      <VirtualList
        items={conversations}
        className="flex-1 space-y-1"
        style={{ maxHeight: "100%" }}
        estimateSize={36}
        threshold={20}
        renderItem={renderItem}
      />
    </div>
  );
});
