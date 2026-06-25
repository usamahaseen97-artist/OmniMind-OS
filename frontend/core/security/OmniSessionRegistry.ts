import type { AuthSession } from "./types";

/** OmniSessionRegistry — multi-device session management. */
export class OmniSessionRegistry {
  sessions: AuthSession[] = [];

  register(session: AuthSession) {
    this.sessions.push(session);
    return session;
  }

  list(userId: string) {
    return this.sessions.filter((s) => s.userId === userId);
  }

  touch(sessionId: string) {
    const s = this.sessions.find((x) => x.id === sessionId);
    if (!s) return null;
    s.lastActiveAt = new Date().toISOString();
    return s;
  }

  revoke(sessionId: string) {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx < 0) return false;
    this.sessions.splice(idx, 1);
    return true;
  }

  revokeAllExcept(userId: string, keepSessionId: string) {
    this.sessions = this.sessions.filter(
      (s) => s.userId !== userId || s.id === keepSessionId,
    );
  }

  expired() {
    const now = Date.now();
    return this.sessions.filter((s) => new Date(s.expiresAt).getTime() < now);
  }

  purgeExpired() {
    const now = Date.now();
    this.sessions = this.sessions.filter((s) => new Date(s.expiresAt).getTime() >= now);
  }
}

export const omniSessionRegistry = new OmniSessionRegistry();
