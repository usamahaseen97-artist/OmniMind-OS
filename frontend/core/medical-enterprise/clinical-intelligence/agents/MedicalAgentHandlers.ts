import type {
  ConfidenceEstimate,
  ClinicalAgentFinding,
  ClinicalAgentId,
  ClinicalIntelligenceRequest,
  LabInterpretationPlaceholder,
  LabPanelInput,
  RiskScoreResult,
  StructuredSymptomReport,
  VitalSignsSnapshot,
  PatientHistoryContext,
} from "../types";
import { SYMPTOM_CATALOG } from "../symptoms/symptom-catalog";

function confidence(level: ConfidenceEstimate["level"], score: number, rationale: string): ConfidenceEstimate {
  return { level, score, rationale };
}

function baseFinding(
  agentId: ClinicalAgentId,
  agentName: string,
  partial: Partial<ClinicalAgentFinding>,
): ClinicalAgentFinding {
  return {
    agentId,
    agentName,
    summary: partial.summary ?? "",
    supportingEvidence: partial.supportingEvidence ?? [],
    confidence: partial.confidence ?? confidence("low", 0.3, "Insufficient structured data"),
    missingInformation: partial.missingInformation ?? [],
    suggestedNextQuestions: partial.suggestedNextQuestions ?? [],
    differentialConsiderations: partial.differentialConsiderations ?? [],
    urgencyIndicators: partial.urgencyIndicators ?? [],
    recommendedDataCollection: partial.recommendedDataCollection ?? [],
    structuredData: partial.structuredData ?? {},
    clinicianReviewRequired: true,
  };
}

export async function runSymptomAnalysisAgent(
  report: StructuredSymptomReport,
): Promise<ClinicalAgentFinding> {
  const labels = report.symptoms.map((s) => s.label);
  const catalogHits = SYMPTOM_CATALOG.filter((c) =>
    labels.some((l) => l.toLowerCase().includes(c.label.toLowerCase())),
  );

  const severe = report.symptoms.filter((s) => s.severity === "severe");

  return baseFinding("symptom-analysis", "Symptom Analysis Agent", {
    summary: `Structured review of ${report.symptoms.length} reported symptom(s). Clinical considerations require clinician correlation.`,
    supportingEvidence: catalogHits.map((c) => ({
      id: c.id,
      type: "agent-inference",
      label: `Catalog symptom: ${c.label}`,
    })),
    confidence: confidence(
      report.symptoms.length >= 2 ? "moderate" : "low",
      Math.min(0.85, 0.4 + report.symptoms.length * 0.1),
      "Based on structured symptom count and catalog mapping only",
    ),
    missingInformation: [
      !report.onsetPattern ? "Onset pattern not documented" : "",
      !report.aggravatingFactors?.length ? "Aggravating factors not provided" : "",
    ].filter(Boolean),
    suggestedNextQuestions: [
      "When did symptoms begin and how have they changed?",
      "Any associated constitutional symptoms?",
      "Any recent travel, exposures, or new medications?",
      ...severe.map((s) => `Clarify severity and progression of ${s.label}`),
    ],
    differentialConsiderations: [
      "Multiple non-specific presentations — broaden differential pending exam and labs",
      ...(severe.length ? ["Severe symptom reported — prioritize urgent clinical assessment pathway"] : []),
    ],
    urgencyIndicators: severe.length
      ? ["One or more severe symptoms reported — clinician should assess urgency"]
      : [],
    recommendedDataCollection: ["Vital signs", "Focused physical examination", "Directed laboratory studies"],
    structuredData: { symptomCount: report.symptoms.length, catalogMatches: catalogHits.map((c) => c.id) },
  });
}

