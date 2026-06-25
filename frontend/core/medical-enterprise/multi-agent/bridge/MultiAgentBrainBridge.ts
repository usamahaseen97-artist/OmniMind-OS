import { getOmniMindBrain } from "../../../brain/OmniMindBrain";
import type { MultiAgentId } from "../types";

/** Bridges multi-agent platform with OmniMind Brain, Memory, and prior medical phases */
export class MultiAgentBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  async pinMultiAgentSession(patientId: string, sessionId: string, agentIds: MultiAgentId[]) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Multi-agent session ${sessionId} for patient ${patientId} — agents: ${agentIds.join(", ")}`);
      brain.globalMemory.rememberTool(this.toolId);
    } catch { /* optional */ }
  }

  async enrichContextFromPhases(patientId: string) {
    try {
      const brain = getOmniMindBrain();
      const { getLaboratoryService } = await import("../../laboratory/services/LaboratoryService");
      const labs = getLaboratoryService().search({ patientId }, "physician");
      if (labs.length) brain.globalMemory.pinNote(`Lab context: ${labs.length} report(s) available`);

      const { getImagingService } = await import("../../imaging/services/ImagingService");
      const imaging = getImagingService().search({ patientId }, "physician");
      if (imaging.length) brain.globalMemory.pinNote(`Imaging context: ${imaging.length} study/studies available`);
    } catch { /* non-blocking */ }
  }

  async finalizeSession(sessionId: string, summary: string) {
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.finalize(`Multi-agent: ${summary}`, {
        id: `multi-agent-${sessionId}`,
        goal: "Multi-agent clinical decision support summary",
        subtasks: [],
        confidence: 0.6,
        estimatedTotalMs: 0,
        createdAt: new Date().toISOString(),
      });
    } catch { /* optional */ }
  }

  async rememberConversation(sessionId: string, role: string, content: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`[${role}] ${content.slice(0, 120)}`);
      void sessionId;
    } catch { /* optional */ }
  }
}

let bridge: MultiAgentBrainBridge | null = null;

export function getMultiAgentBrainBridge() {
  if (!bridge) bridge = new MultiAgentBrainBridge();
  return bridge;
}
