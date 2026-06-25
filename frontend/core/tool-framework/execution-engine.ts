import type {
  ToolExecuteRequest,
  ToolExecuteResult,
  ToolExecutionStage,
  ToolExecutionStageId,
} from "./types";

const STAGE_DEFS: { id: ToolExecutionStageId; label: string }[] = [
  { id: "receive", label: "Receive Request" },
  { id: "validate", label: "Validate" },
  { id: "load_context", label: "Load Context" },
  { id: "execute", label: "Execute" },
  { id: "track_progress", label: "Track Progress" },
  { id: "store_result", label: "Store Result" },
  { id: "update_memory", label: "Update Memory" },
];

export function createExecutionStages(): ToolExecutionStage[] {
  return STAGE_DEFS.map((d) => ({ ...d, status: "pending" }));
}

function activate(stages: ToolExecutionStage[], id: ToolExecutionStageId, message?: string): ToolExecutionStage[] {
  const idx = stages.findIndex((s) => s.id === id);
  return stages.map((s, i) => {
    if (i < idx && s.status !== "error") return { ...s, status: "done" as const };
    if (s.id === id) return { ...s, status: "active" as const, message };
    return s;
  });
}

function complete(stages: ToolExecutionStage[]): ToolExecutionStage[] {
  return stages.map((s) => ({ ...s, status: s.status === "error" ? "error" : "done" }));
}

export type ExecutionCallbacks = {
  onStage?: (stages: ToolExecutionStage[]) => void;
  onProgress?: (pct: number) => void;
  onDispatch?: (event: string, detail: Record<string, unknown>) => void;
};

/** Shared execution pipeline for every tool action. */
export class UniversalToolExecutionEngine {
  async run(
    request: ToolExecuteRequest,
    loadContext: () => Promise<string>,
    execute: (ctx: string) => Promise<unknown>,
    callbacks?: ExecutionCallbacks,
  ): Promise<ToolExecuteResult> {
    let stages = createExecutionStages();

    const tick = (id: ToolExecutionStageId, message?: string, progress?: number) => {
      stages = activate(stages, id, message);
      callbacks?.onStage?.(stages);
      if (progress != null) callbacks?.onProgress?.(progress);
    };

    try {
      tick("receive", `Request for ${request.toolId}`);
      await delay(80);

      tick("validate", request.actionId ?? "default");
      if (!request.toolId) throw new Error("Missing toolId");
      await delay(60);

      tick("load_context", "Loading brain + workspace memory");
      const ctx = await loadContext();
      callbacks?.onDispatch?.("omnimind:tool-framework-context", { toolId: request.toolId, context: ctx });
      await delay(100);

      tick("execute", request.prompt?.slice(0, 48) ?? "Running action");
      callbacks?.onProgress?.(45);
      const output = await execute(ctx);
      await delay(120);

      tick("track_progress", "Progress tracked");
      callbacks?.onProgress?.(85);
      await delay(40);

      tick("store_result", "Result stored");
      callbacks?.onDispatch?.("omnimind:tool-framework-result", { toolId: request.toolId, output });
      await delay(40);

      tick("update_memory", "Memory updated");
      stages = complete(stages);
      callbacks?.onStage?.(stages);
      callbacks?.onProgress?.(100);

      return { ok: true, output, stages };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed";
      stages = stages.map((s) => (s.status === "active" ? { ...s, status: "error", message } : s));
      callbacks?.onStage?.(stages);
      return { ok: false, error: message, stages };
    }
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

let engine: UniversalToolExecutionEngine | null = null;

export function getToolExecutionEngine(): UniversalToolExecutionEngine {
  if (!engine) engine = new UniversalToolExecutionEngine();
  return engine;
}