export async function runMedicalHistoryAgent(
  history: PatientHistoryContext,
): Promise<ClinicalAgentFinding> {
  const relationships: string[] = [];
  if (history.familyHistory.length && history.pastDiagnoses.length) {
    relationships.push("Family history may contextualize personal diagnoses — clinician correlation advised");
  }
  if (history.allergies.length && history.currentMedications.length) {
    relationships.push("Allergy list should be cross-checked against current medications");
  }

  return baseFinding("medical-history", "Medical History Agent", {
    summary: `History synthesis across ${history.pastDiagnoses.length} diagnoses, ${history.familyHistory.length} family items, ${history.currentMedications.length} medications.`,
    supportingEvidence: history.pastDiagnoses.map((d, i) => ({
      id: `dx-${i}`,
      type: "patient-record",
      label: d,
    })),
    confidence: confidence("moderate", 0.65, "Structured history fields populated"),
    missingInformation: !history.lifestyleFactors.length ? ["Lifestyle factors not documented"] : [],
    suggestedNextQuestions: ["Any recent changes to medications or adherence?", "New family diagnoses since last visit?"],
    differentialConsiderations: relationships,
    recommendedDataCollection: ["Medication reconciliation", "Updated allergy verification"],
    structuredData: { relationshipFlags: relationships },
  });
}

export async function runVitalSignsAgent(vitals: VitalSignsSnapshot): Promise<ClinicalAgentFinding> {
  const flags: string[] = [];
  if (vitals.spO2 !== undefined && vitals.spO2 < 92) flags.push("SpO2 below typical review threshold — clinician assessment");
  if (vitals.heartRate !== undefined && (vitals.heartRate > 120 || vitals.heartRate < 50)) {
    flags.push("Heart rate outside typical resting range — context needed");
  }

  return baseFinding("vital-signs", "Vital Signs Agent", {
    summary: "Vital signs snapshot reviewed for pattern flags. No autonomous clinical classification applied.",
    supportingEvidence: Object.entries(vitals)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => ({ id: k, type: "patient-record" as const, label: `${k}: ${v}` })),
    confidence: confidence(Object.keys(vitals).length >= 4 ? "moderate" : "low", 0.55, "Completeness of vitals set"),
    missingInformation: !vitals.recordedAt ? ["Vital signs timestamp missing"] : [],
    suggestedNextQuestions: ["Were vitals taken at rest?", "Any orthostatic measurements available?"],
    urgencyIndicators: flags,
    structuredData: { vitals },
  });
}

export async function runMedicationSafetyAgent(
  medications: string[],
  history?: PatientHistoryContext,
): Promise<ClinicalAgentFinding> {
  const allergyOverlap = history?.allergies.filter((a) =>
    medications.some((m) => m.toLowerCase().includes(a.toLowerCase().split(" ")[0] ?? "")),
  );

  return baseFinding("medication-safety", "Medication Safety Agent", {
    summary: `Medication list review (${medications.length} items). Safety flags require pharmacist/clinician validation.`,
    confidence: confidence("moderate", 0.6, "List-based screening only"),
    missingInformation: ["Renal/hepatic function not evaluated in this pass"],
    suggestedNextQuestions: ["Any over-the-counter or herbal supplements?", "Adherence concerns?"],
    urgencyIndicators: allergyOverlap?.length
      ? ["Potential allergy-name overlap detected — verify before administration"]
      : [],
    structuredData: { medicationCount: medications.length, allergyOverlap },
  });
}

export async function runDrugInteractionAgent(medications: string[]): Promise<ClinicalAgentFinding> {
  return baseFinding("drug-interaction", "Drug Interaction Agent", {
    summary:
      medications.length < 2
        ? "Insufficient medications for interaction screening."
        : `Interaction screening architecture engaged for ${medications.length} medications. Connect pharmacy DB for live checks.`,
    confidence: confidence("low", 0.35, "Interaction database not connected in architecture phase"),
    recommendedDataCollection: ["Full medication list with doses", "Pharmacy interaction API connection"],
    structuredData: { medications, interactionCheckStatus: "architecture-only" },
  });
}

export async function runRadiologyAssistant(studyIds: string[]): Promise<ClinicalAgentFinding> {
  return baseFinding("radiology-assistant", "Radiology Assistant", {
    summary: `Imaging context prepared for ${studyIds.length} study reference(s). PACS integration required for pixel-level assist.`,
    confidence: confidence("low", 0.3, "Imaging pixels not analyzed in architecture phase"),
    recommendedDataCollection: ["DICOM study metadata", "Prior imaging comparison"],
    structuredData: { studyIds },
  });
}

