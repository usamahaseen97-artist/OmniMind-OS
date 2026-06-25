import type {
  ClinicalAISessionRecord,
  ClinicalAIResponse,
  ReasoningStep,
} from "../types";

/** In-memory reasoning audit store — replace with encrypted backend in production */
export class ReasoningAuditStore {
  private sessions = new Map<string, ClinicalAISessionRecord>();

  create(session: ClinicalAISessionRecord) {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  appendStep(sessionId: string, step: ReasoningStep) {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.reasoningSteps.push(step);
  }

  complete(sessionId: string, response: ClinicalAIResponse) {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.response = response;
    s.completedAt = new Date().toISOString();
    s.contributingAgents = response.contributingAgents;
  }

  get(sessionId: string): ClinicalAISessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  replay(sessionId: string): { steps: ReasoningStep[]; response?: ClinicalAIResponse } | null {
    const s = this.sessions.get(sessionId);
    if (!s) return null;
    return { steps: [...s.reasoningSteps], response: s.response };
  }

  listByPatient(patientId: string): ClinicalAISessionRecord[] {
    return [...this.sessions.values()].filter((s) => s.patientId === patientId);
  }
}

let store: ReasoningAuditStore | null = null;

export function getReasoningAuditStore(): ReasoningAuditStore {
  if (!store) store = new ReasoningAuditStore();
  return store;
}
