/** OmniMind Automation — production HTTP client. */

import type {
  AutomationMetrics,
  AutomationSuggestion,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowNode,
} from "./types";

const BASE = "/api/v1/omnicore/automation";

async function req<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const omniAutomationApiClient = {
  listWorkflows() {
    return req<{ ok: boolean; workflows: WorkflowDefinition[] }>("GET", "/workflows");
  },

  saveWorkflow(workflow: WorkflowDefinition) {
    return req<{ ok: boolean; workflow: WorkflowDefinition }>("PUT", `/workflows/${workflow.id}`, workflow);
  },

  deleteWorkflow(id: string) {
    return req<{ ok: boolean }>("DELETE", `/workflows/${id}`);
  },

  runWorkflow(id: string, opts: { background?: boolean; priority?: number; input?: Record<string, unknown> } = {}) {
    return req<{ ok: boolean; execution: WorkflowExecution }>("POST", `/workflows/${id}/run`, opts);
  },

  listExecutions(workflowId?: string) {
    const q = workflowId ? `?workflowId=${encodeURIComponent(workflowId)}` : "";
    return req<{ ok: boolean; executions: WorkflowExecution[] }>("GET", `/executions${q}`);
  },

  controlExecution(id: string, action: "pause" | "resume" | "retry" | "rollback" | "cancel") {
    return req<{ ok: boolean; execution: WorkflowExecution }>("POST", `/executions/${id}/${action}`);
  },

  cloneWorkflow(id: string) {
    return req<{ ok: boolean; workflow: WorkflowDefinition }>("POST", `/workflows/${id}/clone`);
  },

  generateFromNL(prompt: string) {
    return req<{ ok: boolean; workflow: WorkflowDefinition }>("POST", "/generate", { prompt });
  },

  listTemplates() {
    return req<{ ok: boolean; templates: import("./types").WorkflowTemplate[] }>("GET", "/templates");
  },

  metrics() {
    return req<{ ok: boolean; metrics: AutomationMetrics }>("GET", "/metrics");
  },

  suggestions(context?: string) {
    return req<{ ok: boolean; suggestions: AutomationSuggestion[] }>("POST", "/suggestions", { context });
  },

  updateNodes(workflowId: string, nodes: WorkflowNode[]) {
    return req<{ ok: boolean; workflow: WorkflowDefinition }>("PUT", `/workflows/${workflowId}/nodes`, { nodes });
  },
};
