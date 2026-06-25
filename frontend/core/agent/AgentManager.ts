import type { CopilotTabId, IntentMatch } from "./types";
import { ContextManager } from "./ContextManager";
import { ConversationManager } from "./ConversationManager";
import { IntentEngine } from "./IntentEngine";
import { MemoryManager } from "./MemoryManager";
import { PluginManager } from "./PluginManager";
import { PromptRouter } from "./PromptRouter";
import { TaskManager } from "./TaskManager";
import { ToolRegistry, globalToolRegistry } from "./ToolRegistry";
import { VoiceManager } from "./VoiceManager";
import { WorkflowEngine, type WorkflowRunCallbacks } from "./WorkflowEngine";

export type ProcessIntentResult = {
  intent: IntentMatch | null;
  routed: boolean;
  navigatedTo?: string;
  workflowStarted?: string;
};

export type AgentManagerConfig = {
  onNavigate?: (href: string) => void;
  onCopilotTab?: (tab: CopilotTabId) => void;
};

/** Central OmniMind Master AI orchestration engine. */
export class AgentManager {
  readonly registry: ToolRegistry;
  readonly intentEngine: IntentEngine;
  readonly memory: MemoryManager;
  readonly context: ContextManager;
  readonly conversations: ConversationManager;
  readonly tasks: TaskManager;
  readonly promptRouter: PromptRouter;
  readonly workflows: WorkflowEngine;
  readonly voice: VoiceManager;
  readonly plugins: PluginManager;

  private activeConversationId?: string;
  private copilotTab: CopilotTabId = "chat";
  private config: AgentManagerConfig = {};

  constructor(registry: ToolRegistry = globalToolRegistry) {
    this.registry = registry;
    this.memory = new MemoryManager();
    this.intentEngine = new IntentEngine(registry);
    this.context = new ContextManager(this.memory, registry);
    this.conversations = new ConversationManager();
    this.tasks = new TaskManager();
    this.promptRouter = new PromptRouter(registry, this.memory, this.context);
    this.workflows = new WorkflowEngine(
      this.intentEngine,
      this.tasks,
      registry,
      this.memory,
      this.promptRouter,
    );
    this.voice = new VoiceManager();
    this.plugins = new PluginManager(registry);
  }

  configure(config: AgentManagerConfig) {
    this.config = { ...this.config, ...config };
  }

  getCopilotTab(): CopilotTabId {
    return this.copilotTab;
  }

  setCopilotTab(tab: CopilotTabId) {
    this.copilotTab = tab;
    this.config.onCopilotTab?.(tab);
  }

  async processUserMessage(
    text: string,
    activeToolId?: string,
    routeId?: string,
  ): Promise<ProcessIntentResult> {
    const intent = this.intentEngine.resolve(text, activeToolId);
    this.memory.pushConversation("user", text);

    let conv = this.conversations.getActive(this.activeConversationId);
    if (!conv) {
      conv = this.conversations.create("Master Agent", activeToolId);
      this.activeConversationId = conv.id;
    }
    this.conversations.appendMessage(conv.id, "user", text);

    if (intent && intent.confidence >= 0.75 && intent.toolId !== activeToolId) {
      const tool = this.registry.get(intent.toolId);
      if (tool?.href) {
        this.config.onNavigate?.(tool.href);
        this.memory.log({
          level: "info",
          message: `Intent routed to ${tool.name} (${intent.reason})`,
          toolId: tool.id,
        });

        if (intent.suggestedWorkflowId) {
          void this.workflows.run(intent.suggestedWorkflowId, text, {
            onNavigate: (href) => this.config.onNavigate?.(href),
          });
          return {
            intent,
            routed: true,
            navigatedTo: tool.href,
            workflowStarted: intent.suggestedWorkflowId,
          };
        }

        await this.promptRouter.route(text, tool.routeId ?? tool.slug, { forceToolId: tool.id });
        return { intent, routed: true, navigatedTo: tool.href };
      }
    }

    await this.promptRouter.route(text, routeId ?? activeToolId ?? "dashboard", {
      forceToolId: activeToolId,
    });

    return { intent, routed: true };
  }

  async runWorkflow(workflowId: string, prompt: string, callbacks?: WorkflowRunCallbacks) {
    return this.workflows.run(workflowId, prompt, {
      ...callbacks,
      onNavigate: (href) => {
        callbacks?.onNavigate?.(href);
        this.config.onNavigate?.(href);
      },
    });
  }

  pinContext(text: string) {
    this.memory.pinContext(text);
  }

  syncWorkspace(snapshot: Parameters<ContextManager["syncFromEcosystem"]>[0]) {
    this.context.syncFromEcosystem(snapshot);
  }
}

let singleton: AgentManager | null = null;

export function getAgentManager(): AgentManager {
  if (!singleton) singleton = new AgentManager();
  return singleton;
}
