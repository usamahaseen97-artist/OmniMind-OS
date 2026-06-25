import type { AiProviderId, RateLimitState, SafetyCheckResult } from "./types";
import { omniProviderRegistry } from "./OmniProviderRegistry";

type AuditEntry = { id: string; action: string; allowed: boolean; reason: string | null; at: string };

/** Permission checks, rate limits, fallback, audit logging. */
export class OmniSafetyEngine {
  auditLog: AuditEntry[] = [];
  rateLimits = new Map<AiProviderId, RateLimitState>();

  constructor() {
    omniProviderRegistry.list().forEach((p) => {
      this.rateLimits.set(p.id, {
        providerId: p.id,
        requestsRemaining: 100,
        resetAt: new Date(Date.now() + 3600000).toISOString(),
      });
    });
  }

  checkPermission(toolSlug: string, agentId: string): SafetyCheckResult {
    const allowed = Boolean(toolSlug && agentId);
    const auditId = `audit-${Date.now()}`;
    const result: SafetyCheckResult = {
      allowed,
      reason: allowed ? null : "Missing tool or agent context",
      auditId,
    };
    this.auditLog.unshift({
      id: auditId,
      action: `inference:${agentId}`,
      allowed: result.allowed,
      reason: result.reason,
      at: new Date().toISOString(),
    });
    if (this.auditLog.length > 200) this.auditLog.length = 200;
    return result;
  }

  checkRateLimit(providerId: AiProviderId): boolean {
    const state = this.rateLimits.get(providerId);
    if (!state) return true;
    return state.requestsRemaining > 0;
  }

  consumeRateLimit(providerId: AiProviderId) {
    const state = this.rateLimits.get(providerId);
    if (state && state.requestsRemaining > 0) state.requestsRemaining -= 1;
  }

  recover(providerId: AiProviderId): AiProviderId | null {
    omniProviderRegistry.setStatus(providerId, "degraded");
    const fallbacks = omniProviderRegistry.byPriority().filter((p) => p.id !== providerId && p.enabled);
    return fallbacks[0]?.id ?? null;
  }

  auditTrail(limit = 20) {
    return this.auditLog.slice(0, limit);
  }
}

export const omniSafetyEngine = new OmniSafetyEngine();
