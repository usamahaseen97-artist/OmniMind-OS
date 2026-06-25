import { omniAutomationApiClient } from "./OmniAutomationApiClient";
import { omniWorkflowBuilder } from "./OmniWorkflowBuilder";
import { omniWorkflowLibrary } from "./OmniWorkflowLibrary";
import type { AutomationSuggestion, WorkflowDefinition } from "./types";
import { omniEventBus } from "../omnicore/OmniEventBus";
import { omniAI } from "../ai/OmniAI";

/** AI-native automation — NL generation, suggestions, optimization. */
export class OmniAutomationAI {
  async generateFromNaturalLanguage(prompt: string): Promise<WorkflowDefinition | null> {
    const remote = await omniAutomationApiClient.generateFromNL(prompt);
    if (remote?.ok && remote.workflow) {
      omniWorkflowBuilder.workflows.unshift(remote.workflow);
      omniEventBus.publish("automation:ai-generated", { workflowId: remote.workflow.id });
      return remote.workflow;
    }
    return null;
  }

  async suggest(context?: string): Promise<AutomationSuggestion[]> {
    const remote = await omniAutomationApiClient.suggestions(context);
    if (remote?.ok) return remote.suggestions;

    const suggestions: AutomationSuggestion[] = [];
    const mon = omniAI.monitoring();
    if (mon.requestCount > 5) {
      suggestions.push({
        id: "sug-batch-ai",
        title: "Batch AI completions",
        reason: "High AI usage detected — automate repetitive prompts",
        templateId: "tpl-ai-research",
        confidence: 0.82,
      });
    }
    suggestions.push({
      id: "sug-deploy",
      title: "Auto-deploy on build success",
      reason: "Common DevOps pattern",
      templateId: "tpl-app-deploy",
      confidence: 0.75,
    });
    return suggestions;
  }

  detectRepetitivePatterns(recentActions: string[]) {
    const counts = new Map<string, number>();
    for (const a of recentActions) counts.set(a, (counts.get(a) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([, n]) => n >= 3)
      .map(([action, count]) => ({
        action,
        count,
        suggestion: `Automate "${action}" — repeated ${count} times`,
      }));
  }

  oneClickAutomate(templateId: string) {
    const wf = omniWorkflowLibrary.instantiate(templateId);
    omniWorkflowBuilder.workflows.unshift(wf);
    void omniAutomationApiClient.saveWorkflow(wf);
    return wf;
  }

  optimize(workflow: WorkflowDefinition) {
    const parallelizable = workflow.nodes.filter((n) => n.kind === "action").length > 2;
    if (parallelizable && !workflow.nodes.some((n) => n.kind === "parallel")) {
      return {
        ...workflow,
        nodes: [
          ...workflow.nodes,
          {
            id: `opt-par-${Date.now()}`,
            kind: "parallel" as const,
            label: "AI-optimized parallel block",
            config: { optimized: true },
            position: { x: 300, y: 300 },
            childIds: workflow.nodes.filter((n) => n.kind === "action").map((n) => n.id),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
    }
    return workflow;
  }
}

export const omniAutomationAI = new OmniAutomationAI();
