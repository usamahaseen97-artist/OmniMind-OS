import type { AutoSaveState, EditorProject } from "./types";

type SaveListener = (state: AutoSaveState) => void;

/** Debounced auto-save — persists via API callback. */
export class AutoSaveManager {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private state: AutoSaveState = {
    status: "saved",
    lastSavedAt: null,
    pendingVersion: 0,
  };
  private listeners = new Set<SaveListener>();

  subscribe(listener: SaveListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return { ...this.state };
  }

  markDirty(version: number) {
    this.state = { ...this.state, status: "dirty", pendingVersion: version };
    this.emit();
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.savePending(version), 2500);
  }

  async savePending(
    version: number,
    persist?: (project: EditorProject) => Promise<void>,
    project?: EditorProject,
  ) {
    if (this.state.pendingVersion !== version) return;
    this.state = { ...this.state, status: "saving" };
    this.emit();
    try {
      if (persist && project) await persist(project);
      this.state = {
        status: "saved",
        lastSavedAt: new Date().toISOString(),
        pendingVersion: version,
      };
    } catch {
      this.state = { ...this.state, status: "dirty" };
    }
    this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }
}

export const autoSaveManager = new AutoSaveManager();
