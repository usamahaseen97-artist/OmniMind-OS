import { getAgentManager } from "../agent/AgentManager";
import { omniAI } from "../ai/OmniAI";
import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import type { AgentControlState, AIAgentRow } from "./types";
import { omniEventBus } from "../omnicore/OmniEventBus";

const STATE_MAP: Record<string, AgentControlState> = {
  queued: "waiting",
  running: "executing",
  waiting: "waiting",
  completed: "completed",
  failed: "failed",
};

/** AI Control Center — every agent, pause/resume/cancel/reassign. */
export class OmniAIControlCenter {
  listAgents(): AIAgentRow[] {
    const tasks = getAgentManager().tasks.list();
    const agents = omniAI.agents.list();

    return agents.map((a) => {
      const task = tasks.find((t) => t.toolId === a.toolSlug || t.label.includes(a.name));
      const state: AgentControlState = task
        ? STATE_MAP[task.status] ?? "idle"
        : "idle";
      return {
        id: a.id,
        name: a.name,
        toolSlug: a.toolSlug,
        state: task?.retryCount ? "retrying" : state,
        taskLabel: task?.label ?? null,
        progress: task?.progress ?? 0,
        priority: 5,
        updatedAt: task?.updatedAt ?? new Date().toISOString(),
      };
    });
  }

  async pause(agentId: string) {
    const task = getAgentManager().tasks.list().find((t) => t.toolId === agentId);
    if (task) getAgentManager().tasks.update(task.id, { status: "waiting" });
    await omniMissionControlApiClient.agentControl(agentId, "pause");
    omniEventBus.publish("mission:agent-control", { agentId, action: "pause" });
  }

  async resume(agentId: string) {
    const task = getAgentManager().tasks.list().find((t) => t.toolId === agentId);
    if (task) getAgentManager().tasks.setStatus(task.id, "running");
    await omniMissionControlApiClient.agentControl(agentId, "resume");
    omniEventBus.publish("mission:agent-control", { agentId, action: "resume" });
  }

  async cancel(agentId: string) {
    const task = getAgentManager().tasks.list().find((t) => t.toolId === agentId);
    if (task) getAgentManager().tasks.update(task.id, { status: "failed", error: "cancelled" });
    await omniMissionControlApiClient.agentControl(agentId, "cancel");
  }

  async retry(agentId: string) {
    const task = getAgentManager().tasks.list().find((t) => t.toolId === agentId);
    if (task) getAgentManager().tasks.retry(task.id);
    await omniMissionControlApiClient.agentControl(agentId, "retry");
  }

  async duplicate(agentId: string) {
    const agent = omniAI.agents.get(agentId);
    if (agent) getAgentManager().tasks.enqueue(`Copy: ${agent.name}`, agent.toolSlug);
    await omniMissionControlApiClient.agentControl(agentId, "duplicate");
  }

  setPriority(agentId: string, priority: number) {
    return omniMissionControlApiClient.agentControl(agentId, "priority", { priority });
  }

  snapshot() {
    return { agents: this.listAgents(), count: this.listAgents().length };
  }
}

export const omniAIControlCenter = new OmniAIControlCenter();
