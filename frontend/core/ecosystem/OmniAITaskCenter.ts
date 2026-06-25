import { getAgentManager } from "../agent/AgentManager";
import type { AgentTask } from "../agent/types";
import { omniAI } from "../ai/OmniAI";
import type { InferenceJob } from "../ai/types";
import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import type { AITaskRecord } from "./types";
import { omniEventBus } from "../omnicore/OmniEventBus";

function tasks() {
  return getAgentManager().tasks;
}

/** AI Task Center — queued, running, completed AI jobs across the platform. */
export class OmniAITaskCenter {
  private extra: AITaskRecord[] = [];

  async list(): Promise<AITaskRecord[]> {
    const remote = await omniEcosystemApiClient.listAITasks();
    const agent = tasks().list().map((t) => this.fromAgent(t));
    const queue = omniAI.queue.list().map((j) => this.fromQueue(j));
    const merged = [...(remote?.ok ? remote.tasks : []), ...agent, ...queue, ...this.extra];
    const seen = new Set<string>();
    return merged.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }

  private fromAgent(t: AgentTask): AITaskRecord {
    const statusMap: Record<AgentTask["status"], AITaskRecord["status"]> = {
      queued: "queued",
      running: "running",
      waiting: "queued",
      completed: "completed",
      failed: "failed",
    };
    return {
      id: t.id,
      label: t.label,
      status: statusMap[t.status] ?? "queued",
      progress: t.progress,
      toolSlug: t.toolId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      retryCount: t.retryCount,
      exportable: true,
    };
  }

  private fromQueue(j: InferenceJob): AITaskRecord {
    const status =
      j.status === "running" ? "running" : j.status === "completed" ? "completed" : j.status === "cancelled" ? "cancelled" : "queued";
    return {
      id: j.id,
      label: j.prompt.slice(0, 80),
      status,
      progress: j.status === "completed" ? 100 : j.status === "running" ? 50 : 0,
      providerId: j.providerId,
      modelId: j.modelId,
      createdAt: j.createdAt,
      updatedAt: j.createdAt,
      retryCount: 0,
      exportable: true,
    };
  }

  retry(id: string) {
    tasks().retry(id);
    omniEventBus.publish("ai-task:retry", { id });
  }

  duplicate(id: string) {
    const source = tasks().list().find((t) => t.id === id);
    if (!source) return null;
    const copy = this.fromAgent(tasks().enqueue(`Copy: ${source.label}`, source.toolId));
    this.extra.unshift(copy);
    return copy;
  }

  exportTask(id: string) {
    const task = tasks().list().find((t) => t.id === id);
    if (!task) return null;
    return JSON.stringify(task, null, 2);
  }

  queued() {
    return tasks().list().filter((t) => t.status === "queued");
  }

  running() {
    return tasks().list().filter((t) => t.status === "running");
  }

  snapshot() {
    return {
      queued: this.queued().length,
      running: this.running().length,
      total: tasks().list().length,
    };
  }
}

export const omniAITaskCenter = new OmniAITaskCenter();
