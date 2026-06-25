import type { AiAgentId, Workflow, WorkflowNode } from "./types";

/** Multi-agent workflow orchestration — sequential, parallel, conditional. */
export class OmniWorkflowEngine {
  workflows: Workflow[] = [];

  create(name: string, mode: Workflow["mode"], nodes: WorkflowNode[]): Workflow {
    const wf: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      nodes,
      mode,
      status: "idle",
    };
    this.workflows.push(wf);
    return wf;
  }

  get(id: string) {
    return this.workflows.find((w) => w.id === id) ?? null;
  }

  run(id: string) {
    const wf = this.get(id);
    if (!wf) return null;
    wf.status = "running";
    return wf;
  }

  complete(id: string) {
    const wf = this.get(id);
    if (wf) wf.status = "completed";
    return wf;
  }

  sequential(agentIds: AiAgentId[], name: string) {
    const nodes: WorkflowNode[] = agentIds.map((agentId, i) => ({
      id: `node-${i}`,
      type: "agent" as const,
      agentId,
      config: {},
    }));
    return this.create(name, "sequential", nodes);
  }

  parallel(agentIds: AiAgentId[], name: string) {
    const nodes: WorkflowNode[] = [
      { id: "par-root", type: "parallel", childIds: agentIds.map((_, i) => `node-${i}`) },
      ...agentIds.map((agentId, i) => ({
        id: `node-${i}`,
        type: "agent" as const,
        agentId,
        config: {},
      })),
    ];
    return this.create(name, "parallel", nodes);
  }
}

export const omniWorkflowEngine = new OmniWorkflowEngine();
