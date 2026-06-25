import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import type { SystemResourceSnapshot } from "./types";
import { omniAI } from "../ai/OmniAI";

function browserMemory(): { usedMb: number | null; totalMb: number | null } {
  if (typeof performance === "undefined") return { usedMb: null, totalMb: null };
  const mem = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  if (!mem) return { usedMb: null, totalMb: null };
  return {
    usedMb: Math.round(mem.usedJSHeapSize / 1024 / 1024),
    totalMb: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
  };
}

/** System Task Manager — CPU, GPU, RAM, AI usage, queues (live backend + browser). */
export class OmniSystemTaskManager {
  lastSnapshot: SystemResourceSnapshot | null = null;

  async refresh(): Promise<SystemResourceSnapshot> {
    const remote = await omniEcosystemApiClient.fetchSystem();
    const aiMon = omniAI.monitoring();
    const browser = browserMemory();

    const base: SystemResourceSnapshot = {
      cpuPercent: null,
      gpuPercent: null,
      ramUsedMb: browser.usedMb,
      ramTotalMb: browser.totalMb,
      storageUsedGb: null,
      storageTotalGb: null,
      networkMbps: null,
      aiTokensToday: aiMon.totalTokens,
      providerUsage: { auto: aiMon.requestCount },
      runningModels: ["auto"],
      workers: 1,
      processes: 1,
      renderQueue: 0,
      videoQueue: 0,
      audioQueue: 0,
      uptimeSeconds: 0,
    };

    this.lastSnapshot = remote?.ok && remote.system ? { ...base, ...remote.system } : base;
    return this.lastSnapshot;
  }

  snapshot() {
    return this.lastSnapshot;
  }
}

export const omniSystemTaskManager = new OmniSystemTaskManager();
