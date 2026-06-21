"use client";

import { MessageSquarePlus, MessagesSquare } from "lucide-react";

export type Conversation = { id: string; title: string };

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationListProps) {
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
      <div className="flex-1 space-y-1 overflow-y-auto">
        {conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
              activeId === c.id
                ? "bg-neon-green/10 text-neon-green ring-1 ring-neon-green/25"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            <MessagesSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{c.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
