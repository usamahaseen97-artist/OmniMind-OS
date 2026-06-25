import { omniAutomationApiClient } from "./OmniAutomationApiClient";
import type { WorkflowExecution } from "./types";
import { omniEventBus } from "../omnicore/OmniEventBus";
import { omniActivityCenter } from "../ecosystem/OmniActivityCenter";

/** Workflow execution engine — pause, resume, retry, rollback, cancel, debug. */
export class OmniWorkflowExecutor {
  executions: WorkflowExecution[] = [];

  async run(workflowId: string, opts: { background?: boolean; priority?: number } = {}) {
    const res = await omniAutomationApiClient.runWorkflow(workflowId, opts);
    if (!res?.ok) return null;
    this.executions.unshift(res.execution);
    omniEventBus.publish("automation:execution-started", { executionId: res.execution.id, workflowId });
    omniActivityCenter.push("ai-task", `Workflow ${workflowId}`, res.execution.id, {
      status: "running",
      progress: 0,
    });
    return res.execution;
  }

  async pause(executionId: string) {
    return this.control(executionId, "pause");
  }

  async resume(executionId: string) {
    return this.control(executionId, "resume");
  }

  async retry(executionId: string) {
    return this.control(executionId, "retry");
  }

  async rollback(executionId: string) {
    return this.control(executionId, "rollback");
  }

  async cancel(executionId: string) {
    return this.control(executionId, "cancel");
  }

  private async control(executionId: string, action: "pause" | "resume" | "retry" | "rollback" | "cancel") {
    const res = await omniAutomationApiClient.controlExecution(executionId, action);
    if (!res?.ok) return null;
    const idx = this.executions.findIndex((e) => e.id === executionId);
    if (idx >= 0) this.executions[idx] = res.execution;
    omniEventBus.publish("automation:execution-control", { executionId, action });
    return res.execution;
  }

  async cloneWorkflow(workflowId: string) {
    return omniAutomationApiClient.cloneWorkflow(workflowId);
  }

  logs(executionId: string) {
    return this.executions.find((e) => e.id === executionId)?.logs ?? [];
  }

  history(workflowId?: string) {
    return this.executions.filter((e) => !workflowId || e.workflowId === workflowId);
  }

  debug(executionId: string) {
    const ex = this.executions.find((e) => e.id === executionId);
    if (!ex) return null;
    return {
      execution: ex,
      logs: ex.logs,
      currentNode: ex.currentNodeId,
      status: ex.status,
    };
  }
}

export const omniWorkflowExecutor = new OmniWorkflowExecutor();
