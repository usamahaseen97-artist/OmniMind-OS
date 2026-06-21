import type { ChatMessage, ChatRole } from "./chat-api";

export const CHAT_STORAGE_KEY = "omnimind_messages";

const VALID_ROLES = new Set<ChatRole>(["user", "assistant", "system"]);

function storageKey(conversationId?: string): string {
  return conversationId ? `${CHAT_STORAGE_KEY}:${conversationId}` : CHAT_STORAGE_KEY;
}

function isChatRole(value: unknown): value is ChatRole {
  return typeof value === "string" && VALID_ROLES.has(value as ChatRole);
}

function isPersistedMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.content === "string" &&
    isChatRole(row.role) &&
    (typeof row.id === "string" || row.id === undefined)
  );
}

function normalizePersistedMessages(
  parsed: unknown[],
  conversationId?: string,
): ChatMessage[] {
  return parsed.map((item, index) => {
    const row = item as ChatMessage;
    const prefix = conversationId ?? "local";
    return {
      id:
        typeof row.id === "string" && row.id.length > 0
          ? row.id
          : `${prefix}-${index}`,
      role: row.role,
      content: row.content,
      ...(Array.isArray(row.images) ? { images: row.images } : {}),
    };
  });
}

/** Load chat history from localStorage with validation and auto-recovery. */
export function loadStoredMessages(conversationId?: string): ChatMessage[] {
  if (typeof window === "undefined") return [];

  const key = storageKey(conversationId);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.warn(
        `[OmniMind] Invalid chat storage format for "${key}". Resetting…`,
      );
      localStorage.removeItem(key);
      return [];
    }

    if (!parsed.every(isPersistedMessage)) {
      console.warn(
        `[OmniMind] Corrupted chat entries in "${key}". Resetting invalid storage…`,
      );
      localStorage.removeItem(key);
      return [];
    }

    return normalizePersistedMessages(parsed, conversationId);
  } catch (error) {
    console.error(`[OmniMind] Failed to load chat history from "${key}":`, error);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return [];
  }
}

/** Persist chat history; skips while messages are mid-stream. */
export function saveStoredMessages(
  messages: ChatMessage[],
  conversationId?: string,
): void {
  if (typeof window === "undefined") return;

  const key = storageKey(conversationId);
  const toSave = messages.filter((m) => !m.streaming);

  try {
    localStorage.setItem(key, JSON.stringify(toSave));
  } catch (error) {
    console.error(`[OmniMind] Failed to save messages to "${key}":`, error);
  }
}

/** Normalize API payloads that may be an array or `{ messages: [] }`. */
export function normalizeApiMessages(
  data: unknown,
): { role: string; content: string }[] {
  if (Array.isArray(data)) {
    return data.filter(
      (m): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        typeof (m as { role?: unknown }).role === "string" &&
        typeof (m as { content?: unknown }).content === "string",
    );
  }
  if (data && typeof data === "object" && "messages" in data) {
    const inner = (data as { messages: unknown }).messages;
    return normalizeApiMessages(inner);
  }
  console.warn("[OmniMind] Unexpected messages API shape:", data);
  return [];
}
