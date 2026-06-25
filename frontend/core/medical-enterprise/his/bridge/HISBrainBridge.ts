import { getOmniMindBrain } from "../../../brain/OmniMindBrain";
import type { HospitalId } from "../types";

/** Bridges HIS with OmniMind Brain, Memory, and Medical Phases 1–5 */
export class HISBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  registerHospital(hospitalId: HospitalId, name: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`HIS hospital ${name} (${hospitalId}) registered`);
      brain.globalMemory.rememberTool(this.toolId);
    } catch { /* optional */ }
  }

  async enrichPatientContext(patientId: string) {
    try {
      const brain = getOmniMindBrain();
      const { getEMRService } = await import("../emr/EMRService");
      const emr = await getEMRService().enrichFromPhases(patientId);
      brain.globalMemory.pinNote(`EMR enriched for ${patientId}: v${emr.version}, ${emr.timeline.length} timeline entries`);

      const { medicalMultiAgentPlatform } = await import("../../multi-agent");
      void medicalMultiAgentPlatform;
    } catch { /* non-blocking */ }
  }

  async notifyAdmission(patientId: string, departmentId: string) {
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.enhanceUnderstanding(`HIS admission: patient ${patientId} to ${departmentId}`, [`admission:${patientId}`]);
    } catch { /* optional */ }
  }

  rememberConsent(patientId: string, scope: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Consent scope ${scope} for patient ${patientId}`);
    } catch { /* optional */ }
  }
}

let bridge: HISBrainBridge | null = null;

export function getHISBrainBridge() {
  if (!bridge) bridge = new HISBrainBridge();
  return bridge;
}
