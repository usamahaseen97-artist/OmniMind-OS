import type { ProjectRecoverySnapshot } from "../audio-types";
import type { OmniMusicProject } from "../types";

const STORAGE_KEY = "omnimusic-recovery";
const MAX_SNAPSHOTS = 12;

export class ProjectRecoveryEngine {
  private snapshots: ProjectRecoverySnapshot[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this.snapshots = JSON.parse(raw) as ProjectRecoverySnapshot[];
      } catch {
        this.snapshots = [];
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshots.slice(0, MAX_SNAPSHOTS)));
    } catch {
      /* quota */
    }
  }

  save(project: OmniMusicProject, reason: ProjectRecoverySnapshot["reason"], label: string): ProjectRecoverySnapshot {
    const snap: ProjectRecoverySnapshot = {
      id: `rec-${Date.now()}`,
      projectId: project.id,
      savedAt: new Date().toISOString(),
      reason,
      label,
      project: structuredClone(project),
    };
    this.snapshots.unshift(snap);
    if (this.snapshots.length > MAX_SNAPSHOTS) this.snapshots.length = MAX_SNAPSHOTS;
    this.persist();
    return snap;
  }

  list(projectId?: string): ProjectRecoverySnapshot[] {
    return projectId ? this.snapshots.filter((s) => s.projectId === projectId) : [...this.snapshots];
  }

  get(id: string): ProjectRecoverySnapshot | null {
    return this.snapshots.find((s) => s.id === id) ?? null;
  }

  latest(projectId: string): ProjectRecoverySnapshot | null {
    return this.snapshots.find((s) => s.projectId === projectId) ?? null;
  }
}

export const projectRecoveryEngine = new ProjectRecoveryEngine();
