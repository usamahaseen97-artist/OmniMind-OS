import { WORKFLOW_LIBRARY } from "./constants";
import type { WorkflowDefinition, WorkflowTemplate } from "./types";
import { omniAutomationApiClient } from "./OmniAutomationApiClient";

/** Workflow template library — Website Launch, Game Build, etc. */
export class OmniWorkflowLibrary {
  templates(): WorkflowTemplate[] {
    return [...WORKFLOW_LIBRARY];
  }

  get(templateId: string): WorkflowTemplate | null {
    return WORKFLOW_LIBRARY.find((t) => t.id === templateId) ?? null;
  }

  instantiate(templateId: string, name?: string): WorkflowDefinition {
    const tpl = this.get(templateId);
    if (!tpl) throw new Error(`Template not found: ${templateId}`);
    const now = new Date().toISOString();
    return {
      id: `wf-${Date.now()}`,
      name: name ?? tpl.name,
      description: tpl.description,
      version: 1,
      nodes: tpl.nodes.map((n) => ({ ...n, id: `${n.id}-${Date.now().toString(36)}` })),
      templateId,
      nestedWorkflowIds: [],
      schedule: tpl.nodes.find((n) => n.triggerId === "schedule")?.config?.cron as string | null ?? null,
      enabled: true,
      tags: [...tpl.tags],
      createdAt: now,
      updatedAt: now,
    };
  }

  async search(query: string) {
    const remote = await omniAutomationApiClient.listTemplates();
    const local = this.templates().filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some((tag) => tag.includes(query.toLowerCase())),
    );
    return remote?.ok ? remote.templates : local;
  }
}

export const omniWorkflowLibrary = new OmniWorkflowLibrary();
