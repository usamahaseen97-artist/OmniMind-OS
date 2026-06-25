import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import { omniAI } from "../ai/OmniAI";
import { omniLiveSystemStatus } from "./OmniLiveSystemStatus";
import type { ResourceSnapshot } from "./types";

/** Resource Manager — CPU, GPU, tokens, workers, cache. */
export class OmniResourceManager {
  last: ResourceSnapshot | null = null;

  async refresh(): Promise<ResourceSnapshot> {
    await omniLiveSystemStatus.refresh();
    const sys = omniLiveSystemStatus.last;
    const aiMon = omniAI.monitoring();

    this.last = {
      cpuPercent: sys?.cpuPercent ?? null,
      gpuPercent: sys?.gpuPercent ?? null,
      memoryMb: sys?.ramUsedMb ?? null,
      diskGb: sys?.storageUsedGb ?? null,
      bandwidthMbps: sys?.networkMbps ?? null,
      modelUsage: { auto: aiMon.requestCount },
      tokenUsage: aiMon.totalTokens,
      aiCostUsd: aiMon.totalCostUsd,
      cacheHitRate: null,
      workers: sys?.runningProcesses ?? 0,
    };
    return this.last;
  }

  snapshot() {
    return this.last;
  }
}

export const omniResourceManager = new OmniResourceManager();
