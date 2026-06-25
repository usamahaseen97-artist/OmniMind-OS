import type { AgentLogEntry, AgentMemorySlice } from "./types";

const STORAGE_KEY = "omnimind_master_memory_v1";

const DEFAULT_MEMORY: AgentMemorySlice = {
  projectMemory: {},
  conversationMemory: [],
  workspaceMemory: {
    pinnedContext: [],
    recentFiles: [],
  },
  recentTasks: [],
};

export class MemoryManager {
  private memory: AgentMemorySlice = DEFAULT_MEMORY;
  private logs: AgentLogEntry[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.memory = { ...DEFAULT_MEMORY, ...JSON.parse(raw) };
    } catch {
      /* quota */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memory));
    } catch {
      /* quota */
    }
  }

  getMemory(): AgentMemorySlice {
    return this.memory;
  }

  patchWorkspace(patch: Partial<AgentMemorySlice["workspaceMemory"]>) {
    this.memory.workspaceMemory = { ...this.memory.workspaceMemory, ...patch };
    this.persist();
  }

  pinContext(text: string) {
    const pinned = [text, ...this.memory.workspaceMemory.pinnedContext.filter((p) => p !== text)].slice(0, 12);
    this.patchWorkspace({ pinnedContext: pinned });
  }

  unpinContext(text: string) {
    this.patchWorkspace({
      pinnedContext: this.memory.workspaceMemory.pinnedContext.filter((p) => p !== text),
    });
  }

  pushConversation(role: "user" | "assistant" | "system", text: string) {
    this.memory.conversationMemory = [
      { role, text, at: new Date().toISOString() },
      ...this.memory.conversationMemory,
    ].slice(0, 80);
    this.persist();
  }

  pushRecentTask(taskId: string) {
    this.memory.recentTasks = [taskId, ...this.memory.recentTasks.filter((id) => id !== taskId)].slice(0, 20);
    this.persist();
  }

  setProjectMemory(key: string, value: unknown) {
    this.memory.projectMemory[key] = value;
    this.persist();
  }

  log(entry: Omit<AgentLogEntry, "id" | "at">) {
    const row: AgentLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    };
    this.logs = [row, ...this.logs].slice(0, 100);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:master-agent-log", { detail: row }));
    }
    return row;
  }

  getLogs(): AgentLogEntry[] {
    return this.logs;
  }
}
