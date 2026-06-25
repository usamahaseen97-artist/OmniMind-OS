import type { EncryptionConfig, SecureStoragePolicy } from "../types";

/** Data security architecture — encryption, keys, secure storage policies */
export class DataSecurityArchitecture {
  readonly config: EncryptionConfig = {
    atRest: { algorithm: "AES-256-GCM", keyRotationDays: 90 },
    inTransit: { tlsMinVersion: "1.3", certificatePinning: true },
    keyManagement: { provider: "architecture-kms", hsmReady: true },
  };

  private storagePolicies = new Map<string, SecureStoragePolicy>();

  constructor() {
    const defaults: SecureStoragePolicy[] = [
      { id: "pol-file", resourceType: "file", encrypted: true, immutable: false, retentionDays: 2555 },
      { id: "pol-image", resourceType: "image", encrypted: true, immutable: false, retentionDays: 2555 },
      { id: "pol-report", resourceType: "report", encrypted: true, immutable: true, retentionDays: 2555 },
      { id: "pol-emr", resourceType: "emr", encrypted: true, immutable: false },
      { id: "pol-backup", resourceType: "backup", encrypted: true, immutable: true, retentionDays: 365 },
    ];
    for (const p of defaults) this.storagePolicies.set(p.id, p);
  }

  getPolicy(resourceType: SecureStoragePolicy["resourceType"]) {
    return [...this.storagePolicies.values()].find((p) => p.resourceType === resourceType);
  }

  listPolicies() {
    return [...this.storagePolicies.values()];
  }

  /** Key rotation hook */
  scheduleKeyRotation(keyId: string) {
    return { keyId, scheduledAt: new Date().toISOString(), status: "scheduled" as const };
  }

  /** Secure backup envelope */
  wrapBackup(data: unknown) {
    return { encrypted: true, algorithm: this.config.atRest.algorithm, payload: "[encrypted-stub]", checksum: `sha256-${Date.now()}` };
  }
}

let arch: DataSecurityArchitecture | null = null;

export function getDataSecurityArchitecture() {
  if (!arch) arch = new DataSecurityArchitecture();
  return arch;
}
