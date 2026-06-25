import type { ClinicalAgentId } from "../types";

export type MedicalAgentDefinition = {
  id: ClinicalAgentId;
  name: string;
  description: string;
  capabilities: string[];
  requiredInputs: ("symptoms" | "history" | "vitals" | "labs" | "imaging" | "medications")[];
  priority: number;
  parallelSafe: boolean;
  brainSpecialistId?: string;
};

export const MEDICAL_CLINICAL_AGENTS: MedicalAgentDefinition[] = [
  {
    id: "symptom-analysis",
    name: "Symptom Analysis Agent",
    description: "Structured symptom intake and clinical consideration scaffolding",
    capabilities: ["symptom-triage", "follow-up-questions"],
    requiredInputs: ["symptoms"],
    priority: 95,
    parallelSafe: true,
    brainSpecialistId: "medical_specialist",
  },
  {
    id: "medical-history",
    name: "Medical History Agent",
    description: "Reviews past diagnoses, family history, surgeries, allergies, medications",
    capabilities: ["history-synthesis"],
    requiredInputs: ["history"],
    priority: 90,
    parallelSafe: true,
  },
  {
    id: "vital-signs",
    name: "Vital Signs Agent",
    description: "Evaluates vital sign patterns and stability indicators",
    capabilities: ["vitals-assessment"],
    requiredInputs: ["vitals"],
    priority: 88,
    parallelSafe: true,
  },
  {
    id: "laboratory-interpretation",
    name: "Laboratory Interpretation Agent",
    description: "Structured lab panel analysis placeholders for clinician review",
    capabilities: ["lab-interpretation"],
    requiredInputs: ["labs"],
    priority: 92,
    parallelSafe: true,
  },
  {
    id: "radiology-assistant",
    name: "Radiology Assistant",
    description: "Imaging study context and reporting assist scaffolding",
    capabilities: ["imaging-assist"],
    requiredInputs: ["imaging"],
    priority: 85,
    parallelSafe: true,
  },
  {
    id: "medication-safety",
    name: "Medication Safety Agent",
    description: "Medication list review and safety flag scaffolding",
    capabilities: ["medication-review"],
    requiredInputs: ["medications", "history"],
    priority: 93,
    parallelSafe: true,
  },
  {
    id: "drug-interaction",
    name: "Drug Interaction Agent",
    description: "Cross-medication interaction screening architecture",
    capabilities: ["drug-interaction"],
    requiredInputs: ["medications"],
    priority: 91,
    parallelSafe: true,
  },
  {
    id: "clinical-guideline",
    name: "Clinical Guideline Agent",
    description: "Evidence-based guideline retrieval via plugin registry",
    capabilities: ["guideline-lookup"],
    requiredInputs: ["symptoms", "history"],
    priority: 80,
    parallelSafe: true,
  },
  {
    id: "risk-assessment",
    name: "Risk Assessment Agent",
    description: "Transparent configurable risk scoring",
    capabilities: ["risk-scoring"],
    requiredInputs: ["history", "vitals", "labs"],
    priority: 94,
    parallelSafe: false,
  },
  {
    id: "follow-up-recommendation",
    name: "Follow-up Recommendation Agent",
    description: "Suggested follow-up questions and data collection",
    capabilities: ["follow-up-planning"],
    requiredInputs: ["symptoms"],
    priority: 75,
    parallelSafe: true,
  },
  {
    id: "medical-documentation",
    name: "Medical Documentation Agent",
    description: "Clinical note and report structuring assist",
    capabilities: ["documentation"],
    requiredInputs: ["history", "symptoms"],
    priority: 70,
    parallelSafe: true,
  },
  {
    id: "medical-literature",
    name: "Medical Literature Agent",
    description: "Literature reference scaffolding for clinician review",
    capabilities: ["literature-search"],
    requiredInputs: ["symptoms", "history"],
    priority: 65,
    parallelSafe: true,
  },
];

const byId = new Map(MEDICAL_CLINICAL_AGENTS.map((a) => [a.id, a]));

export function getMedicalAgent(id: ClinicalAgentId): MedicalAgentDefinition | undefined {
  return byId.get(id);
}

export function listMedicalAgents(): MedicalAgentDefinition[] {
  return [...MEDICAL_CLINICAL_AGENTS];
}

export function selectAgentsForRequest(
  available: Partial<Record<string, unknown>>,
  requested?: ClinicalAgentId[],
): MedicalAgentDefinition[] {
  const pool = requested?.length
    ? requested.map((id) => byId.get(id)).filter(Boolean) as MedicalAgentDefinition[]
    : MEDICAL_CLINICAL_AGENTS;

  return pool.filter((agent) =>
    agent.requiredInputs.every((input) => {
      if (input === "symptoms") return !!available.symptoms;
      if (input === "history") return !!available.history;
      if (input === "vitals") return !!available.vitals;
      if (input === "labs") return !!available.labs;
      if (input === "imaging") return !!available.imagingStudyIds;
      if (input === "medications") return !!available.medications;
      return false;
    }),
  );
}
