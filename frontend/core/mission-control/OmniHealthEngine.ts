import { omniQuality } from "../quality/OmniQuality";
import { omniSecurity } from "../security/OmniSecurity";
import { omniAI } from "../ai/OmniAI";
import { omniAutomationMonitor } from "../automation/OmniAutomationMonitor";
import { omniLiveSystemStatus } from "./OmniLiveSystemStatus";
import type { HealthScores } from "./types";

/** Health Engine — overall, performance, security, reliability, AI, infrastructure scores. */
export class OmniHealthEngine {
  async compute(): Promise<HealthScores> {
    const health = omniQuality.health.overallStatus();
    const sec = omniSecurity.snapshot();
    const aiMon = omniAI.monitoring();
    const autoMon = await omniAutomationMonitor.refresh();
    await omniLiveSystemStatus.refresh();

    const performance =
      health === "healthy" ? 90 : health === "degraded" ? 65 : 40;
    const security = Math.min(100, 70 + (sec.complianceScores?.[0]?.score ?? 0) / 5);
    const reliability = Math.round(autoMon.successRate * 100) || 80;
    const ai = aiMon.requestCount > 0 ? 85 : 70;
    const infrastructure = omniLiveSystemStatus.last?.api === "online" ? 88 : 55;

    const overall = Math.round((performance + security + reliability + ai + infrastructure) / 5);

    return {
      overall,
      performance,
      security: Math.round(security),
      reliability,
      ai,
      infrastructure,
    };
  }
}

export const omniHealthEngine = new OmniHealthEngine();
