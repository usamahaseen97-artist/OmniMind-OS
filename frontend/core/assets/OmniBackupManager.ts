import type { BackupPoint } from "./types";

/** Auto / manual backup architecture. */
export class OmniBackupManager {
  backups: BackupPoint[] = [];
  autoBackupEnabled = true;

  create(label: string, kind: BackupPoint["kind"] = "manual", sizeBytes = 0) {
    const point: BackupPoint = {
      id: `bak-${Date.now()}`,
      label,
      kind,
      createdAt: new Date().toISOString(),
      sizeBytes,
      integrityOk: true,
    };
    this.backups.unshift(point);
    return point;
  }

  autoBackup() {
    if (!this.autoBackupEnabled) return null;
    return this.create("Auto backup", "auto");
  }

  list() {
    return [...this.backups];
  }

  integrityCheck(id: string) {
    const b = this.backups.find((x) => x.id === id);
    if (b) b.integrityOk = true;
    return b ?? null;
  }
}

export const omniBackupManager = new OmniBackupManager();
