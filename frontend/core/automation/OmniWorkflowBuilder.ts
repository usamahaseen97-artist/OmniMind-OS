import { omniAutomationApiClient } from "./OmniAutomationApiClient";
import type { WorkflowDefinition, WorkflowNode } from "./types";
import { omniEventBus } from "../omnicore/OmniEventBus";

/** Visual workflow builder — nodes, edges, nested workflows. */
export class OmniWorkflowBuilder {
  workflows: WorkflowDefinition[] = [];
  activeWorkflowId: string | null = null;
  private booted = false;

  async boot() {
    if (this.booted) return this;
    const remote = await omniAutomationApiClient.listWorkflows();
    if (remote?.ok) this.workflows = remote.workflows;
    this.booted = true;
    return this;
  }

  active(): WorkflowDefinition | null {
    return this.workflows.find((w) => w.id === this.activeWorkflowId) ?? null;
  }

  create(def: Omit<WorkflowDefinition, "id" | "createdAt" | "updatedAt" | "version">) {
    const now = new Date().toISOString();
    const wf: WorkflowDefinition = {
      ...def,
      id: `wf-${Date.now()}`,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.workflows.unshift(wf);
    this.activeWorkflowId = wf.id;
    void omniAutomationApiClient.saveWorkflow(wf);
    omniEventBus.publish("automation:workflow-created", { workflowId: wf.id });
    return wf;
  }

  update(id: string, patch: Partial<WorkflowDefinition>) {
    const wf = this.workflows.find((w) => w.id === id);
    if (!wf) return null;
    Object.assign(wf, patch, { updatedAt: new Date().toISOString(), version: wf.version + 1 });
    void omniAutomationApiClient.saveWorkflow(wf);
    return wf;
  }

  addNode(workflowId: string, node: WorkflowNode) {
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) return null;
    wf.nodes.push(node);
    wf.updatedAt = new Date().toISOString();
    void omniAutomationApiClient.updateNodes(workflowId, wf.nodes);
    return node;
  }

  moveNode(workflowId: string, nodeId: string, position: { x: number; y: number }) {
    const wf = this.workflows.find((w) => w.id === workflowId);
    const node = wf?.nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    node.position = position;
    void omniAutomationApiClient.updateNodes(workflowId, wf!.nodes);
    return node;
  }

  connect(workflowId: string, fromId: string, toId: string, branch: "next" | "else" = "next") {
    const wf = this.workflows.find((w) => w.id === workflowId);
    const from = wf?.nodes.find((n) => n.id === fromId);
    if (!from) return null;
    const key = branch === "else" ? "elseIds" : "nextIds";
    const ids = from[key] ?? [];
    if (!ids.includes(toId)) ids.push(toId);
    from[key] = ids;
    void omniAutomationApiClient.updateNodes(workflowId, wf!.nodes);
    return from;
  }

  nestWorkflow(parentId: string, childWorkflowId: string) {
    const parent = this.workflows.find((w) => w.id === parentId);
    if (!parent) return null;
    if (!parent.nestedWorkflowIds.includes(childWorkflowId)) {
      parent.nestedWorkflowIds.push(childWorkflowId);
    }
    parent.nodes.push({
      id: `nested-${childWorkflowId}`,
      kind: "nested",
      label: `Nested: ${childWorkflowId}`,
      config: { workflowId: childWorkflowId },
      position: { x: 320, y: 200 },
    });
    void omniAutomationApiClient.saveWorkflow(parent);
    return parent;
  }

  list() {
    return [...this.workflows];
  }
}

export const omniWorkflowBuilder = new OmniWorkflowBuilder();
