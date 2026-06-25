import type { GovernanceRole, RoleDefinition, GovernancePermission } from "../types";
import { getRolePermissions, type MedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import { ROLE_MAP } from "../identity/IdentityProvider";

const GOVERNANCE_PERMISSIONS: Record<GovernanceRole, GovernancePermission[]> = {
  doctor: ["emr:read", "emr:write", "ai:request", "prescriptions:write", "imaging:read"],
  specialist: ["emr:read", "emr:write", "ai:request", "imaging:read", "labs:read"],
  nurse: ["emr:read", "vitals:write", "ai:request"],
  radiologist: ["imaging:read", "imaging:upload", "ai:request", "emr:read"],
  "lab-technician": ["labs:read", "labs:import", "emr:read"],
  pharmacist: ["pharmacy:dispense", "prescriptions:read", "emr:read"],
  receptionist: ["appointments:manage", "patient:read"],
  "hospital-administrator": ["his:admin", "staff:manage", "billing:read", "audit:read"],
  auditor: ["audit:read", "audit:export", "compliance:read"],
  "research-user": ["research:read", "ai:request", "emr:read-anonymized"],
  "system-administrator": ["system:config", "security:admin", "backup:manage", "api:manage"],
};

const ROLE_DEFINITIONS: RoleDefinition[] = (Object.keys(GOVERNANCE_PERMISSIONS) as GovernanceRole[]).map((id) => ({
  id,
  label: id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  clinicalRole: ROLE_MAP[id],
  permissions: GOVERNANCE_PERMISSIONS[id],
  departmentScoped: ["nurse", "doctor", "specialist", "radiologist", "lab-technician", "pharmacist"].includes(id),
}));

/** Granular role management — maps to Phase 1 ClinicalRole + module permissions */
export class RoleManagement {
  private customRoles = new Map<string, RoleDefinition>();

  listRoles(): RoleDefinition[] {
    return [...ROLE_DEFINITIONS, ...this.customRoles.values()];
  }

  getRole(id: GovernanceRole | string) {
    return this.customRoles.get(id) ?? ROLE_DEFINITIONS.find((r) => r.id === id);
  }

  hasPermission(role: GovernanceRole, permission: GovernancePermission) {
    return GOVERNANCE_PERMISSIONS[role]?.includes(permission) ?? false;
  }

  /** Bridge to Phase 1 medical permissions */
  hasMedicalPermission(role: GovernanceRole, permission: MedicalPermission) {
    const clinicalRole = ROLE_MAP[role];
    return getRolePermissions(clinicalRole).includes(permission);
  }

  registerCustomRole(def: RoleDefinition) {
    this.customRoles.set(def.id, def);
    return def;
  }

  getPermissionMatrix() {
    return ROLE_DEFINITIONS.map((r) => ({
      role: r.id,
      label: r.label,
      clinicalRole: r.clinicalRole,
      permissions: r.permissions,
      medicalPermissions: getRolePermissions(r.clinicalRole),
    }));
  }
}

let rm: RoleManagement | null = null;

export function getRoleManagement() {
  if (!rm) rm = new RoleManagement();
  return rm;
}
