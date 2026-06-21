/** Cross-component signal to refresh sidebar chat history. */
export const CHATS_UPDATED = "omnimind:chats-updated";

export function notifyChatsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHATS_UPDATED));
  }
}
