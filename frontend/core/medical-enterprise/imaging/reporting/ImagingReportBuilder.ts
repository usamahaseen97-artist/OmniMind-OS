import type { ImagingReport, AIVisionFinding } from "../types";
import { IMAGING_AI_DISCLAIMER } from "../types";

/** Structured imaging report builder */
export class ImagingReportBuilder {
  createDraft(studyId: string, patientId: string, authoredBy: string): ImagingReport {
    return {
      id: `report-${Date.now()}`,
      studyId,
      patientId,
      findings: "",
      impression: "",
      recommendations: "",
      comparison: "",
      aiSummary: "",
      clinicianNotes: "",
      attachments: [],
      status: "draft",
      authoredBy,
    };
  }

  applyAIFindings(report: ImagingReport, findings: AIVisionFinding[]) {
    report.aiSummary =
      findings.length === 0
        ? ""
        : `AI-assisted summary (${findings.length} region(s) flagged for review). ${IMAGING_AI_DISCLAIMER}\n` +
          findings.map((f) => `- ${f.label}: ${f.description} (confidence ${f.confidence.score})`).join("\n");
    return report;
  }

  finalize(report: ImagingReport, status: ImagingReport["status"] = "preliminary") {
    report.status = status;
    return report;
  }
}

let builder: ImagingReportBuilder | null = null;

export function getImagingReportBuilder(): ImagingReportBuilder {
  if (!builder) builder = new ImagingReportBuilder();
  return builder;
}
