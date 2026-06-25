import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { DbHISAuditEntry } from "../models/schema";

export type HISPermission =
  | "his:read"
  | "his:admin"
  | "his:emr"
  | "his:appointments"
  | "his:pharmacy"
  | "his:billing"
  | "his:staff"
  | "his:analytics";

const ROLE_HIS: Record<ClinicalRole, HISPermission[]> = {
  physician: ["his:read", "his:emr", "his:appointments", "his:analytics"],
  nurse: ["his:read", "his:emr", "his:appointments"],
  radiologist: ["his:read", "his:emr"],
  pathologist: ["his:read", "his:emr"],
  admin: ["his:read", "his:admin", "his:emr", "his:appointments", "his:pharmacy", "his:billing", "his:staff", "his:analytics"],
  researcher: ["his:read", "his:analytics"],
  viewer: ["his:read"],
};

export class HISAccessControl {
  private departmentPermissions = new Map<string, HISPermission[]>();

  can(role: ClinicalRole, permission: HISPermission, departmentId?: string) {
    if (departmentId) {
      const deptPerms = this.departmentPermissions.get(departmentId);
      if (deptPerms && !deptPerms.includes(permission)) return false;
    }
    return ROLE_HIS[role]?.includes(permission) ?? false;
  }

  assert(role: ClinicalRole, permission: HISPermission, departmentId?: string) {
    if (!this.can(role, permission, departmentId)) throw new Error(`Unauthorized: ${permission}`);
    if (!hasMedicalPermission(role, "patient:read")) throw new Error("Unauthorized: patient:read");
  }

  setDepartmentPermissions(departmentId: string, permissions: HISPermission[]) {
    this.departmentPermissions.set(departmentId, permissions);
  }

  private auditLog: DbHISAuditEntry[] = [];

  audit(entry: Omit<DbHISAuditEntry, "id" | "timestamp">) {
    const record = { ...entry, id: `his-audit-${Date.now()}`, timestamp: new Date().toISOString() };
    this.auditLog.unshift(record);
    return record;
  }

  getAuditLog(patientId?: string) {
    return patientId ? this.auditLog.filter((e) => e.patientId === patientId) : this.auditLog;
  }
}

let ac: HISAccessControl | null = null;

export function getHISAccessControl() {
  if (!ac) ac = new HISAccessControl();
  return ac;
}
