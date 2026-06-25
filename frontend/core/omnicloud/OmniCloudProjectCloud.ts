import { omniCloudApiClient } from "./OmniCloudApiClient";
import { omniProjectManager } from "../omnicore/OmniProjectManager";
import { omniCoreApiClient } from "../omnicore/OmniCoreApiClient";
import type { ProjectCloudSnapshot } from "./types";

/** Project Cloud — save, restore, snapshots, timeline, rollback, archive, clone. */
export class OmniCloudProjectCloud {
  snapshots: ProjectCloudSnapshot[] = [];

  async listSnapshots(projectId: string) {
    const remote = await omniCloudApiClient.listProjectSnapshots(projectId);
    if (remote?.ok) {
      this.snapshots = remote.snapshots;
      return this.snapshots;
    }
    return this.snapshots.filter((s) => s.projectId === projectId);
  }

  async saveSnapshot(projectId: string, label?: string) {
    const project = omniProjectManager.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    const remote = await omniCloudApiClient.saveProjectSnapshot(projectId, label ?? `Snapshot ${new Date().toLocaleString()}`);
    if (remote?.ok) {
      this.snapshots.unshift(remote.snapshot);
      return remote.snapshot;
    }
    const snapshot: ProjectCloudSnapshot = {
      id: `snap-${Date.now()}`,
      projectId,
      version: this.snapshots.filter((s) => s.projectId === projectId).length + 1,
      label: label ?? `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      sizeBytes: JSON.stringify(project).length,
    };
    this.snapshots.unshift(snapshot);
    return snapshot;
  }

  async restore(snapshotId: string, projectId: string) {
    const remote = await omniCloudApiClient.restoreSnapshot(projectId, snapshotId);
    if (remote?.ok) return { ok: true };
    const snap = this.snapshots.find((s) => s.id === snapshotId);
    if (!snap) return { ok: false };
    return { ok: true, snapshot: snap };
  }

  async cloudSave(projectId: string) {
    const project = omniProjectManager.get(projectId);
    if (!project) return { ok: false };
    await omniCoreApiClient.saveProjects(omniProjectManager.list());
    return this.saveSnapshot(projectId, "Cloud save");
  }

  async cloudRestore(projectId: string) {
    const snaps = await this.listSnapshots(projectId);
    if (!snaps.length) return { ok: false };
    return this.restore(snaps[0].id, projectId);
  }

  async archive(projectId: string) {
    const project = omniProjectManager.get(projectId);
    if (!project) return { ok: false };
    omniProjectManager.update(projectId, { metadata: { ...project.metadata, archived: "true" } });
    await omniCoreApiClient.saveProjects(omniProjectManager.list());
    return { ok: true };
  }

  async clone(projectId: string, newName?: string) {
    const project = omniProjectManager.get(projectId);
    if (!project) return null;
    const cloned = omniProjectManager.create(
      newName ?? `${project.name} (Clone)`,
      project.kind,
      [...project.toolSlugs],
    );
    await omniCoreApiClient.saveProjects(omniProjectManager.list());
    return cloned;
  }

  duplicate(projectId: string) {
    return this.clone(projectId);
  }

  timeline(projectId: string) {
    return this.snapshots
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => b.version - a.version);
  }

  snapshot() {
    return { snapshotCount: this.snapshots.length };
  }
}

export const omniCloudProjectCloud = new OmniCloudProjectCloud();
