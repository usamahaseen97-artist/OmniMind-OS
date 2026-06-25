import type { UniversalProject, ProjectTemplate, ProjectSnapshot } from "./types";
import { PROJECT_SEED, PROJECT_TEMPLATES } from "./constants";

/** Universal project engine — templates, archive, snapshots, version history. */
export class OmniProjectEngine {
  projects: UniversalProject[] = PROJECT_SEED.map((p) => ({ ...p }));
  templates: ProjectTemplate[] = PROJECT_TEMPLATES.map((t) => ({ ...t }));
  snapshots: ProjectSnapshot[] = [
    { id: "snap-1", projectId: "uproj-001", label: "Initial", version: 1, createdAt: new Date().toISOString(), assetCount: 2 },
  ];
  activeProjectId: string | null = "uproj-001";

  list(includeArchived = false) {
    return includeArchived ? [...this.projects] : this.projects.filter((p) => !p.archived);
  }

  get(id: string) {
    return this.projects.find((p) => p.id === id) ?? null;
  }

  active() {
    return this.activeProjectId ? this.get(this.activeProjectId) : null;
  }

  createFromTemplate(templateId: string, name: string): UniversalProject | null {
    const tpl = this.templates.find((t) => t.id === templateId);
    if (!tpl) return null;
    const project: UniversalProject = {
      id: `uproj-${Date.now()}`,
      name,
      description: tpl.description,
      kind: tpl.toolSlugs.length > 1 ? "cross-tool" : tpl.toolSlugs.length === 1 ? "tool-scoped" : "universal",
      toolSlugs: [...tpl.toolSlugs],
      templateId,
      archived: false,
      metadata: { ...tpl.defaultMetadata },
      assetIds: [],
      version: 1,
      snapshotIds: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    this.projects.unshift(project);
    return project;
  }

  duplicate(id: string) {
    const src = this.get(id);
    if (!src) return null;
    const copy: UniversalProject = {
      ...src,
      id: `uproj-${Date.now()}`,
      name: `${src.name} (copy)`,
      version: 1,
      snapshotIds: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    this.projects.unshift(copy);
    return copy;
  }

  archive(id: string) {
    const p = this.get(id);
    if (p) { p.archived = true; p.modifiedAt = new Date().toISOString(); }
    return p;
  }

  restore(id: string) {
    const p = this.get(id);
    if (p) { p.archived = false; p.modifiedAt = new Date().toISOString(); }
    return p;
  }

  snapshot(projectId: string, label: string): ProjectSnapshot | null {
    const p = this.get(projectId);
    if (!p) return null;
    const snap: ProjectSnapshot = {
      id: `snap-${Date.now()}`,
      projectId,
      label,
      version: p.version,
      createdAt: new Date().toISOString(),
      assetCount: p.assetIds.length,
    };
    this.snapshots.push(snap);
    p.snapshotIds.push(snap.id);
    return snap;
  }
}

export const omniProjectEngine = new OmniProjectEngine();
