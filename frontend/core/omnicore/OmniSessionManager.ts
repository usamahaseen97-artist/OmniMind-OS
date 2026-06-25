import type { OmniSession, OmniToolSlug } from "./types";
import { omniEventBus } from "./OmniEventBus";

/** User session tracking — active tool and project. */
export class OmniSessionManager {
  session: OmniSession = {
    id: `sess-${Date.now()}`,
    userId: null,
    startedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    activeToolSlug: null,
    activeProjectId: null,
  };

  get() {
    return { ...this.session };
  }

  touch() {
    this.session.lastActiveAt = new Date().toISOString();
    return this.session;
  }

  setUser(userId: string | null) {
    this.session.userId = userId;
    this.touch();
  }

  setActiveTool(toolSlug: OmniToolSlug | null) {
    this.session.activeToolSlug = toolSlug;
    this.touch();
  }

  setActiveProject(projectId: string | null) {
    this.session.activeProjectId = projectId;
    this.touch();
  }

  start() {
    this.session = {
      id: `sess-${Date.now()}`,
      userId: this.session.userId,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      activeToolSlug: null,
      activeProjectId: null,
    };
    omniEventBus.publish("session:started", { sessionId: this.session.id });
    return this.session;
  }
}

export const omniSessionManager = new OmniSessionManager();
