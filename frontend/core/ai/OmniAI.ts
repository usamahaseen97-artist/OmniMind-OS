import { OMNIAI_VERSION } from "./constants";
import { omniAgentManager } from "./OmniAgentManager";
import { omniAgentRegistry } from "./OmniAgentRegistry";
import { omniContextEngine } from "./OmniContextEngine";
import { omniConversationManager } from "./OmniConversationManager";
import { omniCostMonitor } from "./OmniCostMonitor";
import { omniInferenceQueue } from "./OmniInferenceQueue";
import { omniMemory } from "./OmniMemory";
import { omniModelManager } from "./OmniModelManager";
import { omniModelRouter } from "./OmniModelRouter";
import { omniPromptEngine } from "./OmniPromptEngine";
import { omniPromptLibrary } from "./OmniPromptLibrary";
import { omniProviderRegistry } from "./OmniProviderRegistry";
import { omniReasoningPipeline } from "./OmniReasoningPipeline";
import { omniResponseFormatter } from "./OmniResponseFormatter";
import { omniSafetyEngine } from "./OmniSafetyEngine";
import { omniTaskPlanner } from "./OmniTaskPlanner";
import { omniTokenManager } from "./OmniTokenManager";
import { omniWorkflowEngine } from "./OmniWorkflowEngine";
import type { AiAgentId, AiCompletionResult, AiProviderId, CompleteOptions } from "./types";

export type { CompleteOptions } from "./types";

/** OmniAI — universal AI gateway. All tools route inference through here. */
export class OmniAI {
  readonly version = OMNIAI_VERSION;

  readonly providers = omniProviderRegistry;
  readonly models = omniModelManager;
  readonly router = omniModelRouter;
  readonly tokens = omniTokenManager;
  readonly costs = omniCostMonitor;
  readonly agents = omniAgentRegistry;
  readonly agentManager = omniAgentManager;
  readonly prompts = omniPromptLibrary;
  readonly promptEngine = omniPromptEngine;
  readonly memory = omniMemory;
  readonly context = omniContextEngine;
  readonly conversations = omniConversationManager;
  readonly reasoning = omniReasoningPipeline;
  readonly tasks = omniTaskPlanner;
  readonly workflows = omniWorkflowEngine;
  readonly queue = omniInferenceQueue;
  readonly formatter = omniResponseFormatter;
  readonly safety = omniSafetyEngine;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    return this;
  }

  /** Single entry point for all AI completions — no direct provider calls in apps. */
  async complete(prompt: string, opts: CompleteOptions = {}): Promise<AiCompletionResult | null> {
    const toolSlug = opts.toolSlug ?? "*";
    const agentId = opts.agentId ?? this.agentManager.activeAgentId ?? "developer-agent";
    const safety = this.safety.checkPermission(toolSlug, agentId);
    if (!safety.allowed) return null;

    let finalPrompt = prompt;
    if (opts.templateId) {
      const rendered = this.promptEngine.render(opts.templateId, opts.templateVars ?? {});
      if (rendered) finalPrompt = rendered;
    }

    const ctx = this.context.buildSystemContext();
    if (ctx) finalPrompt = `${ctx}\n\n${finalPrompt}`;

    const { omniCoreApiClient } = await import("../omnicore/OmniCoreApiClient");
    const remote = await omniCoreApiClient.complete(finalPrompt, {
      ...opts,
      toolSlug,
      agentId,
    });
    if (remote) {
      this.tokens.record(remote.usage);
      this.costs.record({
        id: remote.jobId,
        providerId: remote.providerId,
        modelId: remote.modelId,
        agentId,
        prompt: finalPrompt.slice(0, 200),
        status: "success",
        latencyMs: remote.latencyMs,
        tokenUsage: remote.usage,
        costUsd: remote.costUsd,
        timestamp: new Date().toISOString(),
      });
      return remote;
    }

    return null;
  }

  monitoring() {
    return this.costs.snapshot();
  }
}

export const omniAI = new OmniAI();
