import type { OmniProject, OmniProjectKind, OmniToolSlug } from "./types";
import { PROJECT_SEED } from "./constants";
import { omniEventBus } from "./OmniEventBus";

/** Universal project manager — cross-tool projects, pins, favorites, versioning. */
export class OmniProjectManager {
  projects: OmniProject[] = PROJECT_SEED.map((p) => ({ ...p }));
  activeProjectId: string | null = PROJECT_SEED[0]?.id ?? null;

  list(filter?: { kind?: OmniProjectKind; toolSlug?: OmniToolSlug }) {
    let list = [...this.projects];
    if (filter?.kind) list = list.filter((p) => p.kind === filter.kind);
    if (filter?.toolSlug) list = list.filter((p) => p.toolSlugs.includes(filter.toolSlug!) || p.kind === "universal");
    return list;
  }

  pinned() {
    return this.projects.filter((p) => p.pinned);
  }

  favorites() {
    return this.projects.filter((p) => p.favorite);
  }

  recent(limit = 10) {
    return [...this.projects]
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
      .slice(0, limit);
  }

  get(id: string) {
    return this.projects.find((p) => p.id === id) ?? null;
  }

  active() {
    return this.activeProjectId ? this.get(this.activeProjectId) : null;
  }

  open(id: string, toolSlug: OmniToolSlug) {
    const project = this.get(id);
    if (!project) return null;
    this.activeProjectId = id;
    project.modifiedAt = new Date().toISOString();
    omniEventBus.publish("project:opened", { projectId: id, toolSlug });
    return project;
  }

  close(id: string) {
    if (this.activeProjectId === id) this.activeProjectId = null;
    omniEventBus.publish("project:closed", { projectId: id });
  }

  create(name: string, kind: OmniProjectKind, toolSlugs: OmniToolSlug[] = []) {
    const project: OmniProject = {
      id: `proj-${Date.now()}`,
      name,
      kind,
      toolSlugs,
      pinned: false,
      favorite: false,
      metadata: {},
      version: 1,
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.projects.unshift(project);
    return project;
  }

  update(id: string, patch: Partial<OmniProject>) {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    this.projects[idx] = {
      ...this.projects[idx]!,
      ...patch,
      version: (this.projects[idx]!.version ?? 1) + (patch.metadata ? 1 : 0),
      modifiedAt: new Date().toISOString(),
    };
    return this.projects[idx]!;
  }

  togglePin(id: string) {
    const p = this.get(id);
    if (p) return this.update(id, { pinned: !p.pinned });
    return null;
  }

  toggleFavorite(id: string) {
    const p = this.get(id);
    if (p) return this.update(id, { favorite: !p.favorite });
    return null;
  }
}

export const omniProjectManager = new OmniProjectManager();
