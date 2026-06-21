"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getChatMessages } from "../lib/api";
import type { ChatMessage } from "../lib/chat-api";
import {
  agentChatMapKey,
  chatStorageScope,
  loadAgentChatMap,
  loadRouteMessages,
  saveRouteMessages,
  type AgentChatsMap,
} from "../lib/agent-chat-storage";
import { normalizeApiMessages } from "../lib/chat-storage";

interface UseAgentChatMessagesOptions {
  routeId: string;
  userId: string;
  parentConversationId?: string;
}

export function useAgentChatMessages({
  routeId,
  userId,
  parentConversationId,
}: UseAgentChatMessagesOptions) {
  const scope = chatStorageScope(undefined, userId);
  const mapKey = agentChatMapKey(routeId, parentConversationId);

  const agentChatsRef = useRef<AgentChatsMap>({});
  const messagesRef = useRef<ChatMessage[]>([]);
  const prevMapKeyRef = useRef(mapKey);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const persistReadyRef = useRef(false);

  messagesRef.current = messages;

  const applyRouteMessages = useCallback((key: string, next: ChatMessage[]) => {
    agentChatsRef.current[key] = next;
    setMessages(next);
  }, []);

  useEffect(() => {
    const prev = prevMapKeyRef.current;
    if (prev === mapKey) return;

    saveRouteMessages(scope, prev, messagesRef.current);
    agentChatsRef.current[prev] = messagesRef.current;

    prevMapKeyRef.current = mapKey;
    const map = loadAgentChatMap(scope);
    const next = map[mapKey] ?? [];
    agentChatsRef.current = { ...map, [mapKey]: next };
    applyRouteMessages(mapKey, next);
    persistReadyRef.current = true;
  }, [mapKey, scope, applyRouteMessages]);

  useEffect(() => {
    persistReadyRef.current = false;
    const map = loadAgentChatMap(scope);
    const local = map[mapKey]?.length ? map[mapKey] : loadRouteMessages(scope, mapKey);
    map[mapKey] = local ?? [];
    agentChatsRef.current = map;
    applyRouteMessages(mapKey, local ?? []);

    const convId = routeId === "dashboard" ? parentConversationId : undefined;

    if (!convId) {
      persistReadyRef.current = true;
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);

    void (async () => {
      try {
        const stored = await getChatMessages(convId);
        if (cancelled) return;
        const normalized = normalizeApiMessages(stored);
        const hydrated: ChatMessage[] = normalized.map((m, i) => ({
          id: `${convId}-${i}`,
          role: (m.role === "assistant" ? "assistant" : "user") as ChatMessage["role"],
          content: m.content,
        }));
        agentChatsRef.current[mapKey] = hydrated;
        applyRouteMessages(mapKey, hydrated);
      } catch (error) {
        console.error("[OmniMind] Failed to fetch chat history:", error);
        if (!cancelled) applyRouteMessages(mapKey, local ?? []);
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
          persistReadyRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scope, mapKey, routeId, parentConversationId, applyRouteMessages]);

  useEffect(() => {
    if (!persistReadyRef.current) return;
    agentChatsRef.current[mapKey] = messages;
    saveRouteMessages(scope, mapKey, messages);
  }, [messages, mapKey, scope]);

  const setMessagesForRoute = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setMessages((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        agentChatsRef.current[mapKey] = next;
        messagesRef.current = next;
        return next;
      });
    },
    [mapKey],
  );

  return {
    messages,
    setMessages: setMessagesForRoute,
    loadingHistory,
    agentChatsRef,
  };
}
