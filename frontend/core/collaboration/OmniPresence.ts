import type { PresenceState } from "./types";

/** OmniPresence — online status, typing, cursor presence architecture. */
export class OmniPresence {
  private states = new Map<string, PresenceState>();

  setStatus(userId: string, status: PresenceState["status"]) {
    const existing = this.states.get(userId);
    this.states.set(userId, {
      userId,
      status,
      lastSeenAt: new Date().toISOString(),
      typingIn: existing?.typingIn ?? null,
      cursor: existing?.cursor ?? null,
    });
  }

  setTyping(userId: string, resourceId: string | null) {
    const existing = this.states.get(userId);
    this.states.set(userId, {
      userId,
      status: existing?.status ?? "online",
      lastSeenAt: new Date().toISOString(),
      typingIn: resourceId,
      cursor: existing?.cursor ?? null,
    });
  }

  setCursor(userId: string, cursor: PresenceState["cursor"]) {
    const existing = this.states.get(userId);
    this.states.set(userId, {
      userId,
      status: existing?.status ?? "online",
      lastSeenAt: new Date().toISOString(),
      typingIn: existing?.typingIn ?? null,
      cursor,
    });
  }

  get(userId: string) {
    return this.states.get(userId) ?? null;
  }

  list(resourceId?: string) {
    const all = Array.from(this.states.values());
    if (!resourceId) return all;
    return all.filter(
      (s) => s.typingIn === resourceId || s.cursor?.resourceId === resourceId,
    );
  }

  onlineCount() {
    return Array.from(this.states.values()).filter((s) => s.status === "online").length;
  }
}

export const omniPresence = new OmniPresence();
