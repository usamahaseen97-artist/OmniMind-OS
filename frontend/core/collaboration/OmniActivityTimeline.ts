import type { ActivityEvent } from "./types";

/** OmniActivityTimeline — searchable project, asset, system, and AI event history. */
export class OmniActivityTimeline {
  events: ActivityEvent[] = [
    {
      id: "evt-1",
      orgId: "org-1",
      kind: "project",
      action: "project.created",
      actorId: "user-1",
      targetId: "uproj-001",
      summary: "Created project OmniCore Foundation",
      timestamp: new Date().toISOString(),
    },
    {
      id: "evt-2",
      orgId: "org-1",
      kind: "ai",
      action: "ai.inference",
      actorId: "user-2",
      targetId: "agent-default",
      summary: "AI agent completed task planning",
      timestamp: new Date().toISOString(),
    },
  ];

  record(event: Omit<ActivityEvent, "id" | "timestamp">) {
    const evt: ActivityEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(evt);
    if (this.events.length > 2000) this.events.pop();
    return evt;
  }

  list(orgId?: string, kind?: ActivityEvent["kind"]) {
    return this.events.filter(
      (e) => (!orgId || e.orgId === orgId) && (!kind || e.kind === kind),
    );
  }

  search(query: string, orgId?: string) {
    const q = query.toLowerCase();
    return this.list(orgId).filter(
      (e) =>
        e.summary.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.targetId.toLowerCase().includes(q),
    );
  }

  recent(orgId: string, limit = 20) {
    return this.list(orgId).slice(0, limit);
  }
}

export const omniActivityTimeline = new OmniActivityTimeline();
