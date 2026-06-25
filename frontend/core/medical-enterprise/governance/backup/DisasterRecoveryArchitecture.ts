import type { BackupPolicy, DisasterRecoveryPlan } from "../types";
import { getDataSecurityArchitecture } from "../data-security/DataSecurityArchitecture";

/** Backup & disaster recovery architecture */
export class DisasterRecoveryArchitecture {
  private policies: BackupPolicy[] = [
    { id: "bak-daily", name: "Daily Full Backup", schedule: "daily", incremental: false, geoRedundant: true, retentionDays: 30, encrypted: true },
    { id: "bak-hourly", name: "Hourly Incremental", schedule: "hourly", incremental: true, geoRedundant: true, retentionDays: 7, encrypted: true },
  ];

  private plans: DisasterRecoveryPlan[] = [
    { id: "drp-primary", name: "Primary DR Plan", rtoMinutes: 60, rpoMinutes: 15, geoRegions: ["us-east", "eu-west"], status: "active" },
  ];

  private versions: { id: string; timestamp: string; policyId: string }[] = [];

  listPolicies() {
    return [...this.policies];
  }

  listPlans() {
    return [...this.plans];
  }

  async runBackup(policyId: string) {
    const policy = this.policies.find((p) => p.id === policyId);
    if (!policy) throw new Error("Policy not found");
    const wrapped = getDataSecurityArchitecture().wrapBackup({ policyId, timestamp: new Date().toISOString() });
    const version = { id: `ver-${Date.now()}`, timestamp: new Date().toISOString(), policyId };
    this.versions.unshift(version);
    return { version, wrapped, geoRedundant: policy.geoRedundant };
  }

  recoverVersion(versionId: string) {
    const version = this.versions.find((v) => v.id === versionId);
    if (!version) throw new Error("Version not found");
    return { versionId, status: "recovery-initiated", estimatedMinutes: 30 };
  }

  getHighAvailabilityStatus() {
    return { primary: "healthy", secondary: "healthy", failoverReady: true, lastHealthCheck: new Date().toISOString() };
  }
}

let arch: DisasterRecoveryArchitecture | null = null;

export function getDisasterRecoveryArchitecture() {
  if (!arch) arch = new DisasterRecoveryArchitecture();
  return arch;
}
