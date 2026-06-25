import type { ActivityEvent, BranchPlaceholder, VersionEntry } from "./types";

/** Version history, snapshots, branch/merge placeholders. */
export class OmniVersionControl {
  versions: VersionEntry[] = [];
  branches: BranchPlaceholder[] = [];
  activity: ActivityEvent[] = [];

  record(targetType: VersionEntry["targetType"], targetId: string, label: string, sizeBytes = 0) {
    const prev = this.versions.filter((v) => v.targetId === targetId);
    const version = (prev[0]?.version ?? 0) + 1;
    const entry: VersionEntry = {
      id: `ver-${Date.now()}`,
      targetType,
      targetId,
      version,
      label,
      createdAt: new Date().toISOString(),
      sizeBytes,
    };
    this.versions.unshift(entry);
    this.log("version", targetType, targetId);
    return entry;
  }

  history(targetId: string) {
    return this.versions.filter((v) => v.targetId === targetId);
  }

  restore(versionId: string) {
    const v = this.versions.find((x) => x.id === versionId);
    if (v) this.log("restore", v.targetType, v.targetId);
    return v ?? null;
  }

  compare(aId: string, bId: string) {
    const a = this.versions.find((v) => v.id === aId);
    const b = this.versions.find((v) => v.id === bId);
    return a && b ? { a, b, diff: `${a.version} → ${b.version}` } : null;
  }

  createBranch(projectId: string, name: string): BranchPlaceholder {
    const branch: BranchPlaceholder = {
      id: `br-${Date.now()}`,
      projectId,
      name,
      headVersion: this.versions.find((v) => v.targetId === projectId)?.version ?? 1,
    };
    this.branches.push(branch);
    return branch;
  }

  private log(action: string, targetType: ActivityEvent["targetType"], targetId: string) {
    this.activity.unshift({
      id: `act-${Date.now()}`,
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
    });
    if (this.activity.length > 200) this.activity.length = 200;
  }

  timeline(limit = 30) {
    return this.activity.slice(0, limit);
  }
}

export const omniVersionControl = new OmniVersionControl();
