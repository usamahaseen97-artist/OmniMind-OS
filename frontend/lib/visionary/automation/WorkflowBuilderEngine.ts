import type { Workflow, WorkflowConnection, WorkflowNode, WorkflowNodeType } from "./types";

export class WorkflowBuilderEngine {
  create(workflows: Workflow[], name: string, trigger: Workflow["trigger"]): Workflow[] {
    const w: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description: "",
      trigger,
      nodes: [],
      connections: [],
      variables: [],
      template: false,
      enabled: true,
    };
    return [w, ...workflows];
  }

  addNode(nodes: WorkflowNode[], type: WorkflowNodeType, label: string, x: number, y: number): WorkflowNode[] {
    return [...nodes, { id: `wn-${Date.now()}`, type, label, x, y, config: {}, groupId: null }];
  }

  moveNode(nodes: WorkflowNode[], id: string, x: number, y: number): WorkflowNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, x, y } : n));
  }

  connect(connections: WorkflowConnection[], fromId: string, toId: string): WorkflowConnection[] {
    return [...connections, { id: `wc-${Date.now()}`, fromNodeId: fromId, toNodeId: toId, label: null }];
  }
}

export const workflowBuilderEngine = new WorkflowBuilderEngine();
