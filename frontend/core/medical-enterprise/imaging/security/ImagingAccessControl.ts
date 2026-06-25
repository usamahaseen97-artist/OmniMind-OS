import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { DbImagingAuditEntry } from "../models/schema";

export type ImagingPermission = "imaging:read" | "imaging:upload" | "imaging:annotate" | "imaging:export" | "imaging:ai";

const ROLE_IMAGING: Record<ClinicalRole, ImagingPermission[]> = {
  physician: ["imaging:read", "imaging:upload", "imaging:annotate", "imaging:export", "imaging:ai"],
  nurse: ["imaging:read", "imaging:upload"],
  radiologist: ["imaging:read", "imaging:upload", "imaging:annotate", "imaging:export", "imaging:ai"],
  pathologist: ["imaging:read", "imaging:annotate", "imaging:ai"],
  admin: ["imaging:read", "imaging:export"],
  researcher: ["imaging:read", "imaging:ai"],
  viewer: ["imaging:read"],
};

export class ImagingAccessControl {
  can(role: ClinicalRole, permission: ImagingPermission) {
    return ROLE_IMAGING[role]?.includes(permission) ?? false;
  }

  assert(role: ClinicalRole, permission: ImagingPermission) {
    if (!this.can(role, permission)) throw new Error(`Unauthorized: ${permission}`);
    if (!hasMedicalPermission(role, "patient:read")) throw new Error("Unauthorized: patient:read");
  }

  private auditLog: DbImagingAuditEntry[] = [];

  audit(entry: Omit<DbImagingAuditEntry, "id" | "timestamp">) {
    const record = { ...entry, id: `img-audit-${Date.now()}`, timestamp: new Date().toISOString() };
    this.auditLog.unshift(record);
    return record;
  }

  getAuditLog(patientId?: string) {
    return patientId ? this.auditLog.filter((e) => e.patientId === patientId) : this.auditLog;
  }
}

let ac: ImagingAccessControl | null = null;

export function getImagingAccessControl() {
  if (!ac) ac = new ImagingAccessControl();
  return ac;
}
