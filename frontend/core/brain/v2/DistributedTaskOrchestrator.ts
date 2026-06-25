import type { Brain2Subtask } from "./types";

export type TaskResult = { subtaskId: string; ok: boolean; output: string };

/** Distributed task orchestrator — parallel agent execution. */
export class DistributedTaskOrchestrator {
  async executeParallel(
    subtasks: Brain2Subtask[],
    executor: (task: Brain2Subtask) => Promise<string>,
  ): Promise<TaskResult[]> {
    const parallel = subtasks.filter((t) => t.parallel && t.status !== "completed");
    const sequential = subtasks.filter((t) => !t.parallel && t.status !== "completed");

    const results: TaskResult[] = [];

    if (parallel.length) {
      const batch = await Promise.all(
        parallel.map(async (task) => {
          try {
            const output = await executor(task);
            return { subtaskId: task.id, ok: true, output };
          } catch (err) {
            return { subtaskId: task.id, ok: false, output: err instanceof Error ? err.message : "Task failed" };
          }
        }),
      );
      results.push(...batch);
    }

    for (const task of sequential) {
      try {
        const output = await executor(task);
        results.push({ subtaskId: task.id, ok: true, output });
      } catch (err) {
        results.push({ subtaskId: task.id, ok: false, output: err instanceof Error ? err.message : "Task failed" });
      }
    }

    return results;
  }
}
