import type { PromptRouteResult } from "./types";
import type { ContextManager } from "./ContextManager";
import type { MemoryManager } from "./MemoryManager";
import type { ToolRegistry } from "./ToolRegistry";

type RouteOptions = {
  actionId?: string;
  workflowStepId?: string;
  forceToolId?: string;
};

/** Routes prompts to the correct tool chat / action without replacing existing chat. */
export class PromptRouter {
  constructor(
    private registry: ToolRegistry,
    private memory: MemoryManager,
    private context: ContextManager,
  ) {}

  async route(text: string, routeId: string, options?: RouteOptions): Promise<PromptRouteResult> {
    const events: string[] = [];
    const tool =
      this.registry.get(options?.forceToolId ?? routeId) ??
      this.registry.getBySlug(routeId);

    const resolvedRouteId = tool?.routeId ?? routeId;
    const systemContext = this.context.buildSystemContext();
    const enriched =
      systemContext.length > 0 ? `[OmniMind Brain Context]\n${systemContext}\n\n${text}` : text;

    this.memory.pushConversation("user", text);
    this.memory.log({
      level: "info",
      message: `Prompt routed → ${tool?.name ?? routeId}`,
      toolId: tool?.id,
    });

    if (options?.actionId && tool) {
      const action = tool.actions.find((a) => a.id === options.actionId);
      if (action?.command) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("omnimind:ecosystem-command", { detail: { command: action.command } }),
          );
          events.push("omnimind:ecosystem-command");
        }
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("omnimind:ecosystem-agent-prompt", { detail: { text: enriched, routeId: resolvedRouteId } }),
      );
      events.push("omnimind:ecosystem-agent-prompt");

      window.dispatchEvent(
        new CustomEvent("omnimind:fill-prompt", { detail: { text: enriched, mode: "append" } }),
      );
      events.push("omnimind:fill-prompt");

      window.dispatchEvent(
        new CustomEvent("omnimind:master-agent-prompt", {
          detail: { text: enriched, routeId: resolvedRouteId, workflowStepId: options?.workflowStepId },
        }),
      );
      events.push("omnimind:master-agent-prompt");
    }

    return {
      toolId: tool?.id ?? routeId,
      routeId: resolvedRouteId,
      dispatched: true,
      events,
    };
  }
}
