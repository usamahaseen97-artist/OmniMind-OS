import type { MultiAgentId } from "../types";
import type { ClinicalAgentId } from "../../clinical-intelligence/types";

export type ExtendedAgentDefinition = {
  id: MultiAgentId;
  name: string;
  description: string;
  phase2AgentId?: ClinicalAgentId;
  coordinator?: boolean;
  capabilities: string[];
  priority: number;
  parallelSafe: boolean;
};

/** Phase 5 agent registry — delegates to Phase 2 clinical agents where mapped */
export const MULTI_AGENT_REGISTRY: ExtendedAgentDefinition[] = [
  { id: "chief-medical-coordinator", name: "Chief Medical Coordinator", description: "Orchestrates multi-agent collaboration and consensus", coordinator: true, capabilities: ["orchestration", "consensus", "escalation"], priority: 100, parallelSafe: false },
  { id: "symptom-analysis", name: "Symptom Analysis Agent", description: "Structured symptom intake scaffolding", phase2AgentId: "symptom-analysis", capabilities: ["symptom-triage"], priority: 95, parallelSafe: true },
  { id: "medical-history", name: "Medical History Agent", description: "History synthesis", phase2AgentId: "medical-history", capabilities: ["history-synthesis"], priority: 90, parallelSafe: true },
  { id: "vital-signs-agent", name: "Vital Signs Agent", description: "Vital sign pattern evaluation", phase2AgentId: "vital-signs", capabilities: ["vitals-assessment"], priority: 88, parallelSafe: true },
  { id: "laboratory-agent", name: "Laboratory Agent", description: "Lab panel interpretation assist", phase2AgentId: "laboratory-interpretation", capabilities: ["lab-interpretation"], priority: 92, parallelSafe: true },
  { id: "radiology-agent", name: "Radiology Agent", description: "Imaging study context assist", phase2AgentId: "radiology-assistant", capabilities: ["imaging-assist"], priority: 85, parallelSafe: true },
  { id: "medication-safety", name: "Medication Safety Agent", description: "Medication safety review", phase2AgentId: "medication-safety", capabilities: ["medication-review"], priority: 93, parallelSafe: true },
  { id: "drug-interaction", name: "Drug Interaction Agent", description: "Cross-medication screening", phase2AgentId: "drug-interaction", capabilities: ["drug-interaction"], priority: 91, parallelSafe: true },
  { id: "clinical-guideline", name: "Clinical Guideline Agent", description: "Evidence-based guideline retrieval", phase2AgentId: "clinical-guideline", capabilities: ["guideline-lookup"], priority: 80, parallelSafe: true },
  { id: "risk-assessment", name: "Risk Assessment Agent", description: "Transparent risk scoring", phase2AgentId: "risk-assessment", capabilities: ["risk-scoring"], priority: 94, parallelSafe: false },
  { id: "emergency-triage", name: "Emergency Triage Agent", description: "Urgency indicator scaffolding — clinician escalation required", capabilities: ["triage", "urgency"], priority: 96, parallelSafe: false },
  { id: "follow-up-planning", name: "Follow-up Planning Agent", description: "Follow-up and data collection suggestions", phase2AgentId: "follow-up-recommendation", capabilities: ["follow-up-planning"], priority: 75, parallelSafe: true },
  { id: "medical-documentation", name: "Medical Documentation Agent", description: "Clinical note structuring assist", phase2AgentId: "medical-documentation", capabilities: ["documentation"], priority: 70, parallelSafe: true },
  { id: "medical-literature", name: "Medical Literature Agent", description: "Literature reference scaffolding", phase2AgentId: "medical-literature", capabilities: ["literature-search"], priority: 65, parallelSafe: true },
  { id: "hospital-workflow", name: "Hospital Workflow Agent", description: "Care pathway and workflow coordination scaffolding", capabilities: ["workflow", "pathway"], priority: 60, parallelSafe: true },
];

const byId = new Map(MULTI_AGENT_REGISTRY.map((a) => [a.id, a]));

export function getMultiAgent(id: MultiAgentId) {
  return byId.get(id);
}

export function listMultiAgents() {
  return [...MULTI_AGENT_REGISTRY];
}

export function toPhase2AgentIds(ids: MultiAgentId[]): ClinicalAgentId[] {
  return ids
    .map((id) => byId.get(id)?.phase2AgentId)
    .filter((id): id is ClinicalAgentId => !!id);
}

export function resolveAgentsForMultiRequest(requested?: MultiAgentId[]) {
  const pool = requested?.length
    ? requested.map((id) => byId.get(id)).filter(Boolean) as ExtendedAgentDefinition[]
    : MULTI_AGENT_REGISTRY.filter((a) => !a.coordinator);
  return pool;
}
