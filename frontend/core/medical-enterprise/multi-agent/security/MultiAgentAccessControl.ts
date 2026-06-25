import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { DbMultiAgentAuditEntry } from "../models/schema";

export type MultiAgentPermission =
  | "multi-agent:read"
  | "multi-agent:run"
  | "multi-agent:conversation"
  | "multi-agent:voice"
  | "multi-agent:document"
  | "multi-agent:replay";

const ROLE_PERMS: Record<ClinicalRole, MultiAgentPermission[]> = {
  physician: ["multi-agent:read", "multi-agent:run", "multi-agent:conversation", "multi-agent:voice", "multi-agent:document", "multi-agent:replay"],
  nurse: ["multi-agent:read", "multi-agent:run", "multi-agent:conversation", "multi-agent:voice"],
  radiologist: ["multi-agent:read", "multi-agent:run", "multi-agent:conversation"],
  pathologist: ["multi-agent:read", "multi-agent:run", "multi-agent:document"],
  admin: ["multi-agent:read", "multi-agent:replay"],
  researcher: ["multi-agent:read", "multi-agent:run", "multi-agent:replay"],
  viewer: ["multi-agent:read"],
};

export class MultiAgentAccessControl {
  can(role: ClinicalRole, permission: MultiAgentPermission) {
    return ROLE_PERMS[role]?.includes(permission) ?? false;
  }

  assert(role: ClinicalRole, permission: MultiAgentPermission) {
    if (!this.can(role, permission)) throw new Error(`Unauthorized: ${permission}`);
    if (!hasMedicalPermission(role, "patient:read")) throw new Error("Unauthorized: patient:read");
  }

  private auditLog: DbMultiAgentAuditEntry[] = [];

  audit(entry: Omit<DbMultiAgentAuditEntry, "id" | "timestamp">) {
    const record = { ...entry, id: `ma-audit-${Date.now()}`, timestamp: new Date().toISOString() };
    this.auditLog.unshift(record);
    return record;
  }

  getAuditLog(patientId?: string) {
    return patientId ? this.auditLog.filter((e) => e.patientId === patientId) : this.auditLog;
  }

  replaySession(sessionId: string) {
    return this.auditLog.filter((e) => e.sessionId === sessionId);
  }
}

let ac: MultiAgentAccessControl | null = null;

export function getMultiAgentAccessControl() {
  if (!ac) ac = new MultiAgentAccessControl();
  return ac;
}
