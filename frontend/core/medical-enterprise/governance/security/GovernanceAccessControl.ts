import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { GovernanceRole } from "../types";
import { ROLE_MAP } from "../identity/IdentityProvider";

export type GovernancePermission =
  | "governance:read"
  | "governance:admin"
  | "audit:read"
  | "audit:export"
  | "consent:manage"
  | "compliance:read"
  | "compliance:configure"
  | "security:admin"
  | "backup:manage"
  | "api:manage"
  | "sessions:manage";

const ROLE_GOV: Record<GovernanceRole, GovernancePermission[]> = {
  doctor: ["governance:read", "consent:manage"],
  specialist: ["governance:read", "consent:manage"],
  nurse: ["governance:read", "consent:manage"],
  radiologist: ["governance:read"],
  "lab-technician": ["governance:read"],
  pharmacist: ["governance:read"],
  receptionist: ["governance:read", "consent:manage"],
  "hospital-administrator": ["governance:read", "governance:admin", "audit:read", "consent:manage", "compliance:read", "backup:manage"],
  auditor: ["governance:read", "audit:read", "audit:export", "compliance:read"],
  "research-user": ["governance:read"],
  "system-administrator": ["governance:read", "governance:admin", "audit:read", "audit:export", "compliance:read", "compliance:configure", "security:admin", "backup:manage", "api:manage", "sessions:manage"],
};

export class GovernanceAccessControl {
  can(role: GovernanceRole | ClinicalRole, permission: GovernancePermission) {
    const govRole = this.toGovernanceRole(role);
    return ROLE_GOV[govRole]?.includes(permission) ?? false;
  }

  assert(role: GovernanceRole | ClinicalRole, permission: GovernancePermission) {
    if (!this.can(role, permission)) throw new Error(`Unauthorized: ${permission}`);
    const clinical = this.toClinicalRole(role);
    if (!hasMedicalPermission(clinical, "patient:read") && permission !== "governance:admin" && permission !== "security:admin") {
      throw new Error("Unauthorized: patient:read");
    }
  }

  toClinicalRole(role: GovernanceRole | ClinicalRole): ClinicalRole {
    if (role in ROLE_MAP) return ROLE_MAP[role as GovernanceRole];
    return role as ClinicalRole;
  }

  private toGovernanceRole(role: GovernanceRole | ClinicalRole): GovernanceRole {
    if (role in ROLE_GOV) return role as GovernanceRole;
    const entry = Object.entries(ROLE_MAP).find(([, v]) => v === role);
    return (entry?.[0] as GovernanceRole) ?? "receptionist";
  }
}

let ac: GovernanceAccessControl | null = null;

export function getGovernanceAccessControl() {
  if (!ac) ac = new GovernanceAccessControl();
  return ac;
}
