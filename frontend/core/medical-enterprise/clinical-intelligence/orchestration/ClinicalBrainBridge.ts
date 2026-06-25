import { getOmniMindBrain } from "../../../brain/OmniMindBrain";
import { agentsForTool } from "../../../brain/v2/AgentRegistry";
import type { ClinicalIntelligenceRequest } from "../types";

/** Bridges Clinical Intelligence Engine with OmniMind Brain */
export class ClinicalBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  pinSessionNote(patientId: string, sessionId: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Clinical AI session ${sessionId} for patient ${patientId}`);
      brain.globalMemory.rememberTool(this.toolId);
    } catch {
      /* brain optional in test */
    }
  }

  getBrainSpecialists() {
    return agentsForTool(this.toolId);
  }

  async notifyBrainProcessing(req: ClinicalIntelligenceRequest, agentIds: string[]) {
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.enhanceUnderstanding(
        `Clinical intelligence: ${agentIds.length} agents for patient ${req.patientId}`,
        [`session:${req.sessionId}`, `agents:${agentIds.join(",")}`],
      );
    } catch {
      /* non-blocking */
    }
  }

  async finalizeBrainResponse(summary: string) {
    try {
      const brain = getOmniMindBrain();
      return brain.brain2.finalize(summary, {
        id: `clinical-${Date.now()}`,
        goal: "Clinical decision support summary",
        subtasks: [],
        confidence: 0.6,
        estimatedTotalMs: 0,
        createdAt: new Date().toISOString(),
      });
    } catch {
      return summary;
    }
  }
}

let bridge: ClinicalBrainBridge | null = null;

export function getClinicalBrainBridge(): ClinicalBrainBridge {
  if (!bridge) bridge = new ClinicalBrainBridge();
  return bridge;
}
