import type { ToolFrameworkState, ToolVersionSnapshot } from "./types";

const MAX_UNDO = 24;
const MAX_TASKS = 30;

export function createInitialToolFrameworkState(): ToolFrameworkState {
  return {
    loading: false,
    error: null,
    progress: 0,
    stages: [],
    tasks: [],
    suggestions: [],
    notifications: [],
    undoStack: [],
    redoStack: [],
    autosaveAt: null,
    memoryContext: [],
    recentTasks: [],
  };
}

export type ToolFrameworkStoreListener = (state: ToolFrameworkState) => void;

/** Undo, redo, autosave, tasks, notifications — shared across all tools. */
export class ToolFrameworkStore {
  private state: ToolFrameworkState = createInitialToolFrameworkState();
  private listeners = new Set<ToolFrameworkStoreListener>();
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;

  subscribe(listener: ToolFrameworkStoreListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  private emit() {
    for (const l of this.listeners) l(this.state);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:tool-framework-state", { detail: this.state }));
    }
  }

  private patch(patch: Partial<ToolFrameworkState>) {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  setLoading(loading: boolean) {
    this.patch({ loading });
  }

  setError(error: string | null) {
    this.patch({ error });
  }

  setProgress(progress: number) {
    this.patch({ progress: Math.min(100, Math.max(0, progress)) });
  }

  setStages(stages: ToolFrameworkState["stages"]) {
    this.patch({ stages });
  }

  removeNotification(id: string) {
    this.patch({
      notifications: this.state.notifications.filter((n) => n.id !== id),
    });
  }

  pushNotification(text: string, level: "info" | "warn" | "error" = "info") {
    const id = `n-${Date.now()}`;
    this.patch({
      notifications: [{ id, text, level }, ...this.state.notifications].slice(0, 12),
    });
  }

  pushSuggestion(text: string) {
    this.patch({
      suggestions: [text, ...this.state.suggestions.filter((s) => s !== text)].slice(0, 8),
    });
  }

  pushTask(label: string, status: ToolFrameworkState["tasks"][0]["status"] = "queued") {
    const task = {
      id: `tf-${Date.now()}`,
      label,
      status,
      progress: status === "running" ? 10 : 0,
      createdAt: new Date().toISOString(),
    };
    this.patch({
      tasks: [task, ...this.state.tasks].slice(0, MAX_TASKS),
      recentTasks: [task.id, ...this.state.recentTasks].slice(0, 20),
    });
    return task.id;
  }

  updateTask(id: string, patch: Partial<ToolFrameworkState["tasks"][0]>) {
    this.patch({
      tasks: this.state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  pushMemoryContext(text: string) {
    this.patch({
      memoryContext: [text, ...this.state.memoryContext.filter((m) => m !== text)].slice(0, 16),
    });
  }

  snapshot(label: string, payload: unknown) {
    const snap: ToolVersionSnapshot = {
      id: `v-${Date.now()}`,
      label,
      at: new Date().toISOString(),
      payload,
    };
    this.patch({
      undoStack: [snap, ...this.state.undoStack].slice(0, MAX_UNDO),
      redoStack: [],
    });
    this.scheduleAutosave();
    return snap;
  }

  undo(): ToolVersionSnapshot | null {
    const [head, ...rest] = this.state.undoStack;
    if (!head) return null;
    this.patch({
      undoStack: rest,
      redoStack: [head, ...this.state.redoStack].slice(0, MAX_UNDO),
    });
    return head;
  }

  redo(): ToolVersionSnapshot | null {
    const [head, ...rest] = this.state.redoStack;
    if (!head) return null;
    this.patch({
      redoStack: rest,
      undoStack: [head, ...this.state.undoStack].slice(0, MAX_UNDO),
    });
    return head;
  }

  scheduleAutosave() {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => {
      this.patch({ autosaveAt: new Date().toISOString() });
      this.pushNotification("Autosaved", "info");
    }, 2000);
  }

  reset() {
    this.state = createInitialToolFrameworkState();
    this.emit();
  }
}

let store: ToolFrameworkStore | null = null;

export function getToolFrameworkStore(): ToolFrameworkStore {
  if (!store) store = new ToolFrameworkStore();
  return store;
}
