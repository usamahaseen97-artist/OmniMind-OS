import type { AiProviderId, AiRequest, MonitoringSnapshot } from "./types";
import { omniProviderRegistry } from "./OmniProviderRegistry";

/** Cost and latency monitoring. */
export class OmniCostMonitor {
  requests: AiRequest[] = [];
  totalCostUsd = 0;

  record(req: AiRequest) {
    this.requests.unshift(req);
    if (this.requests.length > 500) this.requests.length = 500;
    this.totalCostUsd += req.costUsd;
    return req;
  }

  snapshot(): MonitoringSnapshot {
    const latencies = this.requests.map((r) => r.latencyMs).filter((n) => n > 0);
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
    const totalTokens = this.requests.reduce((s, r) => s + r.tokenUsage.totalTokens, 0);
    const providerStatus = Object.fromEntries(
      omniProviderRegistry.list().map((p) => [p.id, p.status]),
    ) as Record<AiProviderId, MonitoringSnapshot["providerStatus"][AiProviderId]>;

    return {
      latencyP50Ms: p50,
      latencyP95Ms: p95,
      totalCostUsd: this.totalCostUsd,
      totalTokens,
      requestCount: this.requests.length,
      providerStatus,
    };
  }

  history(limit = 20) {
    return this.requests.slice(0, limit);
  }
}

export const omniCostMonitor = new OmniCostMonitor();
