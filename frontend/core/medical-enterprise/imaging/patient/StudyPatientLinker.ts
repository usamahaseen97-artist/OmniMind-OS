import type { ImagingStudy, AIVisionFinding, ImagingReport } from "../types";
import type { ClinicalTimelineEvent } from "../../../../lib/medical-enterprise/types";

export type PatientStudyBundle = {
  study: ImagingStudy;
  timelineEvent: ClinicalTimelineEvent;
  aiFindings: AIVisionFinding[];
  report?: ImagingReport;
};

/** Links imaging studies to patient, visit, timeline, AI findings, reports */
export class StudyPatientLinker {
  private studiesByPatient = new Map<string, ImagingStudy[]>();
  private visitMap = new Map<string, string>();

  linkStudy(study: ImagingStudy, visitId?: string) {
    const list = this.studiesByPatient.get(study.patientId) ?? [];
    list.push(study);
    this.studiesByPatient.set(study.patientId, list);
    if (visitId) this.visitMap.set(study.id, visitId);
    return this.toTimelineEvent(study);
  }

  getStudiesForPatient(patientId: string) {
    return this.studiesByPatient.get(patientId) ?? [];
  }

  getVisitId(studyId: string) {
    return this.visitMap.get(studyId);
  }

  toTimelineEvent(study: ImagingStudy): ClinicalTimelineEvent {
    return {
      id: `tl-img-${study.id}`,
      patientId: study.patientId,
      timestamp: study.studyDate,
      category: study.modality === "mri" || study.modality === "ct" ? study.modality : "xray",
      title: `${study.modality.toUpperCase()} — ${study.description}`,
      summary: `${study.seriesCount} series, ${study.instanceCount} instances`,
      provider: "Radiology",
    };
  }

  bundle(study: ImagingStudy, aiFindings: AIVisionFinding[], report?: ImagingReport): PatientStudyBundle {
    return {
      study,
      timelineEvent: this.toTimelineEvent(study),
      aiFindings,
      report,
    };
  }
}

let linker: StudyPatientLinker | null = null;

export function getStudyPatientLinker(): StudyPatientLinker {
  if (!linker) linker = new StudyPatientLinker();
  return linker;
}
