/**
 * OmniMind Automation SDK — delegates HTTP to production OmniAutomationApiClient.
 * Plugin trigger hooks remain SDK-specific.
 */

import { omniAutomationApiClient } from "../../core/automation/OmniAutomationApiClient";
import type { WorkflowDefinition, WorkflowExecution } from "../../core/automation/types";

export class OmniAutomationSDK {
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    const data = await omniAutomationApiClient.listWorkflows();
    return data?.workflows ?? [];
  }

  async saveWorkflow(workflow: WorkflowDefinition): Promise<WorkflowDefinition> {
    const data = await omniAutomationApiClient.saveWorkflow(workflow);
    if (!data?.workflow) throw new Error("Failed to save workflow");
    return data.workflow;
  }

  async run(workflowId: string, opts?: { background?: boolean; priority?: number }): Promise<WorkflowExecution> {
    const data = await omniAutomationApiClient.runWorkflow(workflowId, opts ?? {});
    if (!data?.execution) throw new Error("Failed to run workflow");
    return data.execution;
  }

  async generate(prompt: string): Promise<WorkflowDefinition> {
    const data = await omniAutomationApiClient.generateFromNL(prompt);
    if (!data?.workflow) throw new Error("Failed to generate workflow");
    return data.workflow;
  }

  async pause(executionId: string) {
    return this.control(executionId, "pause");
  }

  async resume(executionId: string) {
    return this.control(executionId, "resume");
  }

  async cancel(executionId: string) {
    return this.control(executionId, "cancel");
  }

  private async control(executionId: string, action: "pause" | "resume" | "cancel"): Promise<WorkflowExecution> {
    const data = await omniAutomationApiClient.controlExecution(executionId, action);
    if (!data?.execution) throw new Error(`Failed to ${action} execution`);
    return data.execution;
  }

  /** Plugin hook — register automation trigger handler */
  onTrigger(triggerId: string, handler: (payload: Record<string, unknown>) => void) {
    if (typeof window === "undefined") return () => {};
    const fn = (e: Event) => {
      const detail = (e as CustomEvent).detail as { triggerId?: string; payload?: Record<string, unknown> };
      if (detail?.triggerId === triggerId) handler(detail.payload ?? {});
    };
    window.addEventListener(`omnimind:automation:${triggerId}`, fn);
    return () => window.removeEventListener(`omnimind:automation:${triggerId}`, fn);
  }

  emitTrigger(triggerId: string, payload: Record<string, unknown>) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`omnimind:automation:${triggerId}`, { detail: { triggerId, payload } }));
    }
  }
}

export const automationSDK = new OmniAutomationSDK();
