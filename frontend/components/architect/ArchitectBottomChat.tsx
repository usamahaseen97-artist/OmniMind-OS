"use client";

import { useCallback, useRef, useState } from "react";
import { getOmniTool } from "../../lib/omni-tools";
import { streamChat, type ChatMessage } from "../../lib/chat-api";
import {
  interceptAgentOutput,
  resetStreamAccumulator,
} from "../../lib/agent-output-interceptor";
import {
  applyWorkbenchStreamToken,
  beginWorkbenchStream,
  endWorkbenchStream,
  pushWorkbenchStatus,
} from "../../lib/workbench-live-store";
import { ChatInput } from "../chat/ChatInput";
import { cn } from "../../lib/utils";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ArchitectBottomChatProps {
  routeId: string;
  userId?: string;
  onUserMessage?: (text: string) => void;
  onAssistantComplete?: (text: string) => void;
}

export function ArchitectBottomChat({
  routeId,
  userId = "guest-founder",
  onUserMessage,
  onAssistantComplete,
}: ArchitectBottomChatProps) {
  const tool = getOmniTool(routeId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const assistantRef = useRef("");

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;
      onUserMessage?.(q);
      const userMsg: ChatMessage = { id: uid(), role: "user", content: q };
      const assistantId = uid();
      assistantRef.current = "";
      setMessages((prev) => [
        ...prev.slice(-4),
        userMsg,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setInput("");
      setLoading(true);
      abortRef.current = new AbortController();
      resetStreamAccumulator();
      beginWorkbenchStream(routeId, q);
      interceptAgentOutput(routeId, "start", { userPrompt: q });

      try {
        await streamChat(
          {
            message: q,
            user_id: userId,
            agent_id: tool.agentId,
            history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            skip_proactive: true,
          },
          {
            onToken: (token) => {
              assistantRef.current += token;
              interceptAgentOutput(routeId, "token", { token, userPrompt: q });
              applyWorkbenchStreamToken(routeId, token, assistantRef.current);
              pushWorkbenchStatus(routeId, "Building from prompt…");
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantRef.current } : m,
                ),
              );
            },
            onDone: () => {
              interceptAgentOutput(routeId, "done", { userPrompt: q });
              endWorkbenchStream(routeId);
              setLoading(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, streaming: false } : m,
                ),
              );
              if (assistantRef.current.trim()) {
                onAssistantComplete?.(assistantRef.current);
              }
            },
            onError: (err) => {
              interceptAgentOutput(routeId, "engine_failure", { userPrompt: q });
              endWorkbenchStream(routeId);
              setLoading(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: err, streaming: false } : m,
                ),
              );
            },
          },
          abortRef.current.signal,
        );
      } catch {
        setLoading(false);
      }
    },
    [loading, messages, onAssistantComplete, onUserMessage, tool.agentId, userId],
  );

  const lastReply = messages.filter((m) => m.role === "assistant").at(-1);

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      {lastReply?.content ? (
        <p
          className={cn(
            "history-scroll-hover line-clamp-2 max-h-8 overflow-y-auto px-1 text-[10px] leading-snug text-zinc-500",
            lastReply.streaming && "text-emerald-400/80",
          )}
        >
          {lastReply.content.slice(0, 200)}
          {lastReply.content.length > 200 ? "…" : ""}
        </p>
      ) : (
        <p className="px-1 text-[10px] text-zinc-600">
          Describe your project — stack picks happen in the workspace above.
        </p>
      )}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => void send(input)}
        onStop={() => abortRef.current?.abort()}
        loading={loading}
        variant="floating"
      />
    </div>
  );
}
