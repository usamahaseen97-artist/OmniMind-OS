import type { AIVisionFinding, ImagingModality } from "../types";
import { IMAGING_AI_DISCLAIMER } from "../types";
import { getModalityDefinition } from "../modalities/registry";

export type AIVisionModel = {
  id: string;
  name: string;
  modalities: ImagingModality[];
  version: string;
};

export type AIVisionAnalysisRequest = {
  studyId: string;
  seriesId?: string;
  instanceId?: string;
  modality: ImagingModality;
  modelId?: string;
};

/** AI vision engine — ROI detection scaffolding, no diagnostic conclusions */
export class AIVisionEngine {
  private models: AIVisionModel[] = [
    { id: "generic-vision", name: "Generic Vision Assist", modalities: ["dicom", "xray", "ct", "mri"], version: "0.1.0" },
    { id: "fundus-vision", name: "Fundus Assist", modalities: ["fundus"], version: "0.1.0" },
    { id: "pathology-vision", name: "Pathology Assist", modalities: ["pathology-slide"], version: "0.1.0" },
  ];

  private findings = new Map<string, AIVisionFinding[]>();

  listModels(modality?: ImagingModality) {
    if (!modality) return this.models;
    return this.models.filter((m) => m.modalities.includes(modality));
  }

  registerModel(model: AIVisionModel) {
    this.models.push(model);
  }

  async analyze(req: AIVisionAnalysisRequest): Promise<{
    jobId: string;
    findings: AIVisionFinding[];
    disclaimer: string;
  }> {
    const def = getModalityDefinition(req.modality);
    const modelId = req.modelId ?? def?.aiVisionSlot ?? "generic-vision";

    const findings: AIVisionFinding[] = [
      {
        id: `ai-${Date.now()}-1`,
        studyId: req.studyId,
        seriesId: req.seriesId,
        instanceId: req.instanceId,
        regionOfInterest: { x: 0.25, y: 0.25, width: 0.2, height: 0.2 },
        label: "Region of interest (placeholder)",
        description:
          "AI vision slot detected a review region. Connect trained model for structured findings. Clinician review required.",
        confidence: { level: "low", score: 0.35 },
        evidence: [{ source: "ai-vision-architecture", reference: modelId }],
        clinicianReviewRequired: true,
        clinicianFeedback: "pending",
      },
    ];

    this.findings.set(req.studyId, findings);

    return {
      jobId: `aiv-${Date.now()}`,
      findings,
      disclaimer: IMAGING_AI_DISCLAIMER,
    };
  }

  submitFeedback(findingId: string, studyId: string, feedback: AIVisionFinding["clinicianFeedback"], note?: string) {
    const list = this.findings.get(studyId) ?? [];
    const f = list.find((x) => x.id === findingId);
    if (f) {
      f.clinicianFeedback = feedback;
      f.feedbackNote = note;
    }
    return f;
  }

  getFindings(studyId: string) {
    return this.findings.get(studyId) ?? [];
  }
}

let engine: AIVisionEngine | null = null;

export function getAIVisionEngine(): AIVisionEngine {
  if (!engine) engine = new AIVisionEngine();
  return engine;
}
