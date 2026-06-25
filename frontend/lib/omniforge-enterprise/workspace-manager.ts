export type OmniForgeWorkspace = {
  id: string;
  name: string;
  projectType?: string;
  rootPath: string;
  active: boolean;
  lastOpenedAt: string;
};

const STORAGE_KEY = "omniforge_enterprise_workspaces_v1";

/** Multiple workspace support — tabs map to workspace instances. */
export class WorkspaceManager {
  private workspaces: OmniForgeWorkspace[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.workspaces = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workspaces));
  }

  list(): OmniForgeWorkspace[] {
    return [...this.workspaces];
  }

  getActive(): OmniForgeWorkspace | undefined {
    return this.workspaces.find((w) => w.active) ?? this.workspaces[0];
  }

  create(name: string, rootPath = "/workspace"): OmniForgeWorkspace {
    const ws: OmniForgeWorkspace = {
      id: `ws-${Date.now()}`,
      name,
      rootPath,
      active: false,
      lastOpenedAt: new Date().toISOString(),
    };
    this.workspaces.push(ws);
    this.persist();
    return ws;
  }

  activate(id: string) {
    this.workspaces = this.workspaces.map((w) => ({
      ...w,
      active: w.id === id,
      lastOpenedAt: w.id === id ? new Date().toISOString() : w.lastOpenedAt,
    }));
    this.persist();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:omniforge-workspace-changed", { detail: { id } }));
    }
  }

  remove(id: string) {
    this.workspaces = this.workspaces.filter((w) => w.id !== id);
    this.persist();
  }
}

let manager: WorkspaceManager | null = null;

export function getWorkspaceManager(): WorkspaceManager {
  if (!manager) manager = new WorkspaceManager();
  return manager;
}
