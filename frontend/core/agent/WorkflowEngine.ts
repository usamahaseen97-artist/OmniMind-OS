import type { AgentWorkflow } from "./types";
import type { IntentEngine } from "./IntentEngine";
import type { MemoryManager } from "./MemoryManager";
import type { PromptRouter } from "./PromptRouter";
import type { TaskManager } from "./TaskManager";
import type { ToolRegistry } from "./ToolRegistry";

export type WorkflowRunCallbacks = {
  onStepStart?: (stepId: string, label: string) => void;
  onStepComplete?: (stepId: string) => void;
  onNavigate?: (href: string) => void;
};

/** Sequential multi-step AI workflows. */
export class WorkflowEngine {
  constructor(
    private intentEngine: IntentEngine,
    private tasks: TaskManager,
    private registry: ToolRegistry,
    private memory: MemoryManager,
    private promptRouter: PromptRouter,
  ) {}

  list(): AgentWorkflow[] {
    return this.intentEngine.listWorkflows();
  }

  get(id: string): AgentWorkflow | undefined {
    return this.intentEngine.getWorkflow(id);
  }

  async run(workflowId: string, userPrompt: string, callbacks?: WorkflowRunCallbacks): Promise<string[]> {
    const workflow = this.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

    const taskIds: string[] = [];
    this.memory.log({ level: "info", message: `Workflow started: ${workflow.name}` });

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]!;
      const task = this.tasks.enqueue(step.label, step.toolId, step.id);
      taskIds.push(task.id);
      this.tasks.setStatus(task.id, "running", Math.round((i / workflow.steps.length) * 100));
      callbacks?.onStepStart?.(step.id, step.label);

      if (workflowId === "full-stack-deploy" && i === 0 && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("omnimind:omniforge-start-wizard", { detail: { description: userPrompt } }),
        );
      }

      const tool = this.registry.get(step.toolId) ?? this.registry.getBySlug(step.toolId);
      if (tool?.href) callbacks?.onNavigate?.(tool.href);

      const prompt = step.promptTemplate
        ? `${userPrompt}\n\nStep: ${step.promptTemplate}`
        : userPrompt;

      await this.promptRouter.route(prompt, tool?.routeId ?? tool?.slug ?? step.toolId, {
        actionId: step.actionId,
        workflowStepId: step.id,
      });

      await new Promise((r) => window.setTimeout(r, 400));
      this.tasks.setStatus(task.id, "completed", 100);
      callbacks?.onStepComplete?.(step.id);
      this.memory.pushRecentTask(task.id);
    }

    this.memory.log({ level: "success", message: `Workflow completed: ${workflow.name}` });
    return taskIds;
  }
}
