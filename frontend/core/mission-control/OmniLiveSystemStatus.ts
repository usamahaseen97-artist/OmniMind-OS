import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import { omniQuality } from "../quality/OmniQuality";
import { omniAI } from "../ai/OmniAI";
import { omniPluginEngine } from "../plugins/omnicore-platform";
import { omniPlatformSync } from "../omnicore/OmniPlatformSync";
import type { LiveSystemSnapshot, ServiceStatus } from "./types";

function browserMemory() {
  if (typeof performance === "undefined") return { used: null, total: null };
  const mem = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  if (!mem) return { used: null, total: null };
  return { used: Math.round(mem.usedJSHeapSize / 1024 / 1024), total: Math.round(mem.jsHeapSizeLimit / 1024 / 1024) };
}

function mapHealth(s: string): ServiceStatus {
  if (s === "healthy") return "online";
  if (s === "degraded") return "degraded";
  if (s === "unhealthy") return "offline";
  return "unknown";
}

/** Live system status — CPU, GPU, RAM, services, providers. */
export class OmniLiveSystemStatus {
  last: LiveSystemSnapshot | null = null;

  async refresh(): Promise<LiveSystemSnapshot> {
    const remote = await omniMissionControlApiClient.fetchSystem();
    const health = omniQuality.health.dashboard();
    const mem = browserMemory();
    const aiMon = omniAI.monitoring();
    const sync = omniPlatformSync.snapshot();

    const base: LiveSystemSnapshot = {
      cpuPercent: null,
      gpuPercent: null,
      ramUsedMb: mem.used,
      ramTotalMb: mem.total,
      storageUsedGb: null,
      storageTotalGb: null,
      networkMbps: null,
      backgroundTasks: 0,
      runningProcesses: 1,
      sdk: "online",
      api: mapHealth(health.status),
      database: mapHealth(health.services.find((s) => s.name === "database")?.status ?? "unknown"),
      gateway: mapHealth(health.services.find((s) => s.name === "ai-providers")?.status ?? "unknown"),
      aiProviders: [
        { id: "auto", status: aiMon.requestCount > 0 ? "online" : "unknown" },
        { id: "google", status: "online" },
      ],
      plugins: omniPluginEngine.registry.list().map((p) => ({
        id: p.id,
        enabled: p.enabled,
        status: (p.enabled ? "online" : "offline") as ServiceStatus,
      })),
      cloud: sync.status === "idle" && sync.lastSyncAt ? "online" : sync.status === "error" ? "degraded" : "unknown",
      updatedAt: new Date().toISOString(),
    };

    this.last = remote?.ok && remote.system ? { ...base, ...remote.system, updatedAt: new Date().toISOString() } : base;
    return this.last;
  }

  snapshot() {
    return this.last;
  }
}

export const omniLiveSystemStatus = new OmniLiveSystemStatus();
