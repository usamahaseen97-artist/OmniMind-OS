/**
 * OmniMind Unified Brain — single intelligence layer for every tool (RC1).
 * Connects AI, memory, projects, assets, permissions, and cross-tool context.
 */

import { omniAI } from "../ai/OmniAI";
import type { CompleteOptions } from "../ai/OmniAI";
import type { MemoryScope } from "../ai/types";
import { omniProjectManager } from "../omnicore/OmniProjectManager";
import { omniSettings } from "../omnicore/OmniSettings";
import { omniEventBus } from "../omnicore/OmniEventBus";
import type { OmniToolSlug } from "../omnicore/types";
import { omniSecurity } from "../security/OmniSecurity";
import { omniAssets } from "../assets/OmniAssets";

export const UNIFIED_BRAIN_VERSION = "1.0.0-rc1";

export type UnifiedBrainContext = {
  version: string;
  activeProjectId: string | null;
  activeToolSlug: OmniToolSlug | null;
  memory: ReturnType<typeof omniAI.memory.list>;
  preferences: ReturnType<typeof omniSettings.list>;
  projectCount: number;
  assetCount: number;
  conversationCount: number;
  permissions: ReturnType<typeof omniSecurity.snapshot>;
};

/** OmniMindUnifiedBrain — one brain, all tools. */
export class OmniMindUnifiedBrain {
  readonly version = UNIFIED_BRAIN_VERSION;
  private booted = false;
  private toolHistory: { toolId: string; at: string }[] = [];

  boot() {
    if (this.booted) return this;
    this.booted = true;
    omniAI.boot();
    return this;
  }

  buildContext(toolSlug: OmniToolSlug | null = null): UnifiedBrainContext {
    const project = omniProjectManager.active();
    return {
      version: this.version,
      activeProjectId: project?.id ?? null,
      activeToolSlug: toolSlug ?? (project?.toolSlugs[0] as OmniToolSlug | undefined) ?? null,
      memory: omniAI.memory.list(),
      preferences: omniSettings.list(),
      projectCount: omniProjectManager.list().length,
      assetCount: omniAssets.assets.assets.length,
      conversationCount: omniAI.conversations.list().length,
      permissions: omniSecurity.snapshot(),
    };
  }

  remember(scope: MemoryScope, key: string, value: string, toolSlug?: string) {
    omniAI.memory.set(scope, key, value, { toolSlug: toolSlug ?? null });
    omniEventBus.publish("brain:sync", { source: `memory:${scope}:${key}` });
  }

  recall(scope: MemoryScope, key: string, toolSlug?: string) {
    return omniAI.memory.get(scope, key, toolSlug ?? null);
  }

  recordToolUse(toolId: string) {
    this.toolHistory.unshift({ toolId, at: new Date().toISOString() });
    if (this.toolHistory.length > 100) this.toolHistory.pop();
    omniEventBus.publish("brain:context", { toolSlug: toolId });
  }

  toolHistoryList() {
    return [...this.toolHistory];
  }

  /** Route all tool AI through OmniCore AI with shared context injection. */
  async complete(prompt: string, opts: CompleteOptions = {}) {
    const ctx = this.buildContext(opts.toolSlug ?? null);
    const enriched = `[OmniMind Brain Context]\nProject: ${ctx.activeProjectId ?? "none"}\nTool: ${ctx.activeToolSlug ?? "global"}\n\n${prompt}`;
    const result = await omniAI.complete(enriched, opts);
    omniEventBus.publish("brain:sync", { source: "complete" });
    return result;
  }

  snapshot() {
    return {
      version: this.version,
      booted: this.booted,
      context: this.buildContext(),
      toolHistory: this.toolHistoryList(),
      aiMonitoring: omniAI.monitoring(),
    };
  }
}

export const omniMindUnifiedBrain = new OmniMindUnifiedBrain();
