import type { ChatMessage } from "./chat-api";

const AGENT_CHATS_KEY = "omnimind_agent_chats_v1";
const ROUTE_CONV_KEY = "omnimind_route_conversations_v1";

export type AgentChatsMap = Record<string, ChatMessage[]>;

/** One localStorage map per signed-in user (all tool routes live inside it). */
export function chatStorageScope(_conversationId?: string, userId?: string): string {
  if (userId) return `user:${userId}`;
  return "local";
}

/** Map key inside agentChats — dashboard threads are isolated per conversation. */
export function agentChatMapKey(routeId: string, parentConversationId?: string): string {
  if (routeId === "dashboard") {
    return `dashboard:${parentConversationId ?? "draft"}`;
  }
  return routeId;
}

function agentChatsKey(scope: string): string {
  return `${AGENT_CHATS_KEY}:${scope}`;
}

function routeConvKey(userId: string): string {
  return `${ROUTE_CONV_KEY}:${userId}`;
}

export function loadAgentChatMap(scope: string): AgentChatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(agentChatsKey(scope));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as AgentChatsMap;
  } catch {
    return {};
  }
}

export function saveAgentChatMap(scope: string, map: AgentChatsMap): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned: AgentChatsMap = {};
    for (const [route, msgs] of Object.entries(map)) {
      cleaned[route] = msgs.filter((m) => !m.streaming);
    }
    localStorage.setItem(agentChatsKey(scope), JSON.stringify(cleaned));
  } catch (error) {
    console.error("[OmniMind] Failed to save agent chat map:", error);
  }
}

export function loadRouteMessages(scope: string, routeId: string): ChatMessage[] {
  const map = loadAgentChatMap(scope);
  return map[routeId] ?? [];
}

export function saveRouteMessages(
  scope: string,
  routeId: string,
  messages: ChatMessage[],
): void {
  const map = loadAgentChatMap(scope);
  map[routeId] = messages.filter((m) => !m.streaming);
  saveAgentChatMap(scope, map);
}

export function loadRouteConversationIds(userId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(routeConvKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function getRouteConversationId(userId: string, routeId: string): string | undefined {
  return loadRouteConversationIds(userId)[routeId];
}

export function setRouteConversationId(
  userId: string,
  routeId: string,
  conversationId: string,
): void {
  if (typeof window === "undefined") return;
  const map = loadRouteConversationIds(userId);
  map[routeId] = conversationId;
  try {
    localStorage.setItem(routeConvKey(userId), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/**
 * Parent history selection applies only to Sovereign dashboard thread.
 */
export function resolveStreamConversationId(
  routeId: string,
  userId: string,
  parentConversationId?: string,
): string | undefined {
  if (routeId === "dashboard" && parentConversationId) {
    return parentConversationId;
  }
  return getRouteConversationId(userId, routeId);
}
