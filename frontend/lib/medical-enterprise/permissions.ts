import type { ClinicalRole } from "./types";

export type MedicalPermission =
  | "patient:read"
  | "patient:write"
  | "records:read"
  | "records:write"
  | "imaging:read"
  | "imaging:upload"
  | "prescriptions:read"
  | "prescriptions:write"
  | "ai:request"
  | "ai:approve"
  | "audit:read"
  | "admin:settings"
  | "emergency:override";

const ROLE_PERMISSIONS: Record<ClinicalRole, MedicalPermission[]> = {
  physician: [
    "patient:read",
    "patient:write",
    "records:read",
    "records:write",
    "imaging:read",
    "imaging:upload",
    "prescriptions:read",
    "prescriptions:write",
    "ai:request",
    "ai:approve",
    "audit:read",
    "emergency:override",
  ],
  nurse: [
    "patient:read",
    "patient:write",
    "records:read",
    "records:write",
    "imaging:read",
    "prescriptions:read",
    "ai:request",
    "audit:read",
  ],
  radiologist: ["patient:read", "records:read", "imaging:read", "imaging:upload", "ai:request", "audit:read"],
  pathologist: ["patient:read", "records:read", "records:write", "ai:request", "audit:read"],
  admin: ["patient:read", "audit:read", "admin:settings"],
  researcher: ["patient:read", "records:read", "ai:request", "audit:read"],
  viewer: ["patient:read", "records:read", "imaging:read"],
};

export function hasMedicalPermission(role: ClinicalRole, permission: MedicalPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: ClinicalRole): MedicalPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
