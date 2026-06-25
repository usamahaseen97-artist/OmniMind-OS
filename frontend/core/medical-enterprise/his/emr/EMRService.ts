import type {
  PatientDemographics,
  EMRRecord,
  EMRTimelineEntry,
  Encounter,
  DiagnosisRecord,
  AllergyRecord,
} from "../types";

/** Enterprise EMR/EHR — integrates Phase 3/4/5 data without duplicating services */
export class EMRService {
  private records = new Map<string, EMRRecord>();

  registerDemographics(demo: PatientDemographics) {
    const existing = this.records.get(demo.patientId);
    const base: EMRRecord = existing ?? {
      demographics: demo,
      encounters: [],
      diagnoses: [],
      procedures: [],
      allergies: [],
      vaccinations: [],
      timeline: [],
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    base.demographics = demo;
    base.updatedAt = new Date().toISOString();
    this.records.set(demo.patientId, base);
    return base;
  }

  async enrichFromPhases(patientId: string): Promise<EMRRecord> {
    let record = this.records.get(patientId);
    if (!record) {
      record = this.registerDemographics({
        patientId,
        mrn: `MRN-${patientId.slice(-6)}`,
        firstName: "Patient",
        lastName: patientId,
        dateOfBirth: "1980-01-01",
        sex: "unknown",
      });
    }

    const timeline: EMRTimelineEntry[] = [...record.timeline];

    try {
      const { getLaboratoryService } = await import("../../laboratory/services/LaboratoryService");
      const labs = getLaboratoryService().search({ patientId }, "physician");
      for (const lab of labs) {
        timeline.push({
          id: `tl-lab-${lab.id}`,
          patientId,
          timestamp: lab.collectedAt,
          category: "lab",
          title: `${lab.panelKind.toUpperCase()} Panel`,
          summary: `${lab.values.length} results — ${lab.status}`,
          sourceRef: lab.id,
        });
      }
    } catch { /* optional */ }

    try {
      const { getImagingService } = await import("../../imaging/services/ImagingService");
      const studies = getImagingService().search({ patientId }, "physician");
      for (const s of studies) {
        timeline.push({
          id: `tl-img-${s.id}`,
          patientId,
          timestamp: s.studyDate,
          category: "imaging",
          title: `${s.modality.toUpperCase()} Study`,
          summary: s.description,
          sourceRef: s.id,
        });
      }
    } catch { /* optional */ }

    try {
      const { getPatientMonitoringService } = await import("../../laboratory/monitoring/PatientMonitoringService");
      const dash = getPatientMonitoringService().getDashboard(patientId);
      for (const v of dash.vitalsTimeline.slice(-5)) {
        timeline.push({
          id: `tl-vital-${v.id}`,
          patientId,
          timestamp: v.recordedAt,
          category: "vital",
          title: v.type,
          summary: `${v.value} ${v.unit ?? ""}`.trim(),
          sourceRef: v.id,
        });
      }
      for (const o of dash.recentObservations) {
        timeline.push({
          id: `tl-ai-${o.id}`,
          patientId,
          timestamp: o.createdAt,
          category: "ai-finding",
          title: "AI Observation",
          summary: o.summary.slice(0, 120),
          sourceRef: o.reportId,
        });
      }
    } catch { /* optional */ }

    timeline.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    record.timeline = timeline;
    record.version += 1;
    record.updatedAt = new Date().toISOString();
    this.records.set(patientId, record);
    return record;
  }

  getRecord(patientId: string) {
    return this.records.get(patientId);
  }

  addEncounter(patientId: string, encounter: Encounter) {
    const record = this.records.get(patientId);
    if (!record) throw new Error("EMR not found");
    record.encounters.push(encounter);
    record.timeline.unshift({
      id: `tl-enc-${encounter.id}`,
      patientId,
      timestamp: encounter.startedAt,
      category: "encounter",
      title: encounter.type,
      summary: `Encounter ${encounter.status}`,
      sourceRef: encounter.id,
    });
    record.version += 1;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  addDiagnosis(patientId: string, dx: DiagnosisRecord) {
    const record = this.records.get(patientId);
    if (!record) throw new Error("EMR not found");
    record.diagnoses.push(dx);
    record.version += 1;
    return record;
  }

  addAllergy(patientId: string, allergy: AllergyRecord) {
    const record = this.records.get(patientId);
    if (!record) throw new Error("EMR not found");
    record.allergies.push(allergy);
    record.version += 1;
    return record;
  }

  getVersionHistory(patientId: string) {
    const record = this.records.get(patientId);
    return record ? [{ version: record.version, updatedAt: record.updatedAt }] : [];
  }
}

let service: EMRService | null = null;

export function getEMRService() {
  if (!service) service = new EMRService();
  return service;
}
