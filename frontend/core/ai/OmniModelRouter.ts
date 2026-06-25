import type { AiProviderId, ProviderFallbackChain, TokenUsage } from "./types";
import { DEFAULT_FALLBACK_CHAIN } from "./constants";
import { omniModelManager } from "./OmniModelManager";
import { omniProviderRegistry } from "./OmniProviderRegistry";

export type RouteRequest = {
  prompt: string;
  modelId?: string;
  providerId?: AiProviderId;
  agentId?: string;
};

export type RouteResult = {
  providerId: AiProviderId;
  modelId: string;
  adapterId: string;
  stubResponse: string;
};

/** Provider-independent model router — no app calls providers directly. */
export class OmniModelRouter {
  fallbackChain: ProviderFallbackChain = {
    primary: DEFAULT_FALLBACK_CHAIN.primary,
    fallbacks: [...DEFAULT_FALLBACK_CHAIN.fallbacks],
  };

  route(req: RouteRequest): RouteResult | null {
    const model = req.modelId
      ? omniModelManager.get(req.modelId)
      : omniModelManager.active();
    if (!model) return null;

    let providerId = req.providerId ?? model.providerId;
    const provider = omniProviderRegistry.get(providerId);
    if (!provider?.enabled || provider.status === "offline") {
      providerId = this.resolveFallback(providerId);
    }

    return {
      providerId,
      modelId: model.id,
      adapterId: `adapter-${providerId}`,
      stubResponse: `[OmniAI stub] Routed to ${providerId}/${model.id}`,
    };
  }

  private resolveFallback(failed: AiProviderId): AiProviderId {
    const chain = [this.fallbackChain.primary, ...this.fallbackChain.fallbacks];
    for (const id of chain) {
      if (id === failed) continue;
      const p = omniProviderRegistry.get(id);
      if (p?.enabled && p.status !== "offline") return id;
    }
    return "openai";
  }

  estimateTokens(text: string): TokenUsage {
    const tokens = Math.ceil(text.length / 4);
    return { inputTokens: tokens, outputTokens: 0, totalTokens: tokens };
  }
}

export const omniModelRouter = new OmniModelRouter();