export async function runFollowUpAgent(report?: StructuredSymptomReport): Promise<ClinicalAgentFinding> {
  return baseFinding("follow-up-recommendation", "Follow-up Recommendation Agent", {
    summary: "Follow-up planning scaffold generated from available encounter data.",
    suggestedNextQuestions: [
      "Schedule appropriate follow-up interval based on clinical judgment",
      ...(report?.symptoms.map((s) => `Reassess ${s.label} at follow-up`) ?? []),
    ],
    confidence: confidence("moderate", 0.5, "Template-based follow-up scaffolding"),
  });
}

export async function runDocumentationAgent(req: ClinicalIntelligenceRequest): Promise<ClinicalAgentFinding> {
  return baseFinding("medical-documentation", "Medical Documentation Agent", {
    summary: "Clinical documentation structure prepared for clinician editing.",
    structuredData: {
      sections: ["Chief complaint", "HPI", "ROS", "Assessment plan"],
      patientId: req.patientId,
    },
    confidence: confidence("high", 0.9, "Documentation scaffolding only"),
  });
}

export async function runLiteratureAgent(req: ClinicalIntelligenceRequest): Promise<ClinicalAgentFinding> {
  return baseFinding("medical-literature", "Medical Literature Agent", {
    summary: "Literature reference slots prepared. Connect institutional knowledge base for retrieval.",
    recommendedDataCollection: ["PubMed/institutional literature API credentials"],
    structuredData: { queryContext: req.symptoms?.symptoms.map((s) => s.label) ?? [] },
    confidence: confidence("low", 0.25, "Literature retrieval not connected"),
  });
}

export async function runRiskAssessmentAgent(riskResults: RiskScoreResult[]): Promise<ClinicalAgentFinding> {
  return baseFinding("risk-assessment", "Risk Assessment Agent", {
    summary: `Transparent risk scoring completed for ${riskResults.length} category(ies).`,
    structuredData: { riskResults },
    confidence: confidence("moderate", 0.6, "Rule-based transparent scoring — not predictive diagnosis"),
    differentialConsiderations: riskResults
      .filter((r) => r.level === "elevated" || r.level === "high")
      .map((r) => `${r.category} risk tier ${r.level} — clinician interpretation required`),
  });
}

export async function runGuidelineAgent(
  refs: { id: string; title: string; recommendation: string }[],
): Promise<ClinicalAgentFinding> {
  return baseFinding("clinical-guideline", "Clinical Guideline Agent", {
    summary: `${refs.length} guideline reference(s) retrieved via plugin registry.`,
    supportingEvidence: refs.map((r) => ({
      id: r.id,
      type: "guideline",
      label: r.title,
      reference: r.recommendation,
    })),
    confidence: confidence(refs.length ? "moderate" : "low", refs.length ? 0.55 : 0.2, "Guideline plugin results"),
  });
}

export async function runLabInterpretationAgent(
  placeholders: LabInterpretationPlaceholder[],
): Promise<ClinicalAgentFinding> {
  return baseFinding("laboratory-interpretation", "Laboratory Interpretation Agent", {
    summary: `Lab panel scaffolding for ${placeholders.length} panel(s). No autonomous diagnostic conclusions.`,
    structuredData: { placeholders },
    confidence: confidence("moderate", 0.5, "Structured lab placeholders only"),
    missingInformation: placeholders.flatMap((p) => p.missingContext),
    recommendedDataCollection: ["Prior lab trends", "Clinical correlation notes"],
  });
}

export function createLabPlaceholder(panel: LabPanelInput): LabInterpretationPlaceholder {
  const flagged = panel.values.filter((v) => v.flag && v.flag !== "normal" && v.flag !== "unknown");
  return {
    panelKind: panel.kind,
    summary: `${panel.kind.toUpperCase()} panel — structured interpretation placeholder for clinician review`,
    flaggedAnalytes: flagged.map((v) => v.analyte),
    interpretationSlots: panel.values.map((v) => ({
      analyte: v.analyte,
      status:
        v.flag === "critical"
          ? "requires-context"
          : v.flag === "low" || v.flag === "high"
            ? "pending-review"
            : "within-reference",
      clinicianNote: "Automated conclusion not generated — review value, trend, and clinical context",
    })),
    missingContext: flagged.length ? ["Prior values for trend analysis", "Patient clinical context"] : [],
    confidence: confidence(flagged.length ? "moderate" : "low", flagged.length ? 0.5 : 0.35, "Flag-based scaffolding"),
  };
}
