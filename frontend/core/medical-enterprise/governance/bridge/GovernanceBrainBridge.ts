import { getOmniMindBrain } from "../../../brain/OmniMindBrain";
import type { ConsentType } from "../types";

/** Bridges governance with OmniMind Brain, Memory, and Medical Phases 1–6 */
export class GovernanceBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  pinSecurityEvent(summary: string, tags: string[] = []) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Governance: ${summary}`);
      brain.globalMemory.rememberTool(this.toolId);
      void tags;
    } catch { /* optional */ }
  }

  async rememberConsent(patientId: string, type: ConsentType, granted: boolean) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Consent ${type} ${granted ? "granted" : "withdrawn"} patient ${patientId}`);
      const { getHISBrainBridge } = await import("../../his/bridge/HISBrainBridge");
      getHISBrainBridge().rememberConsent(patientId, type);
    } catch { /* non-blocking */ }
  }

  async syncAuditToMemory(eventSummary: string) {
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.enhanceUnderstanding(`Audit: ${eventSummary}`, ["governance:audit"]);
    } catch { /* optional */ }
  }
}

let bridge: GovernanceBrainBridge | null = null;

export function getGovernanceBrainBridge() {
  if (!bridge) bridge = new GovernanceBrainBridge();
  return bridge;
}
