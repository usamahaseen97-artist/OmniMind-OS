import type { ActionExecutionContext, ActionExecutionResult, PluginActionDefinition } from "./types";
import { getPluginEventBus } from "./EventBus";

type RegisteredAction = PluginActionDefinition & {
  pluginId: string;
  toolId: string;
};

export type ActionExecutor = (ctx: ActionExecutionContext) => Promise<ActionExecutionResult>;

/** Registry of plugin actions — Brain executes dynamically. */
export class ActionRegistry {
  private actions = new Map<string, RegisteredAction>();
  private executors = new Map<string, ActionExecutor>();

  private key(pluginId: string, actionId: string) {
    return `${pluginId}::${actionId}`;
  }

  register(pluginId: string, toolId: string, actions: PluginActionDefinition[]) {
    for (const action of actions) {
      this.actions.set(this.key(pluginId, action.id), { ...action, pluginId, toolId });
    }
  }

  unregister(pluginId: string) {
    for (const key of [...this.actions.keys()]) {
      if (key.startsWith(`${pluginId}::`)) this.actions.delete(key);
    }
    for (const key of [...this.executors.keys()]) {
      if (key.startsWith(`${pluginId}::`)) this.executors.delete(key);
    }
  }

  setExecutor(pluginId: string, actionId: string, executor: ActionExecutor) {
    this.executors.set(this.key(pluginId, actionId), executor);
  }

  get(pluginId: string, actionId: string): RegisteredAction | undefined {
    return this.actions.get(this.key(pluginId, actionId));
  }

  listByPlugin(pluginId: string): RegisteredAction[] {
    return [...this.actions.values()].filter((a) => a.pluginId === pluginId);
  }

  listByTool(toolId: string): RegisteredAction[] {
    return [...this.actions.values()].filter((a) => a.toolId === toolId);
  }

  async execute(ctx: ActionExecutionContext): Promise<ActionExecutionResult> {
    const action = this.get(ctx.pluginId, ctx.actionId);
    if (!action) {
      return { ok: false, error: `Unknown action: ${ctx.pluginId}/${ctx.actionId}`, events: [] };
    }

    const bus = getPluginEventBus();
    bus.publish("TaskStarted", { pluginId: ctx.pluginId, taskId: ctx.actionId, label: action.label });

    const custom = this.executors.get(this.key(ctx.pluginId, ctx.actionId));
    if (custom) {
      const result = await custom(ctx);
      bus.publish("ActionExecuted", { pluginId: ctx.pluginId, actionId: ctx.actionId, ok: result.ok });
      if (result.ok) {
        bus.publish("TaskCompleted", { pluginId: ctx.pluginId, taskId: ctx.actionId, output: result.output });
      }
      return result;
    }

    const events: string[] = [];
    if (typeof window !== "undefined") {
      const prompt = ctx.prompt ?? action.command ?? action.label;
      window.dispatchEvent(
        new CustomEvent("omnimind:ecosystem-agent-prompt", {
          detail: { prompt, routeId: ctx.toolId, forceToolId: ctx.toolId },
        }),
      );
      events.push("omnimind:ecosystem-agent-prompt");
    }

    const result: ActionExecutionResult = { ok: true, output: { dispatched: true }, events };
    bus.publish("ActionExecuted", { pluginId: ctx.pluginId, actionId: ctx.actionId, ok: true });
    bus.publish("TaskCompleted", { pluginId: ctx.pluginId, taskId: ctx.actionId });
    return result;
  }
}

let registry: ActionRegistry | null = null;

export function getActionRegistry(): ActionRegistry {
  if (!registry) registry = new ActionRegistry();
  return registry;
}
