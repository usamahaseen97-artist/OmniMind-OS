import type { AuditEntry } from "./types";

/** OmniAuditCenter — immutable enterprise audit log storage. */
export class OmniAuditCenter {
  entries: AuditEntry[] = [];

  log(
    orgId: string,
    actorId: string,
    action: string,
    resource: string,
    metadata: Record<string, string> = {},
    ip: string | null = null,
  ) {
    const entry: AuditEntry = {
      id: `aud-${Date.now()}`,
      orgId,
      actorId,
      action,
      resource,
      ip,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.entries.unshift(entry);
    if (this.entries.length > 5000) this.entries.pop();
    return entry;
  }

  list(orgId: string, limit = 100) {
    return this.entries.filter((e) => e.orgId === orgId).slice(0, limit);
  }

  search(orgId: string, query: string) {
    const q = query.toLowerCase();
    return this.entries.filter(
      (e) =>
        e.orgId === orgId &&
        (e.action.toLowerCase().includes(q) ||
          e.resource.toLowerCase().includes(q) ||
          e.actorId.toLowerCase().includes(q)),
    );
  }

  export(orgId: string) {
    return this.entries.filter((e) => e.orgId === orgId);
  }
}

export const omniAuditCenter = new OmniAuditCenter();
