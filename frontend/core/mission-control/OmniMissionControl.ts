import { MISSION_CONTROL_VERSION } from "./constants";
import { omniLiveSystemStatus } from "./OmniLiveSystemStatus";
import { omniAIControlCenter } from "./OmniAIControlCenter";
import { omniProjectCommandCenter } from "./OmniProjectCommandCenter";
import { omniLiveTerminals } from "./OmniLiveTerminals";
import { omniBackgroundEngine } from "./OmniBackgroundEngine";
import { omniResourceManager } from "./OmniResourceManager";
import { omniSecurityCenter } from "./OmniSecurityCenter";
import { omniSystemLogs } from "./OmniSystemLogs";
import { omniLiveAnalytics } from "./OmniLiveAnalytics";
import { omniQuickActions } from "./OmniQuickActions";
import { omniHealthEngine } from "./OmniHealthEngine";
import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import { omniProjectManager } from "../omnicore/OmniProjectManager";
import { omniSessionManager } from "../omnicore/OmniSessionManager";
import { omniPlatformSync } from "../omnicore/OmniPlatformSync";
import { omniAI } from "../ai/OmniAI";
import { QUICK_ACTIONS } from "./constants";
import type { MissionControlDashboard } from "./types";

/** OmniMissionControl — V2.0 Mission Control + AI Operating Center facade. */
export class OmniMissionControl {
  readonly version = MISSION_CONTROL_VERSION;

  readonly system = omniLiveSystemStatus;
  readonly aiCenter = omniAIControlCenter;
  readonly projects = omniProjectCommandCenter;
  readonly terminals = omniLiveTerminals;
  readonly background = omniBackgroundEngine;
  readonly resources = omniResourceManager;
  readonly security = omniSecurityCenter;
  readonly logs = omniSystemLogs;
  readonly analytics = omniLiveAnalytics;
  readonly actions = omniQuickActions;
  readonly health = omniHealthEngine;

  private booted = false;

  async boot() {
    if (this.booted) return this;
    await Promise.all([
      this.system.refresh(),
      this.resources.refresh(),
      this.logs.refresh(),
      this.terminals.refresh(),
    ]);
    this.booted = true;
    return this;
  }

  async dashboard(): Promise<MissionControlDashboard> {
    const remote = await omniMissionControlApiClient.fetchDashboard();
    if (remote?.ok) return remote.dashboard;

    const [system, health, security, backgroundJobs] = await Promise.all([
      this.system.refresh(),
      this.health.compute(),
      this.security.snapshot(),
      this.background.list(),
    ]);

    const aiMon = omniAI.monitoring();
    const sync = omniPlatformSync.snapshot();

    return {
      system,
      workspace: {
        activeProjectId: omniProjectManager.activeProjectId,
        toolCount: omniProjectManager.list().length,
        sessionId: omniSessionManager.get()?.id ?? null,
      },
      projects: this.projects.list(),
      ai: {
        agents: this.aiCenter.listAgents(),
        requestCount: aiMon.requestCount,
        latencyP50: aiMon.latencyP50Ms,
      },
      cloud: {
        syncEnabled: true,
        lastSyncAt: sync.lastSyncAt,
        status: sync.status === "error" ? "degraded" : sync.lastSyncAt ? "online" : "unknown",
      },
      security,
      health,
      backgroundJobs,
      resources: (await this.resources.refresh()) ?? {
        cpuPercent: null,
        gpuPercent: null,
        memoryMb: null,
        diskGb: null,
        bandwidthMbps: null,
        modelUsage: {},
        tokenUsage: 0,
        aiCostUsd: 0,
        cacheHitRate: null,
        workers: 0,
      },
      quickActions: [...QUICK_ACTIONS],
    };
  }

  snapshot() {
    return {
      version: this.version,
      booted: this.booted,
      system: this.system.snapshot(),
      ai: this.aiCenter.snapshot(),
      background: this.background.snapshot(),
      resources: this.resources.snapshot(),
    };
  }
}

export const omniMissionControl = new OmniMissionControl();
