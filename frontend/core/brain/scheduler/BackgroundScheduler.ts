import type { BrainAction, BrainPlan } from "../types";

type ActionListener = (actions: BrainAction[]) => void;

/** Background task scheduler — tasks persist across tool navigation. */
export class BackgroundScheduler {
  private actions: BrainAction[] = [];
  private listeners = new Set<ActionListener>();
  private timers = new Map<string, number>();

  subscribe(listener: ActionListener) {
    this.listeners.add(listener);
    listener(this.actions);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const l of this.listeners) l(this.actions);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:brain-actions", { detail: this.actions }));
    }
  }

  list(): BrainAction[] {
    return this.actions;
  }

  enqueue(label: string, toolId?: string, opts?: { background?: boolean; planId?: string; subtaskId?: string }): BrainAction {
    const action: BrainAction = {
      id: `brain-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      toolId,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      background: opts?.background ?? true,
      planId: opts?.planId,
      subtaskId: opts?.subtaskId,
    };
    this.actions = [action, ...this.actions].slice(0, 60);
    this.emit();
    return action;
  }

  update(id: string, patch: Partial<Pick<BrainAction, "status" | "progress" | "error" | "label" | "retryCount">>) {
    this.actions = this.actions.map((a) =>
      a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
    );
    this.emit();
  }

  setRunning(id: string) {
    this.update(id, { status: "running", progress: 10 });
  }

  setProgress(id: string, progress: number) {
    this.update(id, { progress: Math.min(100, progress) });
  }

  complete(id: string) {
    this.update(id, { status: "completed", progress: 100 });
    const t = this.timers.get(id);
    if (t) window.clearInterval(t);
    this.timers.delete(id);
  }

  fail(id: string, error: string) {
    this.update(id, { status: "failed", error });
    const t = this.timers.get(id);
    if (t) window.clearInterval(t);
    this.timers.delete(id);
  }

  pause(id: string) {
    this.update(id, { status: "paused" });
    const t = this.timers.get(id);
    if (t) window.clearInterval(t);
    this.timers.delete(id);
  }

  cancel(id: string) {
    this.actions = this.actions.filter((a) => a.id !== id);
    const t = this.timers.get(id);
    if (t) window.clearInterval(t);
    this.timers.delete(id);
    this.emit();
  }

  retry(id: string) {
    const action = this.actions.find((a) => a.id === id);
    if (!action) return;
    this.update(id, { status: "queued", progress: 0, error: undefined, retryCount: action.retryCount + 1 });
  }

  /** Simulates progressive subtask execution for live UI. */
  runPlanProgress(plan: BrainPlan, onSubtaskComplete?: (subtaskId: string) => void): string {
    const action = this.enqueue(plan.goal, plan.subtasks[0]?.toolId, { background: true, planId: plan.id });
    this.setRunning(action.id);

    let idx = 0;
    const tick = () => {
      const sub = plan.subtasks[idx];
      if (!sub) {
        this.complete(action.id);
        return;
      }
      const pct = Math.round(((idx + 0.5) / plan.subtasks.length) * 100);
      this.setProgress(action.id, pct);
      onSubtaskComplete?.(sub.id);
      idx += 1;
      if (idx >= plan.subtasks.length) {
        this.complete(action.id);
        const t = this.timers.get(action.id);
        if (t) window.clearInterval(t);
        this.timers.delete(action.id);
      }
    };

    const interval = window.setInterval(tick, 1800);
    this.timers.set(action.id, interval);
    tick();
    return action.id;
  }
}
