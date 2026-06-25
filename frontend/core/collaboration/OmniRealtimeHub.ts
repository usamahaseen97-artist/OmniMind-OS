import { omniPresence } from "./OmniPresence";
import type { SharedSession } from "./types";

type RealtimeEvent =
  | { type: "presence"; payload: unknown }
  | { type: "typing"; payload: { userId: string; resourceId: string | null } }
  | { type: "cursor"; payload: { userId: string; x: number; y: number; resourceId: string } }
  | { type: "edit"; payload: { resourceId: string; op: unknown } }
  | { type: "notification"; payload: unknown };

type Listener = (event: RealtimeEvent) => void;

/** OmniRealtimeHub — shared sessions, live editing, conflict resolution architecture. */
export class OmniRealtimeHub {
  sessions: SharedSession[] = [];
  private listeners = new Set<Listener>();
  private conflictQueue: Array<{ resourceId: string; ops: unknown[] }> = [];

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: RealtimeEvent) {
    this.listeners.forEach((l) => l(event));
  }

  joinSession(resourceId: string, resourceType: SharedSession["resourceType"], userId: string) {
    let session = this.sessions.find((s) => s.resourceId === resourceId);
    if (!session) {
      session = {
        id: `sess-${Date.now()}`,
        resourceId,
        resourceType,
        participantIds: [],
        startedAt: new Date().toISOString(),
      };
      this.sessions.push(session);
    }
    if (!session.participantIds.includes(userId)) {
      session.participantIds.push(userId);
    }
    omniPresence.setStatus(userId, "online");
    return session;
  }

  leaveSession(resourceId: string, userId: string) {
    const session = this.sessions.find((s) => s.resourceId === resourceId);
    if (!session) return;
    session.participantIds = session.participantIds.filter((id) => id !== userId);
    if (session.participantIds.length === 0) {
      this.sessions = this.sessions.filter((s) => s.id !== session!.id);
    }
  }

  broadcastTyping(userId: string, resourceId: string | null) {
    omniPresence.setTyping(userId, resourceId);
    this.emit({ type: "typing", payload: { userId, resourceId } });
  }

  broadcastCursor(userId: string, x: number, y: number, resourceId: string) {
    omniPresence.setCursor(userId, { x, y, resourceId });
    this.emit({ type: "cursor", payload: { userId, x, y, resourceId } });
  }

  pushEdit(resourceId: string, op: unknown) {
    this.emit({ type: "edit", payload: { resourceId, op } });
  }

  /** Last-write-wins conflict resolution placeholder. */
  resolveConflict(resourceId: string, ops: unknown[]) {
    this.conflictQueue.push({ resourceId, ops });
    return ops[ops.length - 1];
  }

  activeSessions() {
    return this.sessions;
  }

  clearListeners() {
    this.listeners.clear();
  }

  clearStaleSessions(maxAgeMs = 3_600_000) {
    const cutoff = Date.now() - maxAgeMs;
    this.sessions = this.sessions.filter((s) => new Date(s.startedAt).getTime() > cutoff);
    if (this.conflictQueue.length > 100) {
      this.conflictQueue = this.conflictQueue.slice(-50);
    }
  }
}

export const omniRealtimeHub = new OmniRealtimeHub();
