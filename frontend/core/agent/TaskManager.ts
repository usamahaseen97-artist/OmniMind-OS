import type { AgentTask, AgentTaskStatus } from "./types";

type TaskListener = (tasks: AgentTask[]) => void;

export class TaskManager {
  private tasks: AgentTask[] = [];
  private listeners = new Set<TaskListener>();

  subscribe(listener: TaskListener) {
    this.listeners.add(listener);
    listener(this.tasks);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const l of this.listeners) l(this.tasks);
  }

  list(): AgentTask[] {
    return this.tasks;
  }

  enqueue(label: string, toolId?: string, workflowStepId?: string): AgentTask {
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      toolId,
      workflowStepId,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.tasks = [task, ...this.tasks].slice(0, 50);
    this.emit();
    return task;
  }

  update(id: string, patch: Partial<Pick<AgentTask, "status" | "progress" | "error" | "label" | "retryCount">>) {
    this.tasks = this.tasks.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
    );
    this.emit();
  }

  setStatus(id: string, status: AgentTaskStatus, progress?: number) {
    this.update(id, { status, progress: progress ?? (status === "completed" ? 100 : undefined) });
  }

  retry(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    this.update(id, { status: "queued", progress: 0, error: undefined, retryCount: task.retryCount + 1 });
  }

  clearCompleted() {
    this.tasks = this.tasks.filter((t) => t.status !== "completed");
    this.emit();
  }
}
