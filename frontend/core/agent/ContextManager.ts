import type { AgentMemorySlice } from "./types";
import type { MemoryManager } from "./MemoryManager";
import type { ToolRegistry } from "./ToolRegistry";

export type WorkspaceContextSnapshot = {
  activeToolId?: string;
  activeToolName?: string;
  routeId?: string;
  pathname?: string;
  framework?: string;
  database?: string;
  deploymentTarget?: string;
  currentProject?: string;
  techStack?: {
    frontend: string[];
    backend: string[];
    database: string[];
  };
};

/** Project, workspace, and cross-tool context bridge. */
export class ContextManager {
  constructor(
    private memory: MemoryManager,
    private registry: ToolRegistry,
  ) {}

  syncFromEcosystem(snapshot: WorkspaceContextSnapshot) {
    const ws = this.memory.getMemory().workspaceMemory;
    this.memory.patchWorkspace({
      activeTool: snapshot.activeToolId ?? ws.activeTool,
      framework: snapshot.framework ?? snapshot.techStack?.frontend?.[0] ?? ws.framework,
      database: snapshot.database ?? snapshot.techStack?.database?.[0] ?? ws.database,
      deploymentTarget: snapshot.deploymentTarget ?? ws.deploymentTarget,
      currentProject: snapshot.currentProject ?? ws.currentProject,
    });

    if (snapshot.activeToolId) {
      const tool = this.registry.get(snapshot.activeToolId) ?? this.registry.getBySlug(snapshot.activeToolId);
      if (tool) {
        this.memory.setProjectMemory("lastTool", tool.id);
      }
    }
  }

  getSnapshot(): AgentMemorySlice["workspaceMemory"] {
    return this.memory.getMemory().workspaceMemory;
  }

  rememberFile(path: string) {
    const ws = this.memory.getMemory().workspaceMemory;
    const recentFiles = [path, ...ws.recentFiles.filter((f) => f !== path)].slice(0, 24);
    this.memory.patchWorkspace({ recentFiles });
  }

  buildSystemContext(): string {
    const ws = this.getSnapshot();
    const parts = [
      ws.currentProject ? `Project: ${ws.currentProject}` : null,
      ws.activeTool ? `Active tool: ${ws.activeTool}` : null,
      ws.framework ? `Framework: ${ws.framework}` : null,
      ws.database ? `Database: ${ws.database}` : null,
      ws.deploymentTarget ? `Deploy target: ${ws.deploymentTarget}` : null,
      ws.pinnedContext.length ? `Pinned: ${ws.pinnedContext.join(" | ")}` : null,
      ws.recentFiles.length ? `Files: ${ws.recentFiles.slice(0, 5).join(", ")}` : null,
    ].filter(Boolean);
    return parts.join("\n");
  }
}
