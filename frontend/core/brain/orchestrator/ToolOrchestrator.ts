import type { AgentManager } from "../../agent/AgentManager";
import type { IntentMatch } from "../../agent/types";
import type { BrainPlan, PlannerSubtask } from "../types";
import { getOmniPluginManager } from "../../plugins";

export type OrchestrationResult = {
  navigatedTo?: string;
  workflowStarted?: string;
  toolId: string;
  events: string[];
};

/** Routes plans and intents to sovereign tools automatically. */
export class ToolOrchestrator {
  constructor(private agent: AgentManager) {}

  chooseTool(intent: IntentMatch | null, plan: BrainPlan): { toolId: string; reason: string } {
    const running = plan.subtasks.find((s) => s.status === "running");
    if (running?.toolId) {
      return { toolId: running.toolId, reason: `Plan step: ${running.label}` };
    }
    if (intent) return { toolId: intent.toolId, reason: intent.reason };
    return { toolId: plan.subtasks[0]?.toolId ?? "omniforge-engine", reason: "Default orchestration" };
  }

  async executeSubtask(
    subtask: PlannerSubtask,
    userPrompt: string,
    onNavigate?: (href: string) => void,
  ): Promise<OrchestrationResult> {
    const tool = this.agent.registry.get(subtask.toolId ?? "") ?? this.agent.registry.getBySlug(subtask.toolId ?? "");
    const plugin = getOmniPluginManager().getByToolId(tool?.id ?? subtask.toolId ?? "");
    const events: string[] = [];

    if (tool?.href) {
      onNavigate?.(tool.href);
      this.agent.memory.log({
        level: "info",
        message: `Brain orchestrating → ${tool.name} · ${subtask.label}`,
        toolId: tool.id,
      });
    }

    if (subtask.actionId && plugin) {
      const result = await getOmniPluginManager().executeAction({
        pluginId: plugin.id,
        actionId: subtask.actionId,
        toolId: plugin.toolId,
        prompt: userPrompt,
      });
      events.push(...result.events, "plugin-action");
      return {
        navigatedTo: tool?.href,
        toolId: tool?.id ?? subtask.toolId ?? "unknown",
        events,
      };
    }

    const stepPrompt = `${userPrompt}\n\n[Brain subtask: ${subtask.label}]`;
    await this.agent.promptRouter.route(stepPrompt, tool?.routeId ?? tool?.slug ?? subtask.toolId ?? "dashboard", {
      forceToolId: tool?.id,
    });
    events.push("omnimind:ecosystem-agent-prompt");

    return {
      navigatedTo: tool?.href,
      toolId: tool?.id ?? subtask.toolId ?? "unknown",
      events,
    };
  }

  async executePlan(
    plan: BrainPlan,
    userPrompt: string,
    intent: IntentMatch | null,
    onNavigate?: (href: string) => void,
  ): Promise<OrchestrationResult> {
    if (intent?.suggestedWorkflowId) {
      const tool = this.agent.registry.get(intent.toolId);
      if (tool?.href) onNavigate?.(tool.href);
      void this.agent.workflows.run(intent.suggestedWorkflowId, userPrompt, { onNavigate });
      return {
        navigatedTo: tool?.href,
        workflowStarted: intent.suggestedWorkflowId,
        toolId: intent.toolId,
        events: ["workflow"],
      };
    }

    const active = plan.subtasks.find((s) => s.status === "running") ?? plan.subtasks[0];
    if (!active) {
      return { toolId: intent?.toolId ?? "omniforge-engine", events: [] };
    }

    return this.executeSubtask(active, userPrompt, onNavigate);
  }
}
