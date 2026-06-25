import type { PatientProfile, PatientSummary, ClinicalTimelineEvent, MedicalRecordRef } from "../../../lib/medical-enterprise/types";
import { SAMPLE_PATIENTS } from "../../../lib/medical-enterprise/constants";
import { listMedicalAgents } from "../clinical-intelligence";

/** Patient service stub — future backend integration */
export const patientService = {
  async list(): Promise<PatientSummary[]> {
    return SAMPLE_PATIENTS;
  },

  async getById(id: string): Promise<PatientProfile | null> {
    const base = SAMPLE_PATIENTS.find((p) => p.id === id);
    if (!base) return null;
    return {
      ...base,
      personalInfo: { phone: "+1-555-0100", address: "123 Clinical Way" },
      familyHistory: ["Hypertension (mother)", "Type 2 diabetes (father)"],
      allergies: ["Penicillin"],
      currentMedications: ["Lisinopril 10mg daily"],
      previousDiagnoses: ["Essential hypertension"],
      previousSurgeries: ["Appendectomy 2010"],
      vaccinations: ["Influenza 2025", "COVID-19 booster 2024"],
      insurance: { provider: "OmniCare", policyId: "OC-88421" },
      emergencyContacts: [{ name: "Maria Vasquez", relation: "Spouse", phone: "+1-555-0101" }],
    };
  },
};

/** Records service stub */
export const recordsService = {
  async listByPatient(patientId: string): Promise<MedicalRecordRef[]> {
    return [
      {
        id: "rec-1",
        patientId,
        kind: "blood-test",
        title: "CBC Panel",
        capturedAt: "2026-06-15T08:00:00Z",
        status: "ready",
        source: "lab",
      },
      {
        id: "rec-2",
        patientId,
        kind: "mri",
        title: "Cardiac MRI",
        capturedAt: "2026-06-14T14:30:00Z",
        status: "reviewed",
        source: "upload",
      },
    ];
  },
};

/** Timeline service stub */
export const timelineService = {
  async getForPatient(patientId: string): Promise<ClinicalTimelineEvent[]> {
    return [
      {
        id: "tl-1",
        patientId,
        timestamp: "2026-06-15T09:00:00Z",
        category: "blood-test",
        title: "CBC results available",
        summary: "Results ready for clinical review",
        provider: "Lab Core",
      },
      {
        id: "tl-2",
        patientId,
        timestamp: "2026-06-14T15:00:00Z",
        category: "mri",
        title: "Cardiac MRI acquired",
        summary: "Study uploaded to PACS",
        provider: "Radiology",
      },
    ];
  },
};

/** Audit service stub */
export const auditService = {
  async log(action: string, resource: string, patientId?: string) {
    void patientId;
    return { ok: true, action, resource, timestamp: new Date().toISOString() };
  },
};

/** AI engine registry — delegates to Clinical Intelligence Engine */
export { clinicalIntelligenceService, listMedicalAgents } from "../clinical-intelligence";

export const aiEngineRegistry = {
  engines: listMedicalAgents().map((a) => ({
    id: a.id,
    name: a.name,
    status: "ready" as const,
    description: a.description,
  })),
  async queueAnalysis(patientId: string, engineId: string, context?: Record<string, unknown>) {
    const { clinicalIntelligenceService } = await import("../clinical-intelligence");
    const jobId = `job-${Date.now()}`;
    void clinicalIntelligenceService.analyze({
      patientId,
      agentIds: [engineId as import("../clinical-intelligence/types").ClinicalAgentId],
      requesterRole: "physician",
      ...context,
    } as import("../clinical-intelligence/types").ClinicalIntelligenceRequest);
    return {
      status: "queued" as const,
      jobId,
      disclaimer: "AI analysis requires qualified clinician review.",
    };
  },
};
