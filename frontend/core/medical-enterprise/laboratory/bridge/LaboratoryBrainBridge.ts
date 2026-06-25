import { getOmniMindBrain } from "../../../brain/OmniMindBrain";
import { getLabAIEngine } from "../ai-engine/LabAIEngine";

/** Bridges laboratory platform with OmniMind Brain and Memory Engine */
export class LaboratoryBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  registerReport(reportId: string, patientId: string, panelKind: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Lab report ${reportId} (${panelKind}) for patient ${patientId}`);
      brain.globalMemory.rememberTool(this.toolId);
    } catch {
      /* optional */
    }
  }

  async queueBrainProcessing(reportId: string, summary: string) {
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.enhanceUnderstanding(`Laboratory: ${summary}`, [`lab:${reportId}`]);
    } catch {
      /* non-blocking */
    }
  }

  rememberVitalTrend(patientId: string, vitalType: string, value: string | number) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Vital ${vitalType}=${value} patient ${patientId}`);
    } catch {
      /* optional */
    }
  }
}

/** Bridges lab AI with Clinical Intelligence agents */
export class ClinicalAILabBridge {
  async requestLabInterpretation(patientId: string, labPanels: import("../../clinical-intelligence/types").LabPanelInput[]) {
    const { clinicalIntelligenceService } = await import("../../clinical-intelligence");
    return clinicalIntelligenceService.analyze({
      patientId,
      requesterRole: "physician",
      labPanels,
      agentIds: ["laboratory-interpretation"],
    });
  }

  async requestVitalsAnalysis(patientId: string, vitals: import("../../clinical-intelligence/types").VitalSignsSnapshot) {
    const { clinicalIntelligenceService } = await import("../../clinical-intelligence");
    return clinicalIntelligenceService.analyze({
      patientId,
      requesterRole: "nurse",
      vitals,
      agentIds: ["vital-signs"],
    });
  }

  async syncLabFindings(reportId: string) {
    return getLabAIEngine().getObservations(reportId);
  }
}

/** Links lab findings with Medical Imaging Platform */
export class ImagingLabBridge {
  async linkImagingContext(patientId: string) {
    try {
      const { getImagingService } = await import("../../imaging/services/ImagingService");
      return getImagingService().search({ patientId }, "physician");
    } catch {
      return [];
    }
  }
}

let brainBridge: LaboratoryBrainBridge | null = null;
let clinicalBridge: ClinicalAILabBridge | null = null;
let imagingBridge: ImagingLabBridge | null = null;

export function getLaboratoryBrainBridge() {
  if (!brainBridge) brainBridge = new LaboratoryBrainBridge();
  return brainBridge;
}

export function getClinicalAILabBridge() {
  if (!clinicalBridge) clinicalBridge = new ClinicalAILabBridge();
  return clinicalBridge;
}

export function getImagingLabBridge() {
  if (!imagingBridge) imagingBridge = new ImagingLabBridge();
  return imagingBridge;
}
