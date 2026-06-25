import type { RecoveryPoint } from "./types";
import { omniBackupManager } from "./OmniBackupManager";

/** Recovery points and restore wizard architecture. */
export class OmniRecoveryManager {
  points: RecoveryPoint[] = [];

  createFromBackup(backupId: string, label: string) {
    const backup = omniBackupManager.backups.find((b) => b.id === backupId);
    if (!backup) return null;
    const point: RecoveryPoint = {
      id: `rec-${Date.now()}`,
      backupId,
      label,
      createdAt: new Date().toISOString(),
    };
    this.points.unshift(point);
    return point;
  }

  restore(recoveryId: string) {
    return this.points.find((p) => p.id === recoveryId) ?? null;
  }

  wizardSteps() {
    return ["Select backup", "Verify integrity", "Choose scope", "Restore", "Confirm"];
  }
}

export const omniRecoveryManager = new OmniRecoveryManager();
