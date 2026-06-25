import { getOmniMindBrain } from "../../../brain/OmniMindBrain";
import { getAIVisionEngine } from "../ai-vision/AIVisionEngine";

/** Bridges imaging platform with OmniMind Brain */
export class ImagingBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  registerStudy(studyId: string, patientId: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Imaging study ${studyId} for patient ${patientId}`);
      brain.globalMemory.rememberTool(this.toolId);
    } catch {
      /* optional */
    }
  }

  async queueBrainProcessing(studyId: string, summary: string) {
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.enhanceUnderstanding(`Imaging: ${summary}`, [`study:${studyId}`]);
    } catch {
      /* non-blocking */
    }
  }
}

/** Bridges imaging AI with Clinical Intelligence radiology agent */
export class ClinicalAIImagingBridge {
  async requestRadiologyAssist(studyId: string, patientId: string) {
    const { clinicalIntelligenceService } = await import("../../clinical-intelligence");
    return clinicalIntelligenceService.analyze({
      patientId,
      requesterRole: "radiologist",
      imagingStudyIds: [studyId],
      agentIds: ["radiology-assistant"],
    });
  }

  async syncAIVisionFindings(studyId: string, modality: import("../types").ImagingModality) {
    return getAIVisionEngine().analyze({ studyId, modality });
  }
}

let brainBridge: ImagingBrainBridge | null = null;
let clinicalBridge: ClinicalAIImagingBridge | null = null;

export function getImagingBrainBridge() {
  if (!brainBridge) brainBridge = new ImagingBrainBridge();
  return brainBridge;
}

export function getClinicalAIImagingBridge() {
  if (!clinicalBridge) clinicalBridge = new ClinicalAIImagingBridge();
  return clinicalBridge;
}
