import type { AiAgentId, AiTask, ExecutionPlan } from "./types";

/** Breaks large requests into tasks with dependencies. */
export class OmniTaskPlanner {
  plans: ExecutionPlan[] = [];

  create(goal: string, taskLabels: string[]): ExecutionPlan {
    const ts = Date.now();
    const tasks: AiTask[] = taskLabels.map((label, i) => ({
      id: `task-${ts}-${i}`,
      label,
      status: "pending",
      dependsOn: i > 0 ? [`task-${ts}-${i - 1}`] : [],
      agentId: null,
      progress: 0,
      retryCount: 0,
    }));
    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}`,
      goal,
      tasks,
      status: "draft",
    };
    this.plans.unshift(plan);
    return plan;
  }

  get(id: string) {
    return this.plans.find((p) => p.id === id) ?? null;
  }

  start(planId: string) {
    const plan = this.get(planId);
    if (!plan) return null;
    plan.status = "running";
    const first = plan.tasks.find((t) => t.dependsOn.length === 0);
    if (first) first.status = "running";
    return plan;
  }

  completeTask(planId: string, taskId: string, agentId?: AiAgentId) {
    const plan = this.get(planId);
    if (!plan) return null;
    const task = plan.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = "completed";
    task.progress = 100;
    if (agentId) task.agentId = agentId;
    const next = plan.tasks.find(
      (t) => t.status === "pending" && t.dependsOn.every((d) => plan.tasks.find((x) => x.id === d)?.status === "completed"),
    );
    if (next) next.status = "running";
    else if (plan.tasks.every((t) => t.status === "completed")) plan.status = "completed";
    return task;
  }

  retry(taskId: string, planId: string) {
    const plan = this.get(planId);
    const task = plan?.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.retryCount += 1;
    task.status = "retrying";
    return task;
  }
}

export const omniTaskPlanner = new OmniTaskPlanner();
