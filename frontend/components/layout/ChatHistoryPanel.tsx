"use client";

import { History, Loader2, MessageSquarePlus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createChat, getChats, type ChatRecord } from "../../lib/api";
import { CHATS_UPDATED } from "../../lib/chat-events";
import { cn } from "../../lib/utils";

interface ChatHistoryPanelProps {
  userId: string;
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat?: () => void;
  /** Compact chrome — header rendered by parent flyout */
  embedded?: boolean;
  /** Inside floating flyout (fixed max height scroll) */
  floating?: boolean;
}

export function ChatHistoryPanel({
  userId,
  activeSessionId,
  onSelectSession,
  onNewChat,
  embedded = false,
  floating = false,
}: ChatHistoryPanelProps) {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const timeout = new Promise<never>((_, reject) =>
        window.setTimeout(() => reject(new Error("timeout")), 3000),
      );
      const data = await Promise.race([getChats({ id: userId }), timeout]);
      const list = data.chats ?? [];
      list.sort((a, b) => {
        const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return tb - ta;
      });
      setChats(list);
    } catch {
      setError(null);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onUpdate = () => void load();
    window.addEventListener(CHATS_UPDATED, onUpdate);
    return () => window.removeEventListener(CHATS_UPDATED, onUpdate);
  }, [load]);

  const handleNew = async () => {
    try {
      const chat = await createChat({ id: userId }, "New Chat");
      await load();
      onNewChat?.();
      onSelectSession(chat.id);
    } catch {
      setError("Failed to create chat");
    }
  };

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col",
        floating
          ? "max-h-[320px] bg-transparent"
          : embedded
            ? "h-full flex-1 bg-[#15171E]"
            : "min-h-[200px] shrink-0 border-t border-gray-800/60 bg-[#15171E]",
      )}
    >
      <div className="flex shrink-0 items-center justify-end gap-0.5 border-b border-gray-800/60 px-3 py-2">
        {!embedded ? (
          <p className="mr-auto text-[10px] font-bold uppercase tracking-[0.22em] text-[#10B981]">
            Chat History
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void load()}
          title="Refresh"
          className="rounded-md p-1.5 text-zinc-500 transition hover:bg-[#10B981]/10 hover:text-[#10B981]"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
        <button
          type="button"
          onClick={() => void handleNew()}
          title="New chat"
          className="rounded-md p-1.5 text-zinc-500 transition hover:bg-[#10B981]/10 hover:text-[#10B981]"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className={cn(
          "history-scroll-hover min-h-0 overflow-y-auto px-2 py-2",
          floating ? "max-h-[280px] flex-1" : "flex-1",
        )}
      >
        {loading && chats.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[10px] text-zinc-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#10B981]" />
            Loading sessions…
          </div>
        ) : error ? (
          <p className="px-2 py-3 text-[10px] text-red-400/90">{error}</p>
        ) : chats.length === 0 ? (
          <p className="px-2 py-4 text-center text-[10px] text-zinc-600">
            No chats yet — start a new conversation
          </p>
        ) : (
          <ul className="space-y-1">
            {chats.map((c) => {
              const active = activeSessionId === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSession(c.id)}
                    className={cn(
                      "group flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-150",
                      active
                        ? "bg-zinc-800/90 shadow-[0_0_18px_rgba(113,113,122,0.18)] ring-1 ring-zinc-600/80"
                        : "hover:bg-zinc-800/45 hover:ring-1 hover:ring-zinc-700/70",
                    )}
                  >
                    <History
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors",
                        active ? "text-zinc-100" : "text-zinc-600 group-hover:text-zinc-300",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[11px] font-medium leading-snug",
                          active ? "text-zinc-50" : "text-zinc-200",
                        )}
                      >
                        {c.title || "Untitled"}
                      </span>
                      {(c.category || c.updated_at) && (
                        <span className="mt-0.5 block truncate text-[9px] text-zinc-600">
                          {c.category ? `${c.category}${c.updated_at ? " · " : ""}` : ""}
                          {c.updated_at
                            ? new Date(c.updated_at).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : ""}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
