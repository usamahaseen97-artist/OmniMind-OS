import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { DbLaboratoryAuditEntry } from "../models/schema";

export type LaboratoryPermission =
  | "lab:read"
  | "lab:import"
  | "lab:export"
  | "vitals:read"
  | "vitals:write"
  | "monitoring:read"
  | "alerts:manage"
  | "lab:ai";

const ROLE_LAB: Record<ClinicalRole, LaboratoryPermission[]> = {
  physician: ["lab:read", "lab:import", "lab:export", "vitals:read", "vitals:write", "monitoring:read", "alerts:manage", "lab:ai"],
  nurse: ["lab:read", "lab:import", "vitals:read", "vitals:write", "monitoring:read", "alerts:manage"],
  radiologist: ["lab:read", "vitals:read", "monitoring:read"],
  pathologist: ["lab:read", "lab:import", "lab:export", "lab:ai"],
  admin: ["lab:read", "lab:export", "monitoring:read", "alerts:manage"],
  researcher: ["lab:read", "lab:ai", "monitoring:read"],
  viewer: ["lab:read", "vitals:read", "monitoring:read"],
};

export class LaboratoryAccessControl {
  can(role: ClinicalRole, permission: LaboratoryPermission) {
    return ROLE_LAB[role]?.includes(permission) ?? false;
  }

  assert(role: ClinicalRole, permission: LaboratoryPermission) {
    if (!this.can(role, permission)) throw new Error(`Unauthorized: ${permission}`);
    if (!hasMedicalPermission(role, "patient:read")) throw new Error("Unauthorized: patient:read");
  }

  private auditLog: DbLaboratoryAuditEntry[] = [];

  audit(entry: Omit<DbLaboratoryAuditEntry, "id" | "timestamp">) {
    const record = { ...entry, id: `lab-audit-${Date.now()}`, timestamp: new Date().toISOString() };
    this.auditLog.unshift(record);
    return record;
  }

  getAuditLog(patientId?: string) {
    return patientId ? this.auditLog.filter((e) => e.patientId === patientId) : this.auditLog;
  }
}

let ac: LaboratoryAccessControl | null = null;

export function getLaboratoryAccessControl() {
  if (!ac) ac = new LaboratoryAccessControl();
  return ac;
}
