import { getBackendUrl } from "./backend-url";

export { getBackendUrl as getApiBaseUrl } from "./backend-url";

function apiBase() {
  return getBackendUrl();
}

export type ChatRecord = {
  id: string;
  title: string;
  category?: string;
  agent_id?: string;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
};

export const getChats = async (user: { id: string }): Promise<{ chats: ChatRecord[] }> => {
  void user;
  const response = await fetch(`${apiBase()}/api/chat/sessions`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch chats");
  }
  const sessions = (await response.json()) as ChatRecord[];
  return {
    chats: sessions.map((session) => ({
      ...session,
      updated_at: session.updated_at ?? session.created_at,
    })),
  };
};

export const createChat = async (
  user: { id: string },
  title = "New Chat",
  agentId = "sovereign-core",
): Promise<{ id: string }> => {
  void user;
  void agentId;
  const response = await fetch(`${apiBase()}/api/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      category: "Recents",
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to create chat");
  }
  return response.json();
};

export const getChatMessages = async (chatId: string) => {
  const response = await fetch(`${apiBase()}/api/chat/sessions/${chatId}/messages`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  const data: unknown = await response.json();
  if (Array.isArray(data)) {
    return data as { role: string; content: string }[];
  }
  if (data && typeof data === "object" && Array.isArray((data as { messages?: unknown }).messages)) {
    return (data as { messages: { role: string; content: string }[] }).messages;
  }
  return [];
};

export const appendChatMessage = async (
  chatId: string,
  message: { role: "user" | "assistant"; content: string; title?: string },
) => {
  const response = await fetch(`${apiBase()}/api/chat/sessions/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: message.role,
      content: message.content,
      title: message.title ?? "New Chat",
      category: "Recents",
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to append chat message");
  }
  return response.json();
};
