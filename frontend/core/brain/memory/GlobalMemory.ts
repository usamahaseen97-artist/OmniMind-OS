import type { AgentMemorySlice } from "../../agent/types";
import type { MemoryManager } from "../../agent/MemoryManager";

const BRAIN_MEMORY_KEY = "omnimind_brain_global_v1";

export type GlobalBrainMemory = {
  preferences: Record<string, string>;
  businessContext: string[];
  deploymentTargets: string[];
  frameworkSelection: string[];
  pinnedNotes: string[];
  recentConversations: { text: string; at: string }[];
  toolHistory: { toolId: string; at: string }[];
};

const DEFAULT_BRAIN_MEMORY: GlobalBrainMemory = {
  preferences: {},
  businessContext: [],
  deploymentTargets: [],
  frameworkSelection: [],
  pinnedNotes: [],
  recentConversations: [],
  toolHistory: [],
};

/** Extended global memory layered on Master Agent memory. */
export class GlobalMemory {
  private brain: GlobalBrainMemory = DEFAULT_BRAIN_MEMORY;

  constructor(private agentMemory: MemoryManager) {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(BRAIN_MEMORY_KEY);
      if (raw) this.brain = { ...DEFAULT_BRAIN_MEMORY, ...JSON.parse(raw) };
    } catch {
      /* quota */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(BRAIN_MEMORY_KEY, JSON.stringify(this.brain));
    } catch {
      /* quota */
    }
  }

  getAgentSlice(): AgentMemorySlice {
    return this.agentMemory.getMemory();
  }

  getBrainSlice(): GlobalBrainMemory {
    return this.brain;
  }

  rememberConversation(text: string) {
    this.brain.recentConversations = [{ text: text.slice(0, 240), at: new Date().toISOString() }, ...this.brain.recentConversations].slice(0, 40);
    this.persist();
  }

  rememberTool(toolId: string) {
    this.brain.toolHistory = [{ toolId, at: new Date().toISOString() }, ...this.brain.toolHistory.filter((t) => t.toolId !== toolId)].slice(0, 30);
    this.persist();
  }

  pinNote(text: string) {
    this.brain.pinnedNotes = [text, ...this.brain.pinnedNotes.filter((n) => n !== text)].slice(0, 16);
    this.agentMemory.pinContext(text);
    this.persist();
  }

  setPreference(key: string, value: string) {
    this.brain.preferences[key] = value;
    this.persist();
  }

  setBusinessContext(lines: string[]) {
    this.brain.businessContext = lines.slice(0, 12);
    this.persist();
  }

  setDeploymentTargets(targets: string[]) {
    this.brain.deploymentTargets = targets.slice(0, 8);
    this.persist();
  }

  setFrameworkSelection(frameworks: string[]) {
    this.brain.frameworkSelection = frameworks.slice(0, 8);
    this.persist();
  }

  buildGlobalContext(): string {
    const agent = this.agentMemory.getMemory();
    const ws = agent.workspaceMemory;
    const parts = [
      ws.currentProject ? `Project: ${ws.currentProject}` : null,
      ws.activeTool ? `Active tool: ${ws.activeTool}` : null,
      ws.framework ? `Framework: ${ws.framework}` : null,
      ws.database ? `Database: ${ws.database}` : null,
      ws.deploymentTarget ? `Deploy: ${ws.deploymentTarget}` : null,
      this.brain.frameworkSelection.length ? `Stacks: ${this.brain.frameworkSelection.join(", ")}` : null,
      this.brain.deploymentTargets.length ? `Targets: ${this.brain.deploymentTargets.join(", ")}` : null,
      this.brain.businessContext.length ? `Business: ${this.brain.businessContext.join(" · ")}` : null,
      this.brain.pinnedNotes.length ? `Notes: ${this.brain.pinnedNotes.slice(0, 3).join(" | ")}` : null,
      ws.recentFiles.length ? `Files: ${ws.recentFiles.slice(0, 6).join(", ")}` : null,
    ].filter(Boolean);
    return parts.join("\n");
  }
}
